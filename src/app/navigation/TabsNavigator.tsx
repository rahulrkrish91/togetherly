import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MessageCircle, CalendarDays, MapPin, User, House } from 'lucide-react-native';
import ChatListScreen from '../screens/chat/ChatListScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import FamilyMapScreen from '../screens/map/FamilyMapScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import FamilySwitcherScreen from '../screens/family/FamilySwitcherScreen';

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366F1',
      }}
    >
      <Tab.Screen
        name="Families"
        component={FamilySwitcherScreen}
        options={{ tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatListScreen}
        options={{ tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Map"
        component={FamilyMapScreen}
        options={{ tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}
