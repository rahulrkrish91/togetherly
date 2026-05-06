import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Screen from '../../../components/common/Screen';
import { endCallSession, startCallSession } from '../../../services/calls/webrtcService';
import { useAuth } from '../../../features/auth/AuthProvider';

export default function CallScreen({ route }: { route: { params: { familyId: string } } }) {
  const { familyId } = route.params;
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [mode, setMode] = useState<'voice' | 'video'>('video');

  const handleStart = async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      const session = await startCallSession({ familyId, initiatorId: authUser.uid, mode });
      setSessionId(session.id);
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      await endCallSession(sessionId);
      setSessionId(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text className="mt-6 text-2xl font-semibold text-slate-900">{mode === 'video' ? 'Video' : 'Voice'} Call</Text>
      <Text className="mt-2 text-slate-600">WebRTC signaling scaffold for family call sessions.</Text>

      <View className="mt-4 flex-row gap-2">
        <Pressable className={`rounded-full px-4 py-2 ${mode === 'voice' ? 'bg-brand' : 'bg-slate-200'}`} onPress={() => setMode('voice')}>
          <Text className={`${mode === 'voice' ? 'text-white' : 'text-slate-700'} font-semibold`}>Voice</Text>
        </Pressable>
        <Pressable className={`rounded-full px-4 py-2 ${mode === 'video' ? 'bg-brand' : 'bg-slate-200'}`} onPress={() => setMode('video')}>
          <Text className={`${mode === 'video' ? 'text-white' : 'text-slate-700'} font-semibold`}>Video</Text>
        </Pressable>
      </View>

      <View className="mt-6 rounded-xl bg-white p-4">
        <Text className="text-slate-700">Session: {sessionId || 'Not started'}</Text>
        <Pressable className="mt-3 rounded-xl bg-brand px-4 py-3" onPress={handleStart}>
          <Text className="text-center font-medium text-white">Start Call</Text>
        </Pressable>
        <Pressable className="mt-3 rounded-xl border border-red-500 px-4 py-3" onPress={handleEnd}>
          <Text className="text-center font-medium text-red-600">End Call</Text>
        </Pressable>
      </View>

      {loading ? <ActivityIndicator className="mt-4" color="#6366F1" /> : null}
    </Screen>
  );
}
