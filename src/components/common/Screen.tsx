import { PropsWithChildren } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Screen({ children }: PropsWithChildren) {
  return <SafeAreaView className="flex-1 bg-slatebg px-4">{children}</SafeAreaView>;
}
