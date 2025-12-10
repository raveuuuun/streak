import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '@/constants/config';

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error reading from storage: ${key}`, error);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to storage: ${key}`, error);
      throw error;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from storage: ${key}`, error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage', error);
      throw error;
    }
  },

  // Convenience methods for app-specific keys
  async getUser() {
    return this.get(config.storage.keys.user);
  },

  async setUser(user: any) {
    return this.set(config.storage.keys.user, user);
  },

  async getGoals() {
    return this.get(config.storage.keys.goals);
  },

  async setGoals(goals: any) {
    return this.set(config.storage.keys.goals, goals);
  },

  async getStreaks() {
    return this.get(config.storage.keys.streaks);
  },

  async setStreaks(streaks: any) {
    return this.set(config.storage.keys.streaks, streaks);
  },

  async getPreferences() {
    return this.get(config.storage.keys.preferences);
  },

  async setPreferences(preferences: any) {
    return this.set(config.storage.keys.preferences, preferences);
  },

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys];
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  },
};

