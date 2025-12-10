export interface User {
  id: string;
  email: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface UserProfile {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notificationsEnabled: boolean;
  aiEnabled: boolean;
  defaultGoalType: 'daily' | 'weekly' | 'monthly';
}

