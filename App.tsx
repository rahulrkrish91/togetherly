import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/app/navigation/RootNavigator';
import { AuthProvider } from './src/features/auth/AuthProvider';
import { firebaseApp } from './src/services/firebase/app';
import { FamilyProvider } from './src/features/families/FamilyProvider';
import AppLifecycle from './src/features/system/AppLifecycle';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider firebaseApp={firebaseApp}>
        <FamilyProvider>
          <AppLifecycle />
          <RootNavigator />
        </FamilyProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
