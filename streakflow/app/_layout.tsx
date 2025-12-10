import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { AuthProvider } from '@/context/AuthContext';
import { GoalsProvider } from '@/context/GoalsContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { XPProvider } from '@/context/XPContext';
import { colors } from '@/constants/colors';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.primary,
    secondaryContainer: colors.surface,
    tertiary: colors.success,
    surface: colors.surfaceSoft,
    surfaceVariant: colors.surface,
    background: colors.background,
    error: colors.error,
    errorContainer: colors.error,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onSurface: colors.text,
    onSurfaceVariant: colors.textNormal,
    onBackground: colors.text,
    outline: colors.border,
    outlineVariant: colors.divider,
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryDark,
    secondary: colors.primary,
    secondaryContainer: colors.surfaceDark,
    tertiary: colors.success,
    surface: colors.surfaceDark,
    surfaceVariant: colors.surfaceDark,
    background: colors.backgroundDark,
    error: colors.error,
    errorContainer: colors.error,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onSurface: colors.textDark,
    onSurfaceVariant: colors.textNormalDark,
    onBackground: colors.textDark,
    outline: colors.borderDark,
    outlineVariant: colors.dividerDark,
  },
};

function RootLayoutNav() {
  const { isDark } = useTheme();
  const paperTheme = isDark ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: isDark ? colors.backgroundDark : colors.background,
          },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="goal" />
        <Stack.Screen name="focus" />
        <Stack.Screen name="ai" />
      </Stack>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <XPProvider>
          <GoalsProvider>
            <NotificationProvider>
              <RootLayoutNav />
            </NotificationProvider>
          </GoalsProvider>
        </XPProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

