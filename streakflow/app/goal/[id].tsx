import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert, TextInput, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Notifications from 'expo-notifications';
import { colors, spacing, borderRadius } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { useGoals } from '@/context/GoalsContext';
import { useNotifications } from '@/context/NotificationContext';
import { useXP } from '@/context/XPContext';
import { Button } from '@/components/common';
import { Card } from '@/components/common';
import { storage } from '@/lib/storage';

interface GoalDetails {
  notes: string;
  whyMatters: string;
  subtasks: string[];
}

interface GoalReminder {
  enabled: boolean;
  hour: number;
  minute: number;
  notificationId?: string;
}

export default function GoalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useTheme();
  const { goals, completeGoal, reloadGoals } = useGoals();
  const { addXP } = useXP();

  // Try to find the goal in the local list, or use placeholder
  const goal = goals.find(g => g.id === id);
  
  // Use placeholder values if goal not found
  const goalName = goal?.name || 'Sample Goal';
  const goalDescription = goal?.description || 'This is a placeholder description for the goal. You can add more details here.';
  const streakCount = goal?.streakCount || 0;
  const goalType = goal?.type || 'daily';
  const lastCompletedAt = goal?.lastCompletedAt;
  
  // Check if goal is already completed today
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = lastCompletedAt === today;

  // Goal details state
  const [notes, setNotes] = useState('');
  const [whyMatters, setWhyMatters] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  
  // Reminder state
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(9);
  const [reminderMinute, setReminderMinute] = useState(0);
  
  // Calendar state
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const { enabled: notificationsEnabled } = useNotifications();

  // Load goal details, reminder, and calendar from storage
  useEffect(() => {
    if (id) {
      loadGoalDetails();
      loadReminder();
      loadCalendar();
    }
  }, [id]);

  const loadGoalDetails = async () => {
    try {
      const key = `@streakflow:goalDetails:${id}`;
      const details = await storage.get<GoalDetails>(key);
      if (details) {
        setNotes(details.notes || '');
        setWhyMatters(details.whyMatters || '');
        setSubtasks(details.subtasks || []);
      }
    } catch (error) {
      console.error('Error loading goal details:', error);
    }
  };

  const saveGoalDetails = async () => {
    try {
      const key = `@streakflow:goalDetails:${id}`;
      const details: GoalDetails = {
        notes,
        whyMatters,
        subtasks,
      };
      await storage.set(key, details);
    } catch (error) {
      console.error('Error saving goal details:', error);
    }
  };

  // Auto-save when data changes
  useEffect(() => {
    if (id) {
      const timeoutId = setTimeout(() => {
        saveGoalDetails();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [notes, whyMatters, subtasks, id]);

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask.trim()]);
      setNewSubtask('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const loadReminder = async () => {
    try {
      const key = `@streakflow:goalReminder:${id}`;
      const reminder = await storage.get<GoalReminder>(key);
      if (reminder) {
        setReminderEnabled(reminder.enabled);
        setReminderHour(reminder.hour);
        setReminderMinute(reminder.minute);
      }
    } catch (error) {
      console.error('Error loading reminder:', error);
    }
  };

  const saveReminder = async (reminder: GoalReminder) => {
    try {
      const key = `@streakflow:goalReminder:${id}`;
      await storage.set(key, reminder);
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  };

  const cancelNotification = async (notificationId?: string) => {
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }
  };

  const scheduleNotification = async (hour: number, minute: number): Promise<string | undefined> => {
    if (!notificationsEnabled) {
      Alert.alert('Notifications Disabled', 'Please enable notifications in Settings to use reminders.');
      return undefined;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: goalName,
          body: `Time to work on your goal!`,
          sound: true,
          data: { goalId: id },
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return undefined;
    }
  };

  const handleReminderToggle = async (enabled: boolean) => {
    setReminderEnabled(enabled);
    
    // Just save the state, do NOT schedule notification
    const newReminder: GoalReminder = {
      enabled,
      hour: reminderHour,
      minute: reminderMinute,
    };
    await saveReminder(newReminder);
  };

  const handleTimeChange = async (hour: number, minute: number) => {
    setReminderHour(hour);
    setReminderMinute(minute);

    // Just save the time, do NOT schedule notification
    const updatedReminder: GoalReminder = {
      enabled: reminderEnabled,
      hour,
      minute,
    };
    await saveReminder(updatedReminder);
  };

  const formatTime = (hour: number, minute: number): string => {
    const h = hour % 12 || 12;
    const m = minute.toString().padStart(2, '0');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${h}:${m} ${ampm}`;
  };

  const loadCalendar = async () => {
    try {
      const key = `@streakflow:goalCalendar:${id}`;
      const dates = await storage.get<string[]>(key);
      if (dates) {
        setCompletedDates(new Set(dates));
      }
    } catch (error) {
      console.error('Error loading calendar:', error);
    }
  };

  const saveCalendar = async (dates: Set<string>) => {
    try {
      const key = `@streakflow:goalCalendar:${id}`;
      await storage.set(key, Array.from(dates));
    } catch (error) {
      console.error('Error saving calendar:', error);
    }
  };

  const toggleDate = async (dateString: string) => {
    const newCompletedDates = new Set(completedDates);
    if (newCompletedDates.has(dateString)) {
      newCompletedDates.delete(dateString);
    } else {
      newCompletedDates.add(dateString);
    }
    setCompletedDates(newCompletedDates);
    await saveCalendar(newCompletedDates);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const formatDateKey = (year: number, month: number, day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isDateCompleted = (year: number, month: number, day: number): boolean => {
    const dateKey = formatDateKey(year, month, day);
    return completedDates.has(dateKey);
  };

  const handleDayPress = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateKey = formatDateKey(year, month, day);
    toggleDate(dateKey);
  };

  const getMonthName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentMonth(newDate);
  };

  const handleEdit = () => {
    // Placeholder: Show alert for now
    Alert.alert('Edit Goal', 'Edit functionality will be implemented here.');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Placeholder: Show confirmation
            Alert.alert('Deleted', 'Goal deletion will be implemented here.');
          },
        },
      ]
    );
  };

  const handleMarkDone = async () => {
    if (!id) return;
    
    const result = await completeGoal(id, addXP);
    
    if (result.alreadyCompleted) {
      Alert.alert('Already Completed', 'This goal has already been marked as done today!');
      return;
    }
    
    if (result.success) {
      // Reload goals to update streak display
      await reloadGoals();
      // Also mark the date in the calendar
      const dateKey = formatDateKey(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()
      );
      await toggleDate(dateKey);
      Alert.alert('Success!', 'Goal marked as done! +10 XP');
    }
  };

  const handleStartFocus = async () => {
    // Schedule reminder notification if enabled, then navigate
    if (reminderEnabled) {
      try {
        const key = `@streakflow:goalReminder:${id}`;
        const existingReminder = await storage.get<GoalReminder>(key);
        
        // Cancel existing notification if any
        if (existingReminder?.notificationId) {
          await cancelNotification(existingReminder.notificationId);
        }

        // Schedule new notification with current time
        const notificationId = await scheduleNotification(reminderHour, reminderMinute);
        const updatedReminder: GoalReminder = {
          enabled: true,
          hour: reminderHour,
          minute: reminderMinute,
          notificationId,
        };
        await saveReminder(updatedReminder);
      } catch (error) {
        console.error('Error scheduling reminder:', error);
        // Continue to focus mode even if reminder scheduling fails
      }
    }
    
    router.push(`/(tabs)/focus?goalId=${id}`);
  };

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.content}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={24}
          color={isDark ? colors.textDark : colors.text}
        />
        <Text style={[styles.backText, isDark && styles.backTextDark]}>
          Back
        </Text>
      </TouchableOpacity>

      <Card style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={styles.typeBadge}>
            <Text style={[styles.typeText, isDark && styles.typeTextDark]}>
              {goalType.charAt(0).toUpperCase() + goalType.slice(1)}
            </Text>
          </View>
        </View>

        <Text style={[styles.goalTitle, isDark && styles.goalTitleDark]}>
          {goalName}
        </Text>
        
        {goalDescription && (
          <Text style={[styles.goalDescription, isDark && styles.goalDescriptionDark]}>
            {goalDescription}
          </Text>
        )}

        <View style={styles.streakContainer}>
          <MaterialCommunityIcons
            name="fire"
            size={24}
            color={colors.success}
          />
          <View style={styles.streakInfo}>
            <Text style={[styles.streakCount, isDark && styles.streakCountDark]}>
              {streakCount}
            </Text>
            <Text style={[styles.streakLabel, isDark && styles.streakLabelDark]}>
              day{streakCount !== 1 ? 's' : ''} streak
            </Text>
          </View>
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.monthNavButton}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color={isDark ? colors.textDark : colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.calendarMonth, isDark && styles.calendarMonthDark]}>
            {getMonthName(currentMonth)}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.monthNavButton}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={isDark ? colors.textDark : colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarContainer}>
          <View style={styles.calendarWeekdays}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} style={[styles.weekdayLabel, isDark && styles.weekdayLabelDark]}>
                {day}
              </Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {getDaysInMonth(currentMonth).map((day, index) => {
              if (day === null) {
                return <View key={index} style={styles.calendarDay} />;
              }
              const isCompleted = isDateCompleted(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                day
              );
              const isToday =
                currentMonth.getFullYear() === new Date().getFullYear() &&
                currentMonth.getMonth() === new Date().getMonth() &&
                day === new Date().getDate();

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDay,
                    isToday && styles.calendarDayToday,
                    isToday && isDark && styles.calendarDayTodayDark,
                  ]}
                  onPress={() => handleDayPress(day)}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      isCompleted && styles.calendarDayTextCompleted,
                      isDark && styles.calendarDayTextDark,
                      isCompleted && isDark && styles.calendarDayTextCompletedDark,
                    ]}
                  >
                    {day}
                  </Text>
                  {isCompleted && (
                    <View style={styles.completedDot} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          Why this goal matters
        </Text>
        <TextInput
          style={[styles.textInput, isDark && styles.textInputDark]}
          placeholder="What makes this goal important to you?"
          placeholderTextColor={isDark ? colors.textSecondaryDark : colors.textSecondary}
          value={whyMatters}
          onChangeText={setWhyMatters}
          multiline
          numberOfLines={4}
        />
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          Notes
        </Text>
        <TextInput
          style={[styles.textInput, isDark && styles.textInputDark]}
          placeholder="Add your notes here..."
          placeholderTextColor={isDark ? colors.textSecondaryDark : colors.textSecondary}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          Subtasks
        </Text>
        <View style={styles.subtaskInputContainer}>
          <TextInput
            style={[styles.subtaskInput, isDark && styles.subtaskInputDark]}
            placeholder="Add a subtask..."
            placeholderTextColor={isDark ? colors.textSecondaryDark : colors.textSecondary}
            value={newSubtask}
            onChangeText={setNewSubtask}
            onSubmitEditing={handleAddSubtask}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={handleAddSubtask}
            style={[styles.addButton, isDark && styles.addButtonDark]}
            disabled={!newSubtask.trim()}
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color={newSubtask.trim() ? colors.primary : colors.iconInactive}
            />
          </TouchableOpacity>
        </View>
        {subtasks.length > 0 && (
          <View style={styles.subtasksList}>
            {subtasks.map((subtask, index) => (
              <View key={index} style={styles.subtaskItem}>
                <Text style={[styles.subtaskText, isDark && styles.subtaskTextDark]}>
                  {subtask}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveSubtask(index)}
                  style={styles.removeButton}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={20}
                    color={colors.error}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card style={styles.sectionCard}>
        <View style={styles.reminderHeader}>
          <View style={styles.reminderTitleRow}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Reminder
            </Text>
          </View>
          <Switch
            value={reminderEnabled}
            onValueChange={handleReminderToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.background}
          />
        </View>

        {reminderEnabled && (
          <View style={styles.timePickerContainer}>
            <View style={styles.timePickerRow}>
              <View style={styles.pickerWrapper}>
                <Text style={[styles.pickerLabel, isDark && styles.pickerLabelDark]}>Hour</Text>
                <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
                  <Picker
                    selectedValue={reminderHour}
                    onValueChange={(value) => handleTimeChange(value, reminderMinute)}
                    style={[styles.picker, isDark && styles.pickerDark]}
                    itemStyle={isDark ? styles.pickerItemDark : styles.pickerItem}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <Picker.Item 
                        key={i} 
                        label={i.toString().padStart(2, '0')} 
                        value={i}
                        color={isDark ? colors.textNormalDark : colors.textNormal}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <Text style={[styles.timeSeparator, isDark && styles.timeSeparatorDark]}>:</Text>

              <View style={styles.pickerWrapper}>
                <Text style={[styles.pickerLabel, isDark && styles.pickerLabelDark]}>Minute</Text>
                <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
                  <Picker
                    selectedValue={reminderMinute}
                    onValueChange={(value) => handleTimeChange(reminderHour, value)}
                    style={[styles.picker, isDark && styles.pickerDark]}
                    itemStyle={isDark ? styles.pickerItemDark : styles.pickerItem}
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <Picker.Item 
                        key={i} 
                        label={i.toString().padStart(2, '0')} 
                        value={i}
                        color={isDark ? colors.textNormalDark : colors.textNormal}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          </View>
        )}

        {reminderEnabled && (
          <Text style={[styles.reminderStatus, isDark && styles.reminderStatusDark]}>
            Reminder set for {formatTime(reminderHour, reminderMinute)}
          </Text>
        )}
      </Card>

      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={handleMarkDone}
          style={[styles.actionButton, isCompletedToday && styles.completedButton]}
          icon={isCompletedToday ? "check-circle" : "check"}
          disabled={isCompletedToday}
        >
          {isCompletedToday ? 'Completed Today' : 'Mark Goal as Done Today'}
        </Button>

        <Button
          mode="outlined"
          onPress={handleStartFocus}
          style={styles.actionButton}
          icon="timer"
        >
          Start Focus Mode
        </Button>

        <View style={styles.secondaryActions}>
          <Button
            mode="outlined"
            onPress={handleEdit}
            style={styles.secondaryButton}
            icon="pencil"
          >
            Edit
          </Button>

          <Button
            mode="outlined"
            onPress={handleDelete}
            style={[styles.secondaryButton, styles.deleteButton]}
            icon="delete"
          >
            Delete
          </Button>
        </View>
      </View>
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
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  backTextDark: {
    color: colors.textDark,
  },
  goalCard: {
    marginBottom: spacing.xl,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: spacing.md,
  },
  typeBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textNormal,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeTextDark: {
    color: colors.textNormalDark,
  },
  goalTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  goalTitleDark: {
    color: colors.textDark,
  },
  goalDescription: {
    fontSize: 16,
    color: colors.textNormal,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  goalDescriptionDark: {
    color: colors.textNormalDark,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  streakInfo: {
    marginLeft: spacing.sm,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakCount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.success,
    marginRight: spacing.xs,
  },
  streakCountDark: {
    color: colors.success,
  },
  streakLabel: {
    fontSize: 16,
    color: colors.textNormal,
    fontWeight: '500',
  },
  streakLabelDark: {
    color: colors.textNormalDark,
  },
  actionsContainer: {
    gap: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.xs,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  secondaryButton: {
    flex: 1,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  sectionCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionTitleDark: {
    color: colors.textDark,
  },
  textInput: {
    minHeight: 100,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.textNormal,
    textAlignVertical: 'top',
  },
  textInputDark: {
    backgroundColor: colors.inputBackgroundDark,
    borderColor: colors.borderDark,
    color: colors.textNormalDark,
  },
  subtaskInputContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  subtaskInput: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.textNormal,
  },
  subtaskInputDark: {
    backgroundColor: colors.inputBackgroundDark,
    borderColor: colors.borderDark,
    color: colors.textNormalDark,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDark: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.borderDark,
  },
  subtasksList: {
    gap: spacing.sm,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceSoft,
  },
  subtaskText: {
    flex: 1,
    fontSize: 16,
    color: colors.textNormal,
  },
  subtaskTextDark: {
    color: colors.textNormalDark,
  },
  removeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  reminderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timePickerContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  pickerWrapper: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
  pickerLabelDark: {
    color: colors.textSecondaryDark,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  pickerContainerDark: {
    borderColor: colors.borderDark,
    backgroundColor: colors.surfaceDark,
  },
  picker: {
    height: 120,
    color: colors.textNormal,
    backgroundColor: 'transparent',
  },
  pickerDark: {
    color: colors.textNormalDark,
    backgroundColor: 'transparent',
  },
  pickerItem: {
    color: colors.textNormal,
  },
  pickerItemDark: {
    color: colors.textNormalDark,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
  },
  timeSeparatorDark: {
    color: colors.textDark,
  },
  reminderStatus: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  reminderStatusDark: {
    color: colors.success,
  },
  completedButton: {
    opacity: 0.6,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  monthNavButton: {
    padding: spacing.xs,
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  calendarMonthDark: {
    color: colors.textDark,
  },
  calendarContainer: {
    marginTop: spacing.sm,
  },
  calendarWeekdays: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekdayLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  weekdayLabelDark: {
    color: colors.textSecondaryDark,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    position: 'relative',
    marginBottom: spacing.xs,
  },
  calendarDayToday: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  calendarDayTodayDark: {
    backgroundColor: colors.surfaceDark,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textNormal,
  },
  calendarDayTextDark: {
    color: colors.textNormalDark,
  },
  calendarDayTextCompleted: {
    color: colors.success,
    fontWeight: '700',
  },
  calendarDayTextCompletedDark: {
    color: colors.success,
  },
  completedDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
});
