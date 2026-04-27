import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/app/navigation/RootNavigator';
import { AuthProvider } from './src/features/auth/AuthProvider';
import { firebaseApp } from './src/services/firebase/app';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider firebaseApp={firebaseApp}>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
