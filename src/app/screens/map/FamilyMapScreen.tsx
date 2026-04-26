import { Text, View } from 'react-native';
import Screen from '../../../components/common/Screen';

export default function FamilyMapScreen() {
  return (
    <Screen>
      <Text className="mt-8 text-2xl font-semibold text-slate-900">Live Family Map</Text>
      <View className="mt-5 rounded-xl bg-white p-4">
        <Text className="text-slate-700">Member location pins and updates will appear here.</Text>
      </View>
    </Screen>
  );
}
