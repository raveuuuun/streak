export const config = {
  app: {
    name: 'Streakflow',
    version: '1.0.0',
  },
  storage: {
    keys: {
      user: '@streakflow:user',
      goals: '@streakflow:goals',
      streaks: '@streakflow:streaks',
      preferences: '@streakflow:preferences',
      focusSessions: '@streakflow:focusSessions',
    },
  },
  notifications: {
    dailyReminder: {
      id: 'daily-goal-reminder',
      title: 'Daily Goal Reminder',
      body: "Don't forget to complete your daily goals!",
    },
    streakWarning: {
      id: 'streak-warning',
      title: 'Streak Warning',
      body: "You're close to breaking your streak!",
    },
    focusReminder: {
      id: 'focus-reminder',
      title: 'Focus Time',
      body: 'Ready to focus on your goals?',
    },
  },
  focus: {
    defaultDuration: 25 * 60, // 25 minutes in seconds
    minDuration: 5 * 60, // 5 minutes
    maxDuration: 120 * 60, // 2 hours
  },
  streak: {
    warningThreshold: 1, // Days before streak breaks
    resetAfterDays: 1, // Days of inactivity before reset
  },
  ai: {
    enabled: true,
    defaultModel: 'deepseek',
    maxContextLength: 4000,
  },
} as const;

