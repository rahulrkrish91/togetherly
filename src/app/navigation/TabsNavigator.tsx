import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { MessageCircle, CalendarDays, MapPin, User, House } from 'lucide-react-native';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import FamilyMapScreen from '../screens/map/FamilyMapScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import FamilySwitcherScreen from '../screens/family/FamilySwitcherScreen';
import ChatStackNavigator from './ChatStackNavigator';

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
        component={ChatStackNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'ChatList';
          const hideTabBar = routeName === 'ChatRoom';
          return {
            tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
            tabBarStyle: hideTabBar ? { display: 'none' } : undefined,
          };
        }}
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
