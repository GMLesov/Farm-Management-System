import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4CAF50', // Green for farm theme
    secondary: '#FF9800', // Orange for accent
    surface: '#FFFFFF',
    background: '#F5F5F5',
    error: '#F44336',
    onSurface: '#000000',
    onBackground: '#000000',
  },
};

export default theme;