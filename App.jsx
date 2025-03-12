import React, { createContext, useContext } from 'react';
import { useColorScheme, StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainScreen from './src/screens/MainScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';

export const ThemeContext = createContext(undefined);
export const useTheme = () => useContext(ThemeContext);

const Stack = createNativeStackNavigator();

console.log('App: App component is rendering');

const App = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const theme = {
    isDark: isDarkMode,
    colors: {
      background: isDarkMode ? '#121212' : '#FFFFFF',
      text: isDarkMode ? '#FFFFFF' : '#000000',
      secondaryText: isDarkMode ? '#AAAAAA' : '#666666',
      card: isDarkMode ? '#1E1E1E' : '#F5F5F5',
      cardBorder: isDarkMode ? '#333333' : '#E0E0E0',
      primary: '#0077cc',
      primaryLight: isDarkMode ? '#1a8ad4' : '#4da6ff',
      statusBar: isDarkMode ? 'light-content' : 'dark-content',
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
        <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} />
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.colors.background },
            }}
          >
            <Stack.Screen
              name="Main"
              component={MainScreen}
              options={{ title: 'Rally Nexus' }}
            />
            <Stack.Screen
              name="EventDetail"
              component={EventDetailScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </ThemeContext.Provider>
  );
};

export default App;
