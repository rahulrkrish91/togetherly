import { Text, View } from 'react-native';
import Screen from '../../../components/common/Screen';

export default function CalendarScreen() {
  return (
    <Screen>
      <Text className="mt-8 text-2xl font-semibold text-slate-900">Family Calendar</Text>
      <View className="mt-5 rounded-xl bg-white p-4">
        <Text className="text-slate-700">Shared family events and categories will display here.</Text>
      </View>
    </Screen>
  );
}
