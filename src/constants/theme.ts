export const COLORS = {
  // Backgrounds
  background: '#0A0E1A',
  surface: '#111827',
  card: '#1A2235',
  cardElevated: '#1E2D48',

  // Brand
  primary: '#00C896',
  primaryDark: '#00A07A',
  primaryLight: '#00E5AD',

  // Market colors
  gain: '#00C896',
  loss: '#FF4757',
  neutral: '#FFB300',

  // UI
  info: '#58A6FF',
  warning: '#FFB300',
  danger: '#FF4757',
  gold: '#FFD700',

  // Text
  text: '#E8F0FE',
  textSecondary: '#8B9DC3',
  textMuted: '#4A5568',

  // Borders
  border: '#1E2D48',
  borderLight: '#2D3F5C',

  // Risk profiles
  conservative: '#58A6FF',
  moderate: '#FFB300',
  aggressive: '#FF6B6B',
};

export const FONTS = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    giant: 36,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  button: {
    shadowColor: '#00C896',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};
