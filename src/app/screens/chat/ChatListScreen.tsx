import { Pressable, Text, View } from 'react-native';
import Screen from '../../../components/common/Screen';
import { useFamily } from '../../../features/families/FamilyProvider';

export default function ChatListScreen({ navigation }: { navigation: { navigate: (screen: string, params?: unknown) => void } }) {
  const { activeFamilyId, families } = useFamily();

  return (
    <Screen>
      <Text className="mt-8 text-2xl font-semibold text-slate-900">Family Chat</Text>
      <View className="mt-5 rounded-xl bg-white p-4">
        <Text className="text-slate-700">Active family ID: {activeFamilyId ?? 'No family selected'}</Text>
        <Text className="mt-2 text-slate-700">Open a room to send text and media in real time.</Text>
      </View>

      <Pressable
        className="mt-4 rounded-xl bg-brand px-4 py-3"
        disabled={!activeFamilyId}
        onPress={() => navigation.navigate('ChatRoom', { familyId: activeFamilyId })}
      >
        <Text className="text-center font-medium text-white">Open Active Family Room</Text>
      </Pressable>

      <View className="mt-4 rounded-xl bg-white p-4">
        <Text className="font-semibold text-slate-800">Quick room switch</Text>
        {families.map((familyItem) => (
          <Pressable
            key={familyItem.id}
            className="mt-3 rounded-xl border border-slate-200 px-4 py-3"
            onPress={() => navigation.navigate('ChatRoom', { familyId: familyItem.id })}
          >
            <Text className="text-slate-900">{familyItem.name}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
