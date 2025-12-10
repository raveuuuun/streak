import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { storage } from '@/lib/storage';
import { config } from '@/constants/config';
import type { UserPreferences } from '@/types/user';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationContextType {
  enabled: boolean;
  setEnabled: (enabled: boolean) => Promise<void>;
  scheduleDailyReminder: () => Promise<void>;
  scheduleStreakWarning: (goalId: string, daysLeft: number) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabled, setEnabledState] = useState(false);

  useEffect(() => {
    loadPreferences();
    requestPermissions();
  }, []);

  const loadPreferences = async () => {
    try {
      const preferences = await storage.getPreferences<UserPreferences>();
      if (preferences?.notificationsEnabled !== undefined) {
        setEnabledState(preferences.notificationsEnabled);
      } else {
        setEnabledState(true); // Default to enabled
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      setEnabledState(false);
    }
  };

  const setEnabled = async (newEnabled: boolean) => {
    setEnabledState(newEnabled);
    try {
      const preferences = await storage.getPreferences<UserPreferences>() || {};
      await storage.setPreferences({
        ...preferences,
        notificationsEnabled: newEnabled,
      });
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  };

  const scheduleDailyReminder = async () => {
    if (!enabled) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: config.notifications.dailyReminder.title,
        body: config.notifications.dailyReminder.body,
        sound: true,
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  };

  const scheduleStreakWarning = async (goalId: string, daysLeft: number) => {
    if (!enabled) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: config.notifications.streakWarning.title,
        body: config.notifications.streakWarning.body,
        sound: true,
        data: { goalId },
      },
      trigger: {
        seconds: daysLeft * 24 * 60 * 60, // Convert days to seconds
      },
    });
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  return (
    <NotificationContext.Provider
      value={{
        enabled,
        setEnabled,
        scheduleDailyReminder,
        scheduleStreakWarning,
        cancelAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

