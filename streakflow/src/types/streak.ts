export interface Streak {
  goalId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string; // ISO date string
  startDate: string; // ISO date string
}

export interface StreakStats {
  totalStreaks: number;
  activeStreaks: number;
  totalDays: number;
  longestStreak: number;
}

export interface StreakRecord {
  goalId: string;
  date: string; // ISO date string
  completed: boolean;
}

