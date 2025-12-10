import React from 'react';
import { TextInput as PaperTextInput } from 'react-native-paper';
import type { TextInputProps as PaperTextInputProps } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { spacing } from '@/constants/spacing';
import { colors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';

interface InputProps extends PaperTextInputProps {
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  error,
  helperText,
  style,
  ...props
}) => {
  const { isDark } = useTheme();

  return (
    <View style={styles.container}>
      <PaperTextInput
        mode="outlined"
        error={!!error}
        style={[
          styles.input,
          {
            backgroundColor: isDark ? colors.inputBackgroundDark : colors.inputBackground,
          },
          style,
        ]}
        outlineColor={isDark ? colors.borderDark : colors.border}
        activeOutlineColor={colors.primary}
        textColor={isDark ? colors.textNormalDark : colors.textNormal}
        {...props}
      />
      {(error || helperText) && (
        <PaperTextInput.HelperText
          type={error ? 'error' : 'info'}
          visible={true}
        >
          {error || helperText}
        </PaperTextInput.HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  input: {
    width: '100%',
  },
});

