import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input } from '@/components/common';
import { colors, spacing } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { validateEmail, validatePassword } from '@/lib/utils/validation';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuth();
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleSignUp = async () => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const result = await signUp(email, password);
      
      // Check if email confirmation is required
      if (result.user && !result.session) {
        Alert.alert(
          'Check Your Email',
          'We sent you a confirmation email. Please check your inbox and click the confirmation link to activate your account.',
          [{ text: 'OK', onPress: () => router.push('/(auth)/login') }]
        );
      } else {
        // User is automatically signed in
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Could not create account');
    }
  };

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, isDark && styles.titleDark]}>Sign Up</Text>
      <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
        Create an account to get started
      </Text>

      <View style={styles.form}>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          disabled={loading}
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
          helperText="At least 8 characters with uppercase, lowercase, and number"
          disabled={loading}
        />

        <Input
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          error={errors.confirmPassword}
          disabled={loading}
        />

        <Button
          mode="contained"
          onPress={handleSignUp}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Sign Up
        </Button>

        <Button
          mode="text"
          onPress={() => router.push('/(auth)/login')}
          disabled={loading}
        >
          Already have an account? Login
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerDark: {
    backgroundColor: colors.backgroundDark,
  },
  content: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  titleDark: {
    color: colors.textDark,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  subtitleDark: {
    color: colors.textSecondaryDark,
  },
  form: {
    marginTop: spacing.lg,
  },
  button: {
    marginTop: spacing.md,
  },
});

