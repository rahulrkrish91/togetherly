import { Text, View } from 'react-native';
import Screen from '../../../components/common/Screen';
import { useFamily } from '../../../features/families/FamilyProvider';

export default function ChatListScreen() {
  const { activeFamilyId } = useFamily();

  return (
    <Screen>
      <Text className="mt-8 text-2xl font-semibold text-slate-900">Family Chat</Text>
      <View className="mt-5 rounded-xl bg-white p-4">
        <Text className="text-slate-700">Active family ID: {activeFamilyId ?? 'No family selected'}</Text>
        <Text className="mt-2 text-slate-700">Real-time messaging timeline will render here.</Text>
      </View>
    </Screen>
  );
}
