import { Pressable, Text, View } from 'react-native';
import { MessageCirclePlus } from 'lucide-react-native';
import Screen from '../../../components/common/Screen';
import { useFamily } from '../../../features/families/FamilyProvider';

export default function ChatListScreen({
  navigation,
}: {
  navigation: { navigate: (screen: string, params?: unknown) => void };
}) {
  const { activeFamilyId, families } = useFamily();

  return (
    <Screen>
      <Text className="mt-7 text-3xl font-bold text-slate-900">Chats</Text>
      <Text className="mt-1 text-sm text-slate-500">Family conversations, updates, and quick check-ins.</Text>

      <View className="mt-5 gap-3">
        {families.map((familyItem, index) => {
          const isOnline = index % 2 === 0;
          return (
            <Pressable
              key={familyItem.id}
              className="rounded-3xl border border-white/60 bg-white/70 p-4 shadow-sm"
              onPress={() =>
                navigation.navigate('ChatRoom', {
                  familyId: familyItem.id,
                  title: familyItem.name,
                  lastSeen: isOnline ? 'Online now' : 'Last seen 9:41 PM',
                })
              }
            >
              <View className="flex-row items-center gap-3">
                <View className="relative">
                  <View className="h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
                    <Text className="text-lg font-semibold text-indigo-700">
                      {(familyItem.name?.[0] || 'F').toUpperCase()}
                    </Text>
                  </View>
                  <View
                    className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-base font-bold text-slate-900">{familyItem.name}</Text>
                  <Text className="mt-1 text-sm text-slate-500" numberOfLines={1}>
                    {isOnline
                      ? 'Let’s finalize dinner plan for tonight 🍲'
                      : 'Shared 4 photos in this family room'}
                  </Text>
                </View>

                {activeFamilyId === familyItem.id ? (
                  <View className="rounded-full bg-indigo-100 px-2 py-1">
                    <Text className="text-xs font-semibold text-indigo-700">Active</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        className="absolute bottom-8 right-6 h-14 w-14 items-center justify-center rounded-full bg-brand shadow-lg"
        onPress={() => {}}
      >
        <MessageCirclePlus color="#fff" size={22} />
      </Pressable>
    </Screen>
  );
}
