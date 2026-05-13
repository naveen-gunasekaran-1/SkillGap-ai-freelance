/**
 * SkillGap AI — Mobile Design System Theme
 * Modernized centralized design tokens.
 */
export const theme = {
  colors: {
    primary: '#2563EB',
    primaryDark: '#1E40AF',
    primaryLight: '#DBEAFE',
    aiPurple: '#7C3AED',
    aiCyan: '#06B6D4',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',
    border: '#E5E7EB',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    glass: 'rgba(255, 255, 255, 0.85)', // For glassmorphism effects
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  typography: {
    h1: { fontSize: 36, fontWeight: '800' as const, lineHeight: 44, letterSpacing: -0.5 },
    h2: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36, letterSpacing: -0.3 },
    h3: { fontSize: 22, fontWeight: '600' as const, lineHeight: 30, letterSpacing: -0.2 },
    body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
    caption: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
    small: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  },
  borderRadius: {
    sm: 8,
    card: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    pill: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 2,
    },
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 4,
    },
    cardHover: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 8,
    },
    elevated: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.1,
      shadowRadius: 36,
      elevation: 12,
    },
  },
  minTouchTarget: 48, // Increased for better accessibility
} as const;

export type Theme = typeof theme;
