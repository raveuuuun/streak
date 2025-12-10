import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ScrollView, Switch, Alert, Share, Platform, Animated } from 'react-native';
import { colors, spacing, borderRadius } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useNotifications } from '@/context/NotificationContext';
import { useGoals } from '@/context/GoalsContext';
import { useXP } from '@/context/XPContext';
import { Button } from '@/components/common';
import { useRouter } from 'expo-router';
import { storage } from '@/lib/storage';
import { config } from '@/constants/config';
import * as Notifications from 'expo-notifications';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { theme, isDark, setTheme } = useTheme();
  const { enabled: notificationsEnabled, setEnabled: setNotificationsEnabled } = useNotifications();
  const { goals, reloadGoals } = useGoals();
  const { totalXP, reloadXP } = useXP();
  const [focusSoundEnabled, setFocusSoundEnabled] = useState(true);
  const [focusVibrationEnabled, setFocusVibrationEnabled] = useState(true);
  const [displayXP, setDisplayXP] = useState(0);
  const animatedXP = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadFocusPreferences();
  }, []);

  useEffect(() => {
    // Animate XP counter
    Animated.timing(animatedXP, {
      toValue: totalXP,
      duration: 800,
      useNativeDriver: false,
    }).start();

    // Update display value
    const listener = animatedXP.addListener(({ value }) => {
      setDisplayXP(Math.floor(value));
    });

    return () => {
      animatedXP.removeListener(listener);
    };
  }, [totalXP]);

  const getMotivationalMessage = (xp: number): string => {
    if (xp === 0) return "Start your journey today!";
    if (xp < 50) return "Great start! Keep pushing forward!";
    if (xp < 100) return "You're building momentum!";
    if (xp < 200) return "Your focus is paying off!";
    if (xp < 500) return "Incredible progress! Keep going!";
    return "You're unstoppable! Amazing work!";
  };

  const getNextLevelXP = (currentXP: number): number => {
    // Simple leveling: every 100 XP is a level
    return Math.ceil((currentXP + 1) / 100) * 100;
  };

  const getCurrentLevelXP = (currentXP: number): number => {
    // Current level starts at multiples of 100
    return Math.floor(currentXP / 100) * 100;
  };

  const getProgressPercentage = (currentXP: number): number => {
    const currentLevelXP = getCurrentLevelXP(currentXP);
    const nextLevelXP = getNextLevelXP(currentXP);
    const progress = currentXP - currentLevelXP;
    const totalNeeded = nextLevelXP - currentLevelXP;
    return totalNeeded > 0 ? (progress / totalNeeded) * 100 : 0;
  };

  const loadFocusPreferences = async () => {
    try {
      const preferences = await storage.getPreferences();
      if (preferences) {
        setFocusSoundEnabled(preferences.focusSoundEnabled !== false);
        setFocusVibrationEnabled(preferences.focusVibrationEnabled !== false);
      }
    } catch (error) {
      console.error('Error loading focus preferences:', error);
    }
  };

  const saveFocusPreferences = async (sound: boolean, vibration: boolean) => {
    try {
      const preferences = await storage.getPreferences() || {};
      await storage.setPreferences({
        ...preferences,
        focusSoundEnabled: sound,
        focusVibrationEnabled: vibration,
      });
    } catch (error) {
      console.error('Error saving focus preferences:', error);
    }
  };

  const handleSoundToggle = async (value: boolean) => {
    setFocusSoundEnabled(value);
    await saveFocusPreferences(value, focusVibrationEnabled);
  };

  const handleVibrationToggle = async (value: boolean) => {
    setFocusVibrationEnabled(value);
    await saveFocusPreferences(focusSoundEnabled, value);
  };

  const handleExportGoals = async () => {
    try {
      const exportData = {
        goals,
        exportDate: new Date().toISOString(),
        version: config.app.version,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      
      if (Platform.OS === 'web') {
        // For web, create a download link
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `streakflow-goals-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert('Success', 'Goals exported successfully!');
      } else {
        // For mobile, use Share API
        const result = await Share.share({
          message: jsonString,
          title: 'Streakflow Goals Export',
        });
        
        if (result.action === Share.sharedAction) {
          Alert.alert('Success', 'Goals exported successfully!');
        }
      }
    } catch (error) {
      console.error('Error exporting goals:', error);
      Alert.alert('Error', 'Failed to export goals. Please try again.');
    }
  };

  const handleResetAll = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your goals, streaks, focus sessions, reminders, notes, and all other data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              // Cancel all notifications
              await Notifications.cancelAllScheduledNotificationsAsync();
              
              // Get all keys to find all @streakflow: keys
              const allKeys = await storage.getAllKeys();
              const streakflowKeys = allKeys.filter(key => 
                key.startsWith('@streakflow:') && key !== config.storage.keys.user
              );
              
              // Remove all @streakflow: keys except user (to keep user logged in)
              // This includes goals, streaks, focusSessions, goalDetails, goalReminder, goalCalendar, and preferences
              for (const key of streakflowKeys) {
                await storage.remove(key);
              }
              
              // Also explicitly clear the main storage keys to be absolutely sure
              await storage.remove(config.storage.keys.goals);
              await storage.remove(config.storage.keys.streaks);
              await storage.remove(config.storage.keys.focusSessions);
              await storage.remove(config.storage.keys.preferences);
              await storage.remove('@streakflow:userXP');
              
              // Clear any remaining goal-related keys that might exist
              const remainingKeys = await storage.getAllKeys();
              const remainingStreakflowKeys = remainingKeys.filter(key => 
                key.startsWith('@streakflow:') &&
                (key.includes('goalDetails') || 
                 key.includes('goalReminder') || 
                 key.includes('goalCalendar'))
              );
              
              for (const key of remainingStreakflowKeys) {
                await storage.remove(key);
              }
              
              // Reset preferences to defaults (keep theme preference if user wants)
              const defaultPreferences = {
                theme: 'auto',
                notificationsEnabled: true,
                focusSoundEnabled: true,
                focusVibrationEnabled: true,
              };
              await storage.setPreferences(defaultPreferences);
              
              // Reload goals and XP context to update UI
              await reloadGoals();
              await reloadXP();
              
              Alert.alert('Success', 'All data has been reset.', [
                {
                  text: 'OK',
                  onPress: () => {
                    // Navigate to dashboard to show empty state
                    router.replace('/(tabs)');
                  },
                },
              ]);
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert('Error', 'Failed to reset data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/welcome');
  };

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, isDark && styles.titleDark]}>Settings</Text>

      <View style={[styles.xpCard, isDark && styles.xpCardDark]}>
        <Text style={[styles.xpNumber, isDark && styles.xpNumberDark]}>
          {displayXP} XP
        </Text>
        <Text style={[styles.xpMessage, isDark && styles.xpMessageDark]}>
          {getMotivationalMessage(totalXP)}
        </Text>
        <View style={styles.xpProgressContainer}>
          <View style={[styles.xpProgressBar, isDark && styles.xpProgressBarDark]}>
            <View
              style={[
                styles.xpProgressFill,
                {
                  width: `${getProgressPercentage(displayXP)}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.xpProgressText, isDark && styles.xpProgressTextDark]}>
            {totalXP - getCurrentLevelXP(totalXP)} / {getNextLevelXP(totalXP) - getCurrentLevelXP(totalXP)} to next level
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          Appearance
        </Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>
            Theme
          </Text>
          <View style={styles.themeOptions}>
            <Button
              mode={theme === 'light' ? 'contained' : 'outlined'}
              onPress={() => setTheme('light')}
              compact
            >
              Light
            </Button>
            <Button
              mode={theme === 'dark' ? 'contained' : 'outlined'}
              onPress={() => setTheme('dark')}
              compact
            >
              Dark
            </Button>
            <Button
              mode={theme === 'auto' ? 'contained' : 'outlined'}
              onPress={() => setTheme('auto')}
              compact
            >
              Auto
            </Button>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          Notifications
        </Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>
            Enable Notifications
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.background}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          Focus Mode
        </Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>
            Sound
          </Text>
          <Switch
            value={focusSoundEnabled}
            onValueChange={handleSoundToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.background}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>
            Vibration
          </Text>
          <Switch
            value={focusVibrationEnabled}
            onValueChange={handleVibrationToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.background}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          Data
        </Text>
        <Button
          mode="outlined"
          onPress={handleExportGoals}
          style={styles.dataButton}
          icon="download"
        >
          Export Goals to JSON
        </Button>
        <Button
          mode="outlined"
          onPress={handleResetAll}
          style={[styles.dataButton, styles.resetButton]}
          icon="alert-circle"
        >
          Reset All Data
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          Account
        </Text>
        <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>
          {user?.email}
        </Text>
        <Button
          mode="outlined"
          onPress={handleSignOut}
          style={styles.signOutButton}
        >
          Sign Out
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
    padding: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xl,
  },
  titleDark: {
    color: colors.textDark,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionTitleDark: {
    color: colors.textDark,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  settingLabelDark: {
    color: colors.textDark,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  signOutButton: {
    marginTop: spacing.md,
  },
  dataButton: {
    marginBottom: spacing.md,
  },
  resetButton: {
    borderColor: colors.error,
  },
  xpCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  xpCardDark: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.borderDark,
  },
  xpNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.success,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -1,
  },
  xpNumberDark: {
    color: colors.success,
  },
  xpMessage: {
    fontSize: 16,
    color: colors.textNormal,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontWeight: '500',
  },
  xpMessageDark: {
    color: colors.textNormalDark,
  },
  xpProgressContainer: {
    marginTop: spacing.md,
  },
  xpProgressBar: {
    height: 8,
    backgroundColor: colors.divider,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  xpProgressBarDark: {
    backgroundColor: colors.dividerDark,
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: borderRadius.full,
  },
  xpProgressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  xpProgressTextDark: {
    color: colors.textSecondaryDark,
  },
});

