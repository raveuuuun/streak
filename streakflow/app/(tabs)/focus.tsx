import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Vibration, StatusBar } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, spacing, borderRadius } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { useGoals } from '@/context/GoalsContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { storage } from '@/lib/storage';

interface FocusSession {
  date: string; // YYYY-MM-DD
  duration: number; // seconds
  completed: boolean;
}

const DURATION_OPTIONS = [5, 10, 15, 20, 25, 30, 60];
const CUSTOM_OPTION = 'custom';
const MIN_MINUTES = 1;
const MAX_MINUTES = 180; // 3 hours

export default function FocusScreen() {
  const { isDark } = useTheme();
  const { goalId } = useLocalSearchParams<{ goalId?: string }>();
  const { goals } = useGoals();
  const [selectedOption, setSelectedOption] = useState<number | typeof CUSTOM_OPTION | null>(null);
  const [customMinutes, setCustomMinutes] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [initialDuration, setInitialDuration] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const hasCompletedRef = useRef(false);

  // Get goal name or fallback
  const goal = goalId ? goals.find(g => g.id === goalId) : null;
  const goalName = goal?.name || 'Selected Goal';

  // Load focus preferences
  useEffect(() => {
    loadFocusPreferences();
  }, []);

  const loadFocusPreferences = async () => {
    try {
      const preferences = await storage.getPreferences();
      if (preferences) {
        setSoundEnabled(preferences.focusSoundEnabled !== false);
        setVibrationEnabled(preferences.focusVibrationEnabled !== false);
      }
    } catch (error) {
      console.error('Error loading focus preferences:', error);
    }
  };

  const saveCompletedSession = async (duration: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const sessions = await storage.get<FocusSession[]>('@streakflow:focusSessions') || [];
      const newSession: FocusSession = {
        date: today,
        duration,
        completed: true,
      };
      sessions.push(newSession);
      await storage.set('@streakflow:focusSessions', sessions);
    } catch (error) {
      console.error('Error saving focus session:', error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && !isPaused && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsPaused(false);
            if (!hasCompletedRef.current) {
              hasCompletedRef.current = true;
              // Save completed session
              if (initialDuration > 0) {
                saveCompletedSession(initialDuration);
              }
              // Vibration pattern: vibrate 3 times (if enabled)
              if (vibrationEnabled) {
                Vibration.vibrate([0, 200, 100, 200, 100, 200]);
              }
              // Note: Sound would be handled by notification system if needed
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, isPaused, remainingSeconds, initialDuration]);

  // Reset completion flag when starting new session
  useEffect(() => {
    if (remainingSeconds > 0 && isRunning) {
      hasCompletedRef.current = false;
    }
  }, [remainingSeconds, isRunning]);

  const getSelectedMinutes = (): number | null => {
    if (selectedOption === null) return null;
    if (selectedOption === CUSTOM_OPTION) {
      const minutes = parseInt(customMinutes, 10);
      if (isNaN(minutes) || minutes < MIN_MINUTES || minutes > MAX_MINUTES) {
        return null;
      }
      return minutes;
    }
    return selectedOption;
  };

  const handleStart = () => {
    const minutes = getSelectedMinutes();
    if (minutes) {
      const totalSeconds = minutes * 60;
      setRemainingSeconds(totalSeconds);
      setInitialDuration(totalSeconds);
      setIsRunning(true);
      setIsPaused(false);
      hasCompletedRef.current = false;
    }
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setRemainingSeconds(0);
    setInitialDuration(0);
    setSelectedOption(null);
    setCustomMinutes('');
    hasCompletedRef.current = false;
  };

  const handleCustomChange = (text: string) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    setCustomMinutes(numericText);
    if (numericText && parseInt(numericText, 10) >= MIN_MINUTES && parseInt(numericText, 10) <= MAX_MINUTES) {
      setSelectedOption(CUSTOM_OPTION);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!goalId) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Text style={[styles.title, isDark && styles.titleDark]}>Focus Mode</Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          Select a goal to start a focus session
        </Text>
      </View>
    );
  }

  // Full-screen focus mode when running
  if (isRunning || remainingSeconds > 0) {
    return (
      <View style={[styles.focusContainer, isDark && styles.focusContainerDark]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.focusHeader}>
          <Text style={[styles.focusGoalTitle, isDark && styles.focusGoalTitleDark]}>
            {goalName}
          </Text>
        </View>

        <View style={styles.focusTimerContainer}>
          <Text style={[styles.focusTimer, isDark && styles.focusTimerDark]}>
            {formatTime(remainingSeconds)}
          </Text>
          {isPaused && (
            <Text style={[styles.pausedText, isDark && styles.pausedTextDark]}>
              Paused
            </Text>
          )}
        </View>

        <View style={styles.focusControls}>
          {isPaused ? (
            <TouchableOpacity
              onPress={handleResume}
              style={[styles.controlButton, styles.resumeButton]}
            >
              <MaterialCommunityIcons name="play" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          ) : isRunning ? (
            <TouchableOpacity
              onPress={handlePause}
              style={[styles.controlButton, styles.pauseButton]}
            >
              <MaterialCommunityIcons name="pause" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null}
          
          <TouchableOpacity
            onPress={handleStop}
            style={[styles.controlButton, styles.stopButton]}
          >
            <MaterialCommunityIcons name="stop" size={32} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Setup screen
  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Text style={[styles.title, isDark && styles.titleDark]}>Focus Mode</Text>
      <Text style={[styles.goalText, isDark && styles.goalTextDark]}>
        {goalName}
      </Text>

      {!isRunning && (
        <>
          <View style={styles.durationContainer}>
            <Text style={[styles.durationLabel, isDark && styles.durationLabelDark]}>
              Select duration (minutes)
            </Text>
            <View style={styles.durationOptions}>
              {DURATION_OPTIONS.map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  onPress={() => {
                    setSelectedOption(minutes);
                    setCustomMinutes('');
                  }}
                  style={[
                    styles.durationButton,
                    selectedOption === minutes && styles.durationButtonSelected,
                    isDark && styles.durationButtonDark,
                    selectedOption === minutes && isDark && styles.durationButtonSelectedDark,
                  ]}
                >
                  <Text
                    style={[
                      styles.durationText,
                      selectedOption === minutes && styles.durationTextSelected,
                      isDark && styles.durationTextDark,
                      selectedOption === minutes && isDark && styles.durationTextSelectedDark,
                    ]}
                  >
                    {minutes === 60 ? '60 min' : minutes}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => {
                  setSelectedOption(CUSTOM_OPTION);
                  setCustomMinutes('');
                }}
                style={[
                  styles.durationButton,
                  selectedOption === CUSTOM_OPTION && styles.durationButtonSelected,
                  isDark && styles.durationButtonDark,
                  selectedOption === CUSTOM_OPTION && isDark && styles.durationButtonSelectedDark,
                ]}
              >
                <Text
                  style={[
                    styles.durationText,
                    selectedOption === CUSTOM_OPTION && styles.durationTextSelected,
                    isDark && styles.durationTextDark,
                    selectedOption === CUSTOM_OPTION && isDark && styles.durationTextSelectedDark,
                  ]}
                >
                  Custom
                </Text>
              </TouchableOpacity>
            </View>
            {selectedOption === CUSTOM_OPTION && (
              <View style={styles.customInputContainer}>
                <TextInput
                  style={[
                    styles.customInput,
                    isDark && styles.customInputDark,
                  ]}
                  placeholder="Enter minutes (1-180)"
                  placeholderTextColor={isDark ? colors.textSecondaryDark : colors.textSecondary}
                  value={customMinutes}
                  onChangeText={handleCustomChange}
                  keyboardType="numeric"
                  maxLength={3}
                />
                {customMinutes && (
                  <Text style={[styles.customHelper, isDark && styles.customHelperDark]}>
                    {parseInt(customMinutes, 10) < MIN_MINUTES || parseInt(customMinutes, 10) > MAX_MINUTES
                      ? `Enter ${MIN_MINUTES}-${MAX_MINUTES} minutes`
                      : `${customMinutes} minute${parseInt(customMinutes, 10) !== 1 ? 's' : ''}`}
                  </Text>
                )}
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={handleStart}
            style={[
              styles.startButton,
              !getSelectedMinutes() && styles.startButtonDisabled,
            ]}
            disabled={!getSelectedMinutes()}
          >
            <Text style={[styles.startButtonText, isDark && styles.startButtonTextDark]}>
              Start Focus Session
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerDark: {
    backgroundColor: colors.backgroundDark,
  },
  focusContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  focusContainerDark: {
    backgroundColor: colors.backgroundDark,
  },
  focusHeader: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  focusGoalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  focusGoalTitleDark: {
    color: colors.textDark,
  },
  focusTimerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusTimer: {
    fontSize: 120,
    fontWeight: '800',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -4,
  },
  focusTimerDark: {
    color: colors.primary,
  },
  pausedText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  pausedTextDark: {
    color: colors.textSecondaryDark,
  },
  focusControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    paddingBottom: spacing.xl,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    elevation: 8,
  },
  pauseButton: {
    backgroundColor: colors.primary,
  },
  resumeButton: {
    backgroundColor: colors.success,
  },
  stopButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.error,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  titleDark: {
    color: colors.textDark,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  subtitleDark: {
    color: colors.textSecondaryDark,
  },
  goalText: {
    fontSize: 18,
    color: colors.textNormal,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  goalTextDark: {
    color: colors.textNormalDark,
  },
  durationContainer: {
    width: '100%',
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  durationLabel: {
    fontSize: 16,
    color: colors.textNormal,
    marginBottom: spacing.md,
    fontWeight: '500',
  },
  durationLabelDark: {
    color: colors.textNormalDark,
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  durationButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 60,
    alignItems: 'center',
  },
  durationButtonDark: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.borderDark,
  },
  durationButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationButtonSelectedDark: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textNormal,
  },
  durationTextDark: {
    color: colors.textNormalDark,
  },
  durationTextSelected: {
    color: '#FFFFFF',
  },
  durationTextSelectedDark: {
    color: '#FFFFFF',
  },
  startButton: {
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  startButtonDisabled: {
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  startButtonTextDark: {
    color: '#FFFFFF',
  },
  customInputContainer: {
    width: '100%',
    marginTop: spacing.md,
    alignItems: 'center',
  },
  customInput: {
    width: '100%',
    maxWidth: 200,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.inputBackground,
    borderWidth: 2,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.textNormal,
    textAlign: 'center',
    fontWeight: '500',
  },
  customInputDark: {
    backgroundColor: colors.inputBackgroundDark,
    borderColor: colors.borderDark,
    color: colors.textNormalDark,
  },
  customHelper: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  customHelperDark: {
    color: colors.textSecondaryDark,
  },
});

