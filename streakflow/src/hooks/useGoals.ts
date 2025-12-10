import { useGoals as useGoalsContext } from '@/context/GoalsContext';
import type { Goal } from '@/types/goal';

/**
 * Hook to access goals state and methods
 * This is a re-export for convenience
 */
export const useGoals = useGoalsContext;

/**
 * Hook to get goals filtered by type
 */
export const useGoalsByType = (type: Goal['type']) => {
  const { getGoalsByType } = useGoals();
  return getGoalsByType(type);
};

