import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/common';
import { colors, spacing } from '@/constants';
import { useTheme } from '@/context/ThemeContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.content}>
        <Text style={[styles.title, isDark && styles.titleDark]}>
          Streakflow
        </Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          Build consistency with your daily, weekly, and monthly goals
        </Text>
      </View>

      <View style={styles.buttons}>
        <Button
          mode="contained"
          onPress={() => router.push('/(auth)/login')}
          style={styles.button}
        >
          Login
        </Button>
        <Button
          mode="outlined"
          onPress={() => router.push('/(auth)/signup')}
          style={styles.button}
        >
          Sign Up
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  containerDark: {
    backgroundColor: colors.backgroundDark,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  titleDark: {
    color: colors.primaryLight,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textNormal,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  subtitleDark: {
    color: colors.textNormalDark,
  },
  buttons: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  button: {
    marginVertical: spacing.xs,
  },
});

