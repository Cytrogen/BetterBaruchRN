import React, { createContext, useContext } from 'react';
import { useColorScheme, StatusBar, View } from 'react-native';
import ClubListScreen from './src/screens/ClubListScreen';

export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

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
        <ClubListScreen />
      </View>
    </ThemeContext.Provider>
  );
};

export default App;
