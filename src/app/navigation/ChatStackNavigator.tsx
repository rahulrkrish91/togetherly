import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatRoomScreen from '../screens/chat/ChatRoomScreen';
import CallScreen from '../screens/chat/CallScreen';

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: { familyId: string; title?: string; lastSeen?: string };
  Call: { familyId: string };
};

const Stack = createNativeStackNavigator<ChatStackParamList>();

export default function ChatStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Call" component={CallScreen} options={{ title: 'Family Call' }} />
    </Stack.Navigator>
  );
}
