import React, { useRef } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { spacing, borderRadius } from '@/constants/spacing';
import { colors } from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  elevation?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  elevation = 2,
}) => {
  const { isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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

  const cardStyle = [
    styles.card,
    isDark && styles.cardDark,
    {
      transform: [{ scale: scaleAnim }],
      elevation: elevation,
    },
    style,
  ];

  const content = (
    <View style={styles.content}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <Animated.View style={cardStyle}>
          {content}
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Animated.View style={cardStyle}>
      {content}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceSoft,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: colors.surfaceDark,
    shadowColor: colors.shadowDark,
    shadowOpacity: 1,
  },
  content: {
    padding: spacing.lg,
    minHeight: 60,
  },
  pressed: {
    opacity: 0.9,
  },
});

