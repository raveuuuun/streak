import React from 'react';
import { Button as PaperButton } from 'react-native-paper';
import type { ButtonProps as PaperButtonProps } from 'react-native-paper';

interface ButtonProps extends PaperButtonProps {
  variant?: 'primary' | 'secondary' | 'outlined' | 'text';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  fullWidth = false,
  mode,
  style,
  ...props
}) => {
  const getMode = () => {
    if (mode) return mode;
    switch (variant) {
      case 'outlined':
        return 'outlined';
      case 'text':
        return 'text';
      default:
        return 'contained';
    }
  };

  return (
    <PaperButton
      mode={getMode()}
      style={[
        fullWidth && { width: '100%' },
        style,
      ]}
      {...props}
    />
  );
};

