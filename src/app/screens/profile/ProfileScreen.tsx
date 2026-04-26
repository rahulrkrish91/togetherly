import { Text, View } from 'react-native';
import Screen from '../../../components/common/Screen';

export default function ProfileScreen() {
  return (
    <Screen>
      <Text className="mt-8 text-2xl font-semibold text-slate-900">Profile & Roles</Text>
      <View className="mt-5 rounded-xl bg-white p-4">
        <Text className="text-slate-700">Profile details and family role settings will go here.</Text>
      </View>
    </Screen>
  );
}
