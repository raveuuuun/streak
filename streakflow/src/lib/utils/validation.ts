/**
 * Validation utilities for forms and inputs
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateGoalName = (name: string): {
  valid: boolean;
  error?: string;
} => {
  if (!name || name.trim().length === 0) {
    return {
      valid: false,
      error: 'Goal name is required',
    };
  }

  if (name.length > 100) {
    return {
      valid: false,
      error: 'Goal name must be less than 100 characters',
    };
  }

  return { valid: true };
};

export const validateGoalDescription = (description: string): {
  valid: boolean;
  error?: string;
} => {
  if (description && description.length > 500) {
    return {
      valid: false,
      error: 'Description must be less than 500 characters',
    };
  }

  return { valid: true };
};

export const validateFocusDuration = (duration: number): {
  valid: boolean;
  error?: string;
} => {
  const minDuration = 5 * 60; // 5 minutes
  const maxDuration = 120 * 60; // 2 hours

  if (duration < minDuration) {
    return {
      valid: false,
      error: `Duration must be at least ${minDuration / 60} minutes`,
    };
  }

  if (duration > maxDuration) {
    return {
      valid: false,
      error: `Duration must be less than ${maxDuration / 60} minutes`,
    };
  }

  return { valid: true };
};

export const formatValidationError = (errors: string[]): string => {
  return errors.join('. ');
};

