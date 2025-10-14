/**
 * Curlea Luxe - Mobile-First Design System
 * Theme configuration with design tokens
 */

export const breakpoints = {
  mobile: 320,
  mobileLarge: 480,
  tablet: 768,
  desktop: 1024,
  desktopLarge: 1440,
  desktopXL: 1920,
} as const;

export const mediaQueries = {
  mobileLarge: `(min-width: ${breakpoints.mobileLarge}px)`,
  tablet: `(min-width: ${breakpoints.tablet}px)`,
  desktop: `(min-width: ${breakpoints.desktop}px)`,
  desktopLarge: `(min-width: ${breakpoints.desktopLarge}px)`,
  desktopXL: `(min-width: ${breakpoints.desktopXL}px)`,
} as const;

export const colors = {
  // Premium Palette
  background: 'hsl(30, 10%, 98%)',
  foreground: 'hsl(0, 0%, 8%)',
  
  // Primary
  primary: 'hsl(0, 0%, 8%)',
  primaryForeground: 'hsl(30, 10%, 98%)',
  
  // Secondary
  secondary: 'hsl(15, 25%, 65%)',
  secondaryForeground: 'hsl(0, 0%, 100%)',
  
  // Accent
  accent: 'hsl(25, 75%, 60%)',
  accentForeground: 'hsl(0, 0%, 100%)',
  
  // Muted
  muted: 'hsl(30, 10%, 95%)',
  mutedForeground: 'hsl(0, 0%, 40%)',
  
  // UI Elements
  border: 'hsl(30, 8%, 90%)',
  input: 'hsl(30, 8%, 92%)',
  ring: 'hsl(25, 75%, 60%)',
  
  // Cards
  card: 'hsl(0, 0%, 100%)',
  cardForeground: 'hsl(0, 0%, 8%)',
} as const;

export const spacing = {
  xs: 'clamp(0.25rem, 0.5vw, 0.5rem)',
  sm: 'clamp(0.5rem, 1vw, 0.75rem)',
  md: 'clamp(0.75rem, 1.5vw, 1rem)',
  lg: 'clamp(1rem, 2vw, 1.5rem)',
  xl: 'clamp(1.5rem, 3vw, 2rem)',
  '2xl': 'clamp(2rem, 4vw, 3rem)',
  '3xl': 'clamp(3rem, 6vw, 4rem)',
  '4xl': 'clamp(4rem, 8vw, 6rem)',
  '5xl': 'clamp(6rem, 12vw, 10rem)',
} as const;

export const typography = {
  fontFamily: {
    sans: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    serif: "'Cormorant Garamond', 'Georgia', serif",
  },
  fontSize: {
    xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
    sm: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
    base: 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
    lg: 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
    xl: 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
    '2xl': 'clamp(1.5rem, 1.3rem + 1vw, 1.875rem)',
    '3xl': 'clamp(1.875rem, 1.5rem + 1.875vw, 2.25rem)',
    '4xl': 'clamp(2.25rem, 1.8rem + 2.25vw, 3rem)',
    '5xl': 'clamp(3rem, 2.25rem + 3.75vw, 3.75rem)',
    '6xl': 'clamp(3.75rem, 2.75rem + 5vw, 4.5rem)',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
    loose: 2,
  },
  letterSpacing: {
    tight: '-0.03em',
    normal: '-0.01em',
    wide: '0.01em',
  },
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const;

export const shadows = {
  elegant: '0 20px 50px -10px hsl(0 0% 0% / 0.15)',
  lift: '0 10px 30px -5px hsl(0 0% 0% / 0.1)',
  glow: '0 0 40px hsl(25 75% 60% / 0.2)',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
} as const;

export const transitions = {
  smooth: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  fast: 'all 0.2s ease-in-out',
  slow: 'all 0.6s ease-in-out',
} as const;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  drawer: 1500,
  popover: 1600,
  tooltip: 1700,
  mobileMenu: 1800,
} as const;

export const touchTargets = {
  min: '44px',
  comfortable: '48px',
  spacing: '8px',
} as const;

export const gradients = {
  hero: 'linear-gradient(135deg, hsl(0 0% 0% / 0.7), hsl(0 0% 0% / 0.3))',
  gold: 'linear-gradient(135deg, hsl(25, 75%, 60%), hsl(35, 80%, 65%))',
  premium: 'linear-gradient(180deg, hsl(30, 10%, 98%), hsl(30, 15%, 96%))',
  radial: 'radial-gradient(circle, var(--gradient-start), var(--gradient-end))',
} as const;

export const theme = {
  breakpoints,
  mediaQueries,
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  touchTargets,
  gradients,
} as const;

export type Theme = typeof theme;

export default theme;

