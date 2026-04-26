import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import TabsNavigator from './TabsNavigator';
import AuthNavigator from './AuthNavigator';
import { useAuthSession } from '../../features/auth/useAuthSession';

export default function RootNavigator() {
  const { isLoading, isAuthenticated } = useAuthSession();

  return (
    <NavigationContainer>
      {isLoading ? (
        <View className="flex-1 items-center justify-center bg-slatebg">
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : isAuthenticated ? (
        <TabsNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
