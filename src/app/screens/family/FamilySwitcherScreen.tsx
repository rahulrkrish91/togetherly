import { Text, View, Pressable } from 'react-native';
import Screen from '../../../components/common/Screen';

export default function FamilySwitcherScreen() {
  return (
    <Screen>
      <Text className="mt-8 text-2xl font-semibold text-slate-900">Your Families</Text>
      <View className="mt-5 rounded-xl bg-white p-4">
        <Text className="text-slate-700">Create, join, and switch active families.</Text>
      </View>
      <Pressable className="mt-4 rounded-xl border border-brand px-4 py-3">
        <Text className="text-center font-medium text-brand">Create New Family</Text>
      </Pressable>
    </Screen>
  );
}
