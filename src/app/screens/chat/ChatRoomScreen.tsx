import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Screen from '../../../components/common/Screen';
import MessageBubble from '../../../components/chat/MessageBubble';
import MessageSkeleton from '../../../components/chat/MessageSkeleton';
import {
  ChatMessage,
  loadOlderMessages,
  sendMediaMessage,
  sendTextMessage,
  subscribeLatestMessages,
  uploadMediaWithProgress,
} from '../../../services/chat/chatService';
import { useAuth } from '../../../features/auth/AuthProvider';

type UploadDraft = {
  id: string;
  uri: string;
  type: 'image' | 'video';
  progress: number;
  failed: boolean;
};

export default function ChatRoomScreen({ route }: { route: { params: { familyId: string } } }) {
  const { familyId } = route.params;
  const { authUser } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [lastCursor, setLastCursor] = useState<unknown | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [drafts, setDrafts] = useState<UploadDraft[]>([]);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeLatestMessages(
      familyId,
      (next, cursor) => {
        setMessages(next);
        setLastCursor(cursor);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, [familyId]);

  const handleSend = useCallback(async () => {
    if (!authUser || !input.trim()) return;

    setSending(true);
    try {
      await sendTextMessage({
        familyId,
        senderId: authUser.uid,
        senderLabel: authUser.displayName || authUser.phoneNumber || 'Member',
        text: input.trim(),
      });
      setInput('');
    } finally {
      setSending(false);
    }
  }, [authUser, familyId, input]);

  const loadMore = useCallback(async () => {
    if (!lastCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await loadOlderMessages(familyId, lastCursor as never);
      if (result.items.length > 0) {
        setMessages((prev) => [...prev, ...result.items]);
        setLastCursor(result.nextCursor);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [familyId, lastCursor, loadingMore]);

  const upsertDraft = (id: string, patch: Partial<UploadDraft>) => {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const finalizeDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const uploadMedia = async (uri: string, type: 'image' | 'video') => {
    if (!authUser) return;

    const draftId = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setDrafts((prev) => [...prev, { id: draftId, uri, type, progress: 0, failed: false }]);

    const path = `chat/${familyId}/${authUser.uid}/${draftId}`;

    uploadMediaWithProgress(
      uri,
      path,
      (progress) => upsertDraft(draftId, { progress }),
      () => upsertDraft(draftId, { failed: true }),
      async (downloadUrl) => {
        try {
          await sendMediaMessage({
            familyId,
            senderId: authUser.uid,
            senderLabel: authUser.displayName || authUser.phoneNumber || 'Member',
            type,
            mediaUrl: downloadUrl,
          });
          finalizeDraft(draftId);
        } catch {
          upsertDraft(draftId, { failed: true });
        }
      }
    );
  };

  const pickMedia = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    if (asset.type === 'image') {
      const compressed = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1280 } }],
        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
      );
      await uploadMedia(compressed.uri, 'image');
      return;
    }

    await uploadMedia(asset.uri, 'video');
  }, [uploadMedia]);

  const retryDraft = async (draft: UploadDraft) => {
    upsertDraft(draft.id, { failed: false, progress: 0 });
    await uploadMedia(draft.uri, draft.type);
    finalizeDraft(draft.id);
  };

  const listData = useMemo(
    () => [...messages, ...drafts.map((d) => ({ id: `draft_${d.id}`, type: 'text', text: '' } as ChatMessage))],
    [messages, drafts]
  );

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
        className="flex-1"
      >
        <Text className="mt-3 text-lg font-semibold text-slate-900">Family Chat Room</Text>

        {loading ? (
          <View className="mt-4">
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton />
          </View>
        ) : (
          <FlatList
            data={listData}
            keyExtractor={(item) => item.id}
            className="mt-3 flex-1"
            inverted
            onEndReachedThreshold={0.2}
            onEndReached={loadMore}
            ListFooterComponent={loadingMore ? <ActivityIndicator /> : null}
            renderItem={({ item }) => {
              if (item.id.startsWith('draft_')) {
                const draft = drafts.find((d) => `draft_${d.id}` === item.id);
                if (!draft) return null;
                return (
                  <View className="mb-2 self-end rounded-2xl bg-indigo-50 px-3 py-2">
                    <Text className="text-sm text-slate-700">
                      Uploading {draft.type}... {draft.progress}%
                    </Text>
                    {draft.failed ? (
                      <Pressable onPress={() => retryDraft(draft)}>
                        <Text className="mt-1 text-sm font-semibold text-red-600">Retry upload</Text>
                      </Pressable>
                    ) : null}
                  </View>
                );
              }

              return <MessageBubble message={item} isMine={item.senderId === authUser?.uid} />;
            }}
          />
        )}

        <View className="mb-2 mt-2 flex-row items-center gap-2">
          <Pressable className="rounded-xl border border-brand px-3 py-3" onPress={pickMedia}>
            <Text className="font-medium text-brand">+ Media</Text>
          </Pressable>
          <TextInput
            className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3"
            placeholder="Write a message"
            value={input}
            onChangeText={setInput}
          />
          <Pressable
            className="rounded-xl bg-brand px-4 py-3"
            onPress={handleSend}
            disabled={sending || !input.trim()}
          >
            {sending ? <ActivityIndicator color="#fff" /> : <Text className="font-semibold text-white">Send</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
