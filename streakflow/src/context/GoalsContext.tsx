import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Goal, CreateGoalInput, UpdateGoalInput } from '@/types/goal';
import { storage } from '@/lib/storage';
import { config } from '@/constants/config';
import { useAuth } from './AuthContext';

interface GoalsContextType {
  goals: Goal[];
  loading: boolean;
  createGoal: (input: CreateGoalInput) => Promise<Goal>;
  updateGoal: (id: string, input: UpdateGoalInput) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  completeGoal: (id: string, addXP: (amount: number) => Promise<void>) => Promise<{ success: boolean; alreadyCompleted: boolean }>;
  getGoalsByType: (type: Goal['type']) => Goal[];
  reloadGoals: () => Promise<void>;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export const GoalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGoals();
    } else {
      setGoals([]);
      setLoading(false);
    }
  }, [user]);

  const loadGoals = async () => {
    try {
      const storedGoals = await storage.getGoals();
      if (storedGoals && Array.isArray(storedGoals)) {
        setGoals(storedGoals);
      } else {
        setGoals([]);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (input: CreateGoalInput): Promise<Goal> => {
    if (!user) throw new Error('User must be logged in');

    const newGoal: Goal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      name: input.name,
      description: input.description,
      type: input.type,
      status: 'active',
      streakCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    await storage.setGoals(updatedGoals);

    return newGoal;
  };

  const updateGoal = async (id: string, input: UpdateGoalInput): Promise<void> => {
    const updatedGoals = goals.map(goal =>
      goal.id === id
        ? { ...goal, ...input, updatedAt: new Date().toISOString() }
        : goal
    );
    setGoals(updatedGoals);
    await storage.setGoals(updatedGoals);
  };

  const deleteGoal = async (id: string): Promise<void> => {
    const updatedGoals = goals.filter(goal => goal.id !== id);
    setGoals(updatedGoals);
    await storage.setGoals(updatedGoals);
  };

  const completeGoal = async (id: string, addXP: (amount: number) => Promise<void>): Promise<{ success: boolean; alreadyCompleted: boolean }> => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return { success: false, alreadyCompleted: false };

    const today = new Date().toISOString().split('T')[0];
    
    // Check if already completed today
    if (goal.lastCompletedAt === today) {
      return { success: false, alreadyCompleted: true };
    }

    // Calculate new streak
    let newStreak = 1;
    if (goal.lastCompletedAt) {
      const lastCompleted = new Date(goal.lastCompletedAt);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const lastCompletedDate = new Date(lastCompleted);
      lastCompletedDate.setHours(0, 0, 0, 0);
      
      if (lastCompletedDate.getTime() === yesterday.getTime()) {
        // Completed yesterday - increment streak
        newStreak = goal.streakCount + 1;
      } else {
        // Last completion was 2+ days ago - reset to 1
        newStreak = 1;
      }
    } else {
      // First completion
      newStreak = 1;
    }

    const updatedGoal: Goal = {
      ...goal,
      streakCount: newStreak,
      lastCompletedAt: today,
      updatedAt: new Date().toISOString(),
    };

    const updatedGoals = goals.map(g => (g.id === id ? updatedGoal : g));
    setGoals(updatedGoals);
    await storage.setGoals(updatedGoals);

    // Add XP
    await addXP(10);

    return { success: true, alreadyCompleted: false };
  };

  const getGoalsByType = (type: Goal['type']): Goal[] => {
    return goals.filter(goal => goal.type === type && goal.status === 'active');
  };

  const reloadGoals = async () => {
    setLoading(true);
    await loadGoals();
  };

  return (
    <GoalsContext.Provider
      value={{
        goals,
        loading,
        createGoal,
        updateGoal,
        deleteGoal,
        completeGoal,
        getGoalsByType,
        reloadGoals,
      }}
    >
      {children}
    </GoalsContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
};

