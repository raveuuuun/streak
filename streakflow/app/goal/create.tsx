import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Button, Input } from '@/components/common';
import { colors, spacing, borderRadius } from '@/constants';
import { useGoals } from '@/context/GoalsContext';
import { useTheme } from '@/context/ThemeContext';
import { validateGoalName, validateGoalDescription } from '@/lib/utils/validation';
import type { GoalType } from '@/types/goal';

export default function CreateGoalScreen() {
  const router = useRouter();
  const { createGoal, loading } = useGoals();
  const { isDark } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<GoalType>('daily');
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  const handleCreate = async () => {
    const nameValidation = validateGoalName(name);
    const descValidation = validateGoalDescription(description);

    if (!nameValidation.valid) {
      setErrors({ name: nameValidation.error });
      return;
    }

    if (!descValidation.valid) {
      setErrors({ description: descValidation.error });
      return;
    }

    setErrors({});

    try {
      await createGoal({
        name,
        description: description || undefined,
        type,
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not create goal');
    }
  };

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, isDark && styles.titleDark]}>Create Goal</Text>

      <Input
        label="Goal Name"
        value={name}
        onChangeText={setName}
        placeholder="e.g., Exercise daily"
        error={errors.name}
        disabled={loading}
      />

      <Input
        label="Description (Optional)"
        value={description}
        onChangeText={setDescription}
        placeholder="Add a description..."
        multiline
        numberOfLines={4}
        error={errors.description}
        disabled={loading}
      />

      <View style={styles.pickerContainer}>
        <Text style={[styles.pickerLabel, isDark && styles.pickerLabelDark]}>
          Goal Type
        </Text>
        <View style={[styles.picker, isDark && styles.pickerDark]}>
          <Picker
            selectedValue={type}
            onValueChange={(value) => setType(value)}
            style={[styles.pickerStyle, isDark && styles.pickerStyleDark]}
            itemStyle={isDark ? styles.pickerItemDark : styles.pickerItem}
          >
            <Picker.Item label="Daily" value="daily" color={isDark ? colors.textNormalDark : colors.textNormal} />
            <Picker.Item label="Weekly" value="weekly" color={isDark ? colors.textNormalDark : colors.textNormal} />
            <Picker.Item label="Monthly" value="monthly" color={isDark ? colors.textNormalDark : colors.textNormal} />
          </Picker>
        </View>
      </View>

      <Button
        mode="contained"
        onPress={handleCreate}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Create Goal
      </Button>

      <Button
        mode="outlined"
        onPress={() => router.back()}
        disabled={loading}
      >
        Cancel
      </Button>
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
    padding: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xl,
  },
  titleDark: {
    color: colors.textDark,
  },
  pickerContainer: {
    marginVertical: spacing.md,
  },
  pickerLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  pickerLabelDark: {
    color: colors.textDark,
  },
  picker: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  pickerDark: {
    borderColor: colors.borderDark,
    backgroundColor: colors.surfaceDark,
  },
  pickerStyle: {
    color: colors.textNormal,
    backgroundColor: 'transparent',
  },
  pickerStyleDark: {
    color: colors.textNormalDark,
    backgroundColor: 'transparent',
  },
  pickerItem: {
    color: colors.textNormal,
  },
  pickerItemDark: {
    color: colors.textNormalDark,
  },
  button: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
});

