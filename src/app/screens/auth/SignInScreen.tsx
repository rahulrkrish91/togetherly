import { Text, Pressable } from 'react-native';
import Screen from '../../../components/common/Screen';

export default function SignInScreen() {
  return (
    <Screen>
      <Text className="mt-16 text-3xl font-bold text-slate-900">Family Connection Hub</Text>
      <Text className="mt-3 text-base text-slate-600">
        Sign in with Google to create or join your family workspace.
      </Text>
      <Pressable className="mt-10 rounded-2xl bg-brand px-5 py-4">
        <Text className="text-center text-base font-semibold text-white">Continue with Google</Text>
      </Pressable>
    </Screen>
  );
}
