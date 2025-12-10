export const colors = {
  // Primary colors
  primary: '#5B69FF', // Main accent
  primaryDark: '#4B4FEA', // Pressed/active
  primaryLight: '#7B85FF', // Lighter variant for hover states
  
  // Secondary colors (kept for compatibility, using neutral tones)
  secondary: '#5B69FF',
  secondaryDark: '#4B4FEA',
  secondaryLight: '#7B85FF',
  
  // Accent colors (success/streak)
  accent: '#38C682', // Success/streak
  accentDark: '#25A76A', // Success dark
  accentLight: '#4DD99A', // Lighter success
  
  // Status colors
  success: '#38C682',
  successDark: '#25A76A',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#5B69FF',
  
  // Background colors
  background: '#FFFFFF', // Main background
  backgroundDark: '#0F172A', // Dark mode background
  surface: '#F7F8FC', // Light section background
  surfaceDark: '#1E293B', // Dark mode surface
  surfaceSoft: '#E6E8F2', // Soft card background
  surfaceSoftDark: '#1E293B',
  
  // Text colors
  text: '#1E1E2D', // Titles
  textDark: '#F1F5F9', // Dark mode titles
  textNormal: '#3C3F52', // Normal text
  textNormalDark: '#E2E8F0', // Dark mode normal text
  textSecondary: '#70758F', // Subtext
  textSecondaryDark: '#94A3B8', // Dark mode subtext
  
  // Border and divider colors
  border: '#C8CDDD', // Borders/icons
  borderDark: '#334155', // Dark mode borders
  divider: '#EEF0F7', // Divider/input background
  dividerDark: '#2D3748', // Dark mode divider
  
  // Icon colors
  icon: '#C8CDDD', // Active icons
  iconInactive: '#A9AFC4', // Inactive icons
  iconDark: '#94A3B8',
  iconInactiveDark: '#64748B',
  
  // Input colors
  inputBackground: '#EEF0F7', // Input background
  inputBackgroundDark: '#1E293B', // Dark mode input background
  
  // Overlay
  overlay: 'rgba(30, 30, 45, 0.5)', // Using text color for overlay
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  
  // Shadow colors (using text color with opacity)
  shadow: 'rgba(30, 30, 45, 0.08)', // Light shadow
  shadowDark: 'rgba(0, 0, 0, 0.3)', // Dark mode shadow
} as const;

export type ColorKey = keyof typeof colors;

