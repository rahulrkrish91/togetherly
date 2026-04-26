import { Text, View } from 'react-native';
import Screen from '../../../components/common/Screen';

export default function ChatListScreen() {
  return (
    <Screen>
      <Text className="mt-8 text-2xl font-semibold text-slate-900">Family Chat</Text>
      <View className="mt-5 rounded-xl bg-white p-4">
        <Text className="text-slate-700">Real-time messaging timeline will render here.</Text>
      </View>
    </Screen>
  );
}
