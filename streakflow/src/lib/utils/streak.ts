import type { Streak, StreakRecord } from '@/types/streak';
import {
  getToday,
  isToday,
  isYesterday,
  isConsecutiveDay,
  getDaysDifference,
} from './date';

/**
 * Calculate current streak based on completion records
 */
export const calculateStreak = (
  records: StreakRecord[],
  lastCompletedDate?: string
): number => {
  if (!lastCompletedDate) return 0;

  const today = getToday();
  const sortedRecords = records
    .filter((r) => r.completed)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sortedRecords.length === 0) return 0;

  // Check if last completion was today or yesterday
  const lastRecord = sortedRecords[0];
  if (!isToday(lastRecord.date) && !isYesterday(lastRecord.date)) {
    return 0; // Streak broken
  }

  let streak = 1;
  let currentDate = lastRecord.date;

  // Count consecutive days backwards
  for (let i = 1; i < sortedRecords.length; i++) {
    const record = sortedRecords[i];
    if (isConsecutiveDay(currentDate, record.date)) {
      streak++;
      currentDate = record.date;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Check if streak is at risk (not completed today or yesterday)
 */
export const isStreakAtRisk = (
  lastCompletedDate?: string,
  warningThreshold: number = 1
): boolean => {
  if (!lastCompletedDate) return true;

  const today = getToday();
  const daysSinceCompletion = getDaysDifference(today, lastCompletedDate);

  return daysSinceCompletion >= warningThreshold;
};

/**
 * Check if streak is broken (more than 1 day since last completion)
 */
export const isStreakBroken = (lastCompletedDate?: string): boolean => {
  if (!lastCompletedDate) return true;

  const today = getToday();
  const daysSinceCompletion = getDaysDifference(today, lastCompletedDate);

  return daysSinceCompletion > 1;
};

/**
 * Update streak after goal completion
 */
export const updateStreakOnCompletion = (
  currentStreak: Streak,
  completionDate: string
): Streak => {
  const today = getToday();
  const isConsecutive = isConsecutiveDay(
    completionDate,
    currentStreak.lastCompletedDate || ''
  );

  let newStreak = currentStreak.currentStreak;

  if (isConsecutive || !currentStreak.lastCompletedDate) {
    newStreak = currentStreak.currentStreak + 1;
  } else {
    newStreak = 1; // Reset streak
  }

  return {
    ...currentStreak,
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, currentStreak.longestStreak),
    lastCompletedDate: completionDate,
  };
};

/**
 * Get streak status message
 */
export const getStreakStatusMessage = (streak: number): string => {
  if (streak === 0) return 'Start your streak today!';
  if (streak === 1) return '1 day streak!';
  if (streak < 7) return `${streak} days streak!`;
  if (streak < 30) return `${streak} days streak! 🔥`;
  if (streak < 100) return `${streak} days streak! 🔥🔥`;
  return `${streak} days streak! 🔥🔥🔥`;
};

