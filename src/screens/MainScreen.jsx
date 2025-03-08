import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from './HomeScreen';
import ClubListScreen from './ClubListScreen';
import RSSScreen from './RSSScreen';
import EventsScreen from './EventsScreen';
import { useTheme } from '../../App';

const Tab = createBottomTabNavigator();

const MainScreen = () => {
  const theme = useTheme();

  return (
    <SafeAreaProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.secondaryText,
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.cardBorder,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Clubs') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Newsletter') {
              iconName = focused ? 'newspaper' : 'newspaper-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
       id="0">
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Clubs" component={ClubListScreen} />
        <Tab.Screen name="Newsletter" component={RSSScreen} />
        <Tab.Screen name="Events" component={EventsScreen} />
      </Tab.Navigator>
    </SafeAreaProvider>
  );
};

export default MainScreen;
