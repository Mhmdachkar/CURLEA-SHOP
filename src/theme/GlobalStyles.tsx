import { createGlobalStyle } from 'styled-components';
import { Theme } from './theme';

/**
 * Mobile-First Global Styles
 * Provides base reset and global CSS
 */
export const GlobalStyles = createGlobalStyle<{ theme: Theme }>`
  /* Reset and Box Sizing */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* Smooth scrolling for better user experience */
  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  /* Optimize scrolling performance on mobile */
  * {
    -webkit-overflow-scrolling: touch;
  }

  /* Base body styles - Mobile First */
  body {
    margin: 0;
    padding: 0;
    font-family: ${({ theme }) => theme.typography.fontFamily.sans};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.normal};
    color: ${({ theme }) => theme.colors.foreground};
    background-color: ${({ theme }) => theme.colors.background};
    overflow-x: hidden;
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height for mobile */
  }

  /* Typography - Mobile First */
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-family: ${({ theme }) => theme.typography.fontFamily.serif};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    letter-spacing: -0.02em;
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  }

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['5xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  }

  h2 {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  }

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  }

  h4 {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  }

  h5 {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  }

  h6 {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  }

  p {
    margin: 0;
    line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
  }

  /* Links */
  a {
    color: inherit;
    text-decoration: none;
    transition: ${({ theme }) => theme.transitions.fast};
  }

  /* Lists */
  ul, ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  /* Buttons */
  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
  }

  /* Images - Optimized for performance */
  img {
    max-width: 100%;
    height: auto;
    display: block;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }

  /* GPU acceleration for better performance */
  .hero-section,
  .hero-section *,
  .product-card,
  .product-card * {
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
  }

  /* Focus styles for accessibility */
  *:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.ring};
    outline-offset: 2px;
  }

  /* Remove default focus styles */
  *:focus {
    outline: none;
  }

  /* Prevent horizontal overflow */
  body, html {
    max-width: 100%;
    overflow-x: hidden;
  }

  /* Container utility for preventing overflow */
  .container {
    width: 100%;
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: ${({ theme }) => theme.spacing.md};
    padding-right: ${({ theme }) => theme.spacing.md};

    @media ${({ theme }) => theme.mediaQueries.tablet} {
      padding-left: ${({ theme }) => theme.spacing.lg};
      padding-right: ${({ theme }) => theme.spacing.lg};
    }

    @media ${({ theme }) => theme.mediaQueries.desktop} {
      max-width: ${({ theme }) => theme.breakpoints.desktop}px;
      padding-left: ${({ theme }) => theme.spacing.xl};
      padding-right: ${({ theme }) => theme.spacing.xl};
    }

    @media ${({ theme }) => theme.mediaQueries.desktopLarge} {
      max-width: ${({ theme }) => theme.breakpoints.desktopLarge}px;
    }
  }

  /* Utility classes */
  .text-balance {
    text-wrap: balance;
  }

  .line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .line-clamp-3 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  /* Selection */
  ::selection {
    background-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accentForeground};
  }

  /* Scrollbar styling - Mobile first (hidden on mobile) */
  ::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: ${({ theme }) => theme.colors.muted};
    }

    ::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.colors.border};
      border-radius: ${({ theme }) => theme.borderRadius.md};
    }

    ::-webkit-scrollbar-thumb:hover {
      background: ${({ theme }) => theme.colors.mutedForeground};
    }
  }
`;

