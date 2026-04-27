import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Screen from '../../../components/common/Screen';
import { useAuth } from '../../../features/auth/AuthProvider';

export default function ProfileScreen() {
  const { authUser, logout, isLoading } = useAuth();

  return (
    <Screen>
      <Text className="mt-8 text-2xl font-semibold text-slate-900">Profile & Roles</Text>
      <View className="mt-5 rounded-xl bg-white p-4">
        <Text className="text-slate-700">Signed in as: {authUser?.phoneNumber || authUser?.email || '—'}</Text>
      </View>

      <Pressable className="mt-4 rounded-xl bg-slate-900 px-4 py-3" onPress={logout} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-center font-medium text-white">Sign out</Text>
        )}
      </Pressable>
    </Screen>
  );
}
