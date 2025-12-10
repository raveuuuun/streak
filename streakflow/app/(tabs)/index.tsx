import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Animated, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useGoals } from '@/context/GoalsContext';
import { useTheme } from '@/context/ThemeContext';
import { useXP } from '@/context/XPContext';
import { GoalCard } from '@/components/goals/GoalCard';
import { storage } from '@/lib/storage';
import type { Goal } from '@/types/goal';

interface FocusSession {
  date: string; // YYYY-MM-DD
  duration: number; // seconds
  completed: boolean;
}

const QUOTES = [
  "The way to get started is to quit talking and begin doing.",
  "Don't let yesterday take up too much of today.",
  "You learn more from failure than from success.",
  "If you are working on something exciting, you don't have to be pushed. The vision pulls you.",
  "People who are crazy enough to think they can change the world, are the ones who do.",
  "Failure will never overtake you if your determination to succeed is strong enough.",
  "Entrepreneurs are great at dealing with uncertainty and also very good at minimizing risk.",
  "We may encounter many defeats but we must not be defeated.",
  "Knowing is not enough; we must apply. Wishing is not enough; we must do.",
  "Imagine your life is perfect in every respect; what would it look like?",
];

export default function DashboardScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { goals, getGoalsByType, completeGoal, loading: goalsLoading } = useGoals();
  const { isDark } = useTheme();
  const { addXP, totalXP } = useXP();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [todayFocusTime, setTodayFocusTime] = useState(0);
  const [weeklySessions, setWeeklySessions] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/(auth)/welcome');
    }
  }, [user, authLoading]);

  useEffect(() => {
    loadFocusStats();
  }, []);

  // Subtle pulse animation for XP bar
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const getNextLevelXP = (currentXP: number): number => {
    return Math.ceil((currentXP + 1) / 100) * 100;
  };

  const getCurrentLevelXP = (currentXP: number): number => {
    return Math.floor(currentXP / 100) * 100;
  };

  const getProgressPercentage = (currentXP: number): number => {
    const currentLevelXP = getCurrentLevelXP(currentXP);
    const nextLevelXP = getNextLevelXP(currentXP);
    const progress = currentXP - currentLevelXP;
    const totalNeeded = nextLevelXP - currentLevelXP;
    return totalNeeded > 0 ? (progress / totalNeeded) * 100 : 0;
  };

  // Refresh stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      loadFocusStats();
    }, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadFocusStats = async () => {
    try {
      const sessions = await storage.get<FocusSession[]>('@streakflow:focusSessions') || [];
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = sessions.filter(s => s.date === today && s.completed);
      const totalSeconds = todaySessions.reduce((sum, s) => sum + s.duration, 0);
      setTodayFocusTime(totalSeconds);

      // Calculate weekly sessions (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklySessionsList = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate >= weekAgo && s.completed;
      });
      setWeeklySessions(weeklySessionsList.length);
    } catch (error) {
      console.error('Error loading focus stats:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getQuoteOfTheDay = (): string => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    return QUOTES[dayOfYear % QUOTES.length];
  };

  const dailyGoals = getGoalsByType('daily');
  const weeklyGoals = getGoalsByType('weekly');
  const monthlyGoals = getGoalsByType('monthly');

  const handleCompleteGoal = async (goalId: string) => {
    await completeGoal(goalId, addXP);
  };

  const renderGoalCard = (goal: Goal) => (
    <GoalCard
      key={goal.id}
      goal={goal}
      onComplete={handleCompleteGoal}
    />
  );

  if (authLoading || goalsLoading) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.xpBarContainer, isDark && styles.xpBarContainerDark]}>
        <View style={styles.xpBarHeader}>
          <View style={styles.xpBarTitleRow}>
            <Text style={styles.fireEmoji}>🔥</Text>
            <Text style={[styles.xpBarText, isDark && styles.xpBarTextDark]}>
              {totalXP} XP
            </Text>
          </View>
          <Text style={[styles.xpBarNextLevel, isDark && styles.xpBarNextLevelDark]}>
            {getNextLevelXP(totalXP) - totalXP} to next level
          </Text>
        </View>
        <View style={[styles.xpBarTrack, isDark && styles.xpBarTrackDark]}>
          <Animated.View
            style={[
              styles.xpBarFillContainer,
              {
                width: `${getProgressPercentage(totalXP)}%`,
                transform: [{ scaleY: pulseAnim }],
              },
            ]}
          >
            <View style={styles.xpBarFillGradient}>
              <View style={styles.xpBarFillInner} />
            </View>
          </Animated.View>
        </View>
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>
          Welcome back!
        </Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          {user?.email}
        </Text>
      </View>

      <QuickAddButton
        onPress={() => router.push('/goal/create')}
        isDark={isDark}
      />

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, isDark && styles.statCardDark]}>
          <MaterialCommunityIcons
            name="timer-outline"
            size={20}
            color={colors.primary}
          />
          <View style={styles.statContent}>
            <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
              Total focus time today
            </Text>
            <Text style={[styles.statValue, isDark && styles.statValueDark]}>
              {formatTime(todayFocusTime)}
            </Text>
          </View>
        </View>

        <View style={[styles.statCard, isDark && styles.statCardDark]}>
          <MaterialCommunityIcons
            name="chart-line"
            size={20}
            color={colors.success}
          />
          <View style={styles.statContent}>
            <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
              Sessions this week
            </Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min((weeklySessions / 7) * 100, 100)}%` },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, isDark && styles.progressTextDark]}>
                {weeklySessions}/7
              </Text>
            </View>
          </View>
        </View>
      </View>

      {dailyGoals.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Daily Goals
          </Text>
          {dailyGoals.map(renderGoalCard)}
        </View>
      )}

      {weeklyGoals.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Weekly Goals
          </Text>
          {weeklyGoals.map(renderGoalCard)}
        </View>
      )}

      {monthlyGoals.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Monthly Goals
          </Text>
          {monthlyGoals.map(renderGoalCard)}
        </View>
      )}

      {goals.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="target"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
            No goals yet. Create your first goal!
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/goal/create')}
          >
            <Text style={styles.emptyButtonText}>Create Goal</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.quoteContainer}>
        <MaterialCommunityIcons
          name="format-quote-open"
          size={20}
          color={colors.textSecondary}
        />
        <Text style={[styles.quoteText, isDark && styles.quoteTextDark]}>
          {getQuoteOfTheDay()}
        </Text>
      </View>
    </ScrollView>
  );
}

const QuickAddButton: React.FC<{ onPress: () => void; isDark: boolean }> = ({ onPress, isDark }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.quickAdd,
          isDark && styles.quickAddDark,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <MaterialCommunityIcons name="plus-circle" size={26} color={colors.primary} />
        <Text style={[styles.quickAddText, isDark && styles.quickAddTextDark]}>
          Quick Add Goal
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerDark: {
    backgroundColor: colors.backgroundDark,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  titleDark: {
    color: colors.textDark,
  },
  subtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  subtitleDark: {
    color: colors.textSecondaryDark,
  },
  quickAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 3,
  },
  quickAddDark: {
    backgroundColor: colors.surfaceDark,
    shadowColor: colors.shadowDark,
    shadowOpacity: 1,
  },
  quickAddText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.2,
  },
  quickAddTextDark: {
    color: colors.primaryLight,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
    letterSpacing: -0.4,
  },
  sectionTitleDark: {
    color: colors.textDark,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    fontWeight: '500',
  },
  emptyTextDark: {
    color: colors.textSecondaryDark,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  emptyButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  loadingTextDark: {
    color: colors.textSecondaryDark,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  statCardDark: {
    backgroundColor: colors.surfaceDark,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  statLabelDark: {
    color: colors.textSecondaryDark,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statValueDark: {
    color: colors.textDark,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.divider,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    minWidth: 35,
  },
  progressTextDark: {
    color: colors.textSecondaryDark,
  },
  quoteContainer: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surfaceSoft,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  quoteText: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  quoteTextDark: {
    color: colors.textSecondaryDark,
  },
  xpBarContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  xpBarContainerDark: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.borderDark,
    shadowColor: colors.shadowDark,
  },
  xpBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  xpBarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fireEmoji: {
    fontSize: 18,
  },
  xpBarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  xpBarTextDark: {
    color: colors.textDark,
  },
  xpBarNextLevel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  xpBarNextLevelDark: {
    color: colors.textSecondaryDark,
  },
  xpBarTrack: {
    height: 6,
    backgroundColor: colors.divider,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  xpBarTrackDark: {
    backgroundColor: colors.dividerDark,
  },
  xpBarFillContainer: {
    height: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 6,
    shadowOpacity: 0.7,
    elevation: 3,
  },
  xpBarFillGradient: {
    flex: 1,
    backgroundColor: '#FF8C42', // Warm orange
    borderRadius: borderRadius.full,
    position: 'relative',
  },
  xpBarFillInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFB84D', // Gold highlight
    borderRadius: borderRadius.full,
    opacity: 0.4,
  },
});

