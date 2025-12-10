import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '@/components/common';
import { colors, spacing, borderRadius } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import type { Goal } from '@/types/goal';

interface GoalCardProps {
  goal: Goal;
  onComplete?: (goalId: string) => void;
}

// Icon mapping for goals (default icon if none selected)
const getGoalIcon = (goalType: Goal['type']): string => {
  const iconMap: Record<Goal['type'], string> = {
    daily: 'calendar-today',
    weekly: 'calendar-week',
    monthly: 'calendar-month',
  };
  return iconMap[goalType] || 'target';
};

// Color tags for goal categories
const getGoalTypeColor = (goalType: Goal['type']): string => {
  const colorMap: Record<Goal['type'], string> = {
    daily: '#5B69FF', // Primary blue
    weekly: '#8B5CF6', // Purple
    monthly: '#10B981', // Green
  };
  return colorMap[goalType] || colors.primary;
};

const getGoalTypeLabel = (goalType: Goal['type']): string => {
  return goalType.charAt(0).toUpperCase() + goalType.slice(1);
};

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onComplete }) => {
  const router = useRouter();
  const { isDark } = useTheme();

  const handlePress = () => {
    router.push(`/goal/${goal.id}`);
  };

  const typeColor = getGoalTypeColor(goal.type);
  const goalIcon = getGoalIcon(goal.type);

  return (
    <Card
      onPress={handlePress}
      style={styles.goalCard}
    >
      <View style={styles.goalHeader}>
        <View style={styles.goalTitleRow}>
          <MaterialCommunityIcons
            name={goalIcon as any}
            size={22}
            color={typeColor}
            style={styles.goalIcon}
          />
          <Text style={[styles.goalName, isDark && styles.goalNameDark]}>
            {goal.name}
          </Text>
        </View>
        {onComplete && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onComplete(goal.id);
            }}
            style={styles.checkButton}
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.metaRow}>
        <View style={[styles.typeTag, { backgroundColor: `${typeColor}15` }]}>
          <View style={[styles.typeDot, { backgroundColor: typeColor }]} />
          <Text style={[styles.typeText, { color: typeColor }]}>
            {getGoalTypeLabel(goal.type)}
          </Text>
        </View>
        <View style={styles.streakInfo}>
          <MaterialCommunityIcons
            name="fire"
            size={16}
            color={colors.success}
          />
          <Text style={[styles.streakText, isDark && styles.streakTextDark]}>
            {goal.streakCount} day streak
          </Text>
        </View>
      </View>

      {goal.description && (
        <Text style={[styles.goalDescription, isDark && styles.goalDescriptionDark]}>
          {goal.description}
        </Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  goalCard: {
    marginBottom: spacing.lg,
    minHeight: 80,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalIcon: {
    marginRight: spacing.sm,
  },
  goalName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    letterSpacing: -0.3,
  },
  goalNameDark: {
    color: colors.textDark,
  },
  checkButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalDescription: {
    fontSize: 15,
    color: colors.textNormal,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  goalDescriptionDark: {
    color: colors.textNormalDark,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  streakText: {
    fontSize: 15,
    color: colors.success,
    fontWeight: '600',
  },
  streakTextDark: {
    color: colors.accentLight,
  },
});

