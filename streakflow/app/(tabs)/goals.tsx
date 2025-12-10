import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '@/constants';
import { useGoals } from '@/context/GoalsContext';
import { useTheme } from '@/context/ThemeContext';
import { GoalCard } from '@/components/goals/GoalCard';

export default function GoalsScreen() {
  const router = useRouter();
  const { goals } = useGoals();
  const { isDark } = useTheme();

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, isDark && styles.titleDark]}>All Goals</Text>
      
      {goals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
            No goals yet. Create your first goal!
          </Text>
        </View>
      ) : (
        goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
          />
        ))
      )}
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
    marginBottom: spacing.lg,
  },
  titleDark: {
    color: colors.textDark,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyTextDark: {
    color: colors.textSecondaryDark,
  },
});

