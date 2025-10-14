# 📱 Responsive Development Guide

## Quick Start for Developers

This guide helps you work with the newly refactored responsive architecture.

## 🎯 Core Concepts

### 1. Mobile-First Philosophy

**Always write styles for mobile first, then enhance for larger screens:**

```tsx
// ✅ CORRECT - Mobile first
const Button = styled.button`
  padding: 1rem;              // Base (mobile)
  font-size: 0.875rem;        // Base (mobile)
  
  @media (min-width: 768px) {  // Tablet and up
    padding: 1.25rem;
    font-size: 1rem;
  }
  
  @media (min-width: 1024px) { // Desktop and up
    padding: 1.5rem;
    font-size: 1.125rem;
  }
`;

// ❌ WRONG - Desktop first
const Button = styled.button`
  padding: 1.5rem;             // Desktop size
  
  @media (max-width: 1024px) {
    padding: 1.25rem;          // Don't use max-width
  }
`;
```

### 2. Using the Theme

**Always use theme tokens instead of hardcoded values:**

```tsx
import styled from 'styled-components';

// ✅ CORRECT - Theme tokens
const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.foreground};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  
  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding: ${({ theme }) => theme.spacing.xl};
  }
`;

// ❌ WRONG - Hardcoded values
const Container = styled.div`
  padding: 16px;
  color: #333;
  font-size: 14px;
  
  @media (min-width: 768px) {
    padding: 24px;
  }
`;
```

### 3. Responsive Logic with Hooks

**Use `useBreakpoint` for conditional rendering/logic:**

```tsx
import { useBreakpoint } from '@/hooks/useBreakpoint';

const MyComponent = () => {
  const { isMobile, isTablet, isDesktop, current } = useBreakpoint();
  
  // Conditional rendering
  if (isMobile) {
    return <MobileLayout />;
  }
  
  // Disable effects on mobile/tablet
  const shouldAnimate = !isMobile && !isTablet;
  
  return (
    <motion.div
      animate={shouldAnimate ? { scale: 1.1 } : {}}
    >
      {/* Content */}
    </motion.div>
  );
};
```

## 🎨 Common Patterns

### Pattern 1: Responsive Grid

```tsx
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;           // Mobile: 1 column
  gap: ${({ theme }) => theme.spacing.md};
  
  @media ${({ theme }) => theme.mediaQueries.tablet} {
    grid-template-columns: repeat(2, 1fr);  // Tablet: 2 columns
    gap: ${({ theme }) => theme.spacing.lg};
  }
  
  @media ${({ theme }) => theme.mediaQueries.desktop} {
    grid-template-columns: repeat(3, 1fr);  // Desktop: 3 columns
    gap: ${({ theme }) => theme.spacing.xl};
  }
`;
```

### Pattern 2: Responsive Typography

```tsx
const Title = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.serif};
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};  // Mobile
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  
  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  }
  
  @media ${({ theme }) => theme.mediaQueries.desktop} {
    font-size: ${({ theme }) => theme.typography.fontSize['5xl']};
  }
`;
```

### Pattern 3: Responsive Spacing

```tsx
const Section = styled.section`
  padding: ${({ theme }) => theme.spacing.lg};  // Mobile
  
  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding: ${({ theme }) => theme.spacing.xl};
  }
  
  @media ${({ theme }) => theme.mediaQueries.desktop} {
    padding: ${({ theme }) => theme.spacing['2xl']};
  }
`;
```

### Pattern 4: Touch Targets

```tsx
const Button = styled.button`
  min-width: ${({ theme }) => theme.touchTargets.min};    // 44px
  min-height: ${({ theme }) => theme.touchTargets.min};   // 44px
  display: flex;
  align-items: center;
  justify-content: center;
  
  // For important actions
  @media ${({ theme }) => theme.mediaQueries.tablet} {
    min-width: ${({ theme }) => theme.touchTargets.comfortable};  // 48px
    min-height: ${({ theme }) => theme.touchTargets.comfortable};
  }
`;
```

### Pattern 5: Performance-Aware Animations

```tsx
const AnimatedCard = () => {
  const { isMobile, isTablet } = useBreakpoint();
  const shouldUse3D = !isMobile && !isTablet;
  
  return (
    <Card
      whileHover={shouldUse3D ? { 
        scale: 1.05, 
        rotateY: 5 
      } : {
        scale: 1.02  // Simpler on mobile
      }}
    >
      {/* Content */}
    </Card>
  );
};
```

## 📐 Breakpoint Reference

```tsx
import { breakpoints, mediaQueries } from '@/theme/theme';

// Breakpoint values
breakpoints.mobile        // 320px
breakpoints.mobileLarge   // 480px
breakpoints.tablet        // 768px
breakpoints.desktop       // 1024px
breakpoints.desktopLarge  // 1440px
breakpoints.desktopXL     // 1920px

// Media queries (use in styled-components)
@media ${({ theme }) => theme.mediaQueries.mobileLarge} { }
@media ${({ theme }) => theme.mediaQueries.tablet} { }
@media ${({ theme }) => theme.mediaQueries.desktop} { }
@media ${({ theme }) => theme.mediaQueries.desktopLarge} { }
@media ${({ theme }) => theme.mediaQueries.desktopXL} { }
```

## 🎨 Design Token Reference

### Colors
```tsx
theme.colors.background
theme.colors.foreground
theme.colors.primary
theme.colors.primaryForeground
theme.colors.secondary
theme.colors.accent
theme.colors.muted
theme.colors.mutedForeground
theme.colors.border
theme.colors.card
```

### Spacing
```tsx
theme.spacing.xs   // clamp(0.25rem, 0.5vw, 0.5rem)
theme.spacing.sm   // clamp(0.5rem, 1vw, 0.75rem)
theme.spacing.md   // clamp(0.75rem, 1.5vw, 1rem)
theme.spacing.lg   // clamp(1rem, 2vw, 1.5rem)
theme.spacing.xl   // clamp(1.5rem, 3vw, 2rem)
theme.spacing['2xl']  // clamp(2rem, 4vw, 3rem)
theme.spacing['3xl']  // clamp(3rem, 6vw, 4rem)
// ... more
```

### Typography
```tsx
// Font families
theme.typography.fontFamily.sans   // Montserrat
theme.typography.fontFamily.serif  // Cormorant Garamond

// Font sizes (fluid)
theme.typography.fontSize.xs
theme.typography.fontSize.sm
theme.typography.fontSize.base
theme.typography.fontSize.lg
theme.typography.fontSize.xl
theme.typography.fontSize['2xl']
// ... up to 6xl

// Font weights
theme.typography.fontWeight.light    // 300
theme.typography.fontWeight.normal   // 400
theme.typography.fontWeight.medium   // 500
theme.typography.fontWeight.semibold // 600
theme.typography.fontWeight.bold     // 700
```

### Shadows & Effects
```tsx
theme.shadows.elegant
theme.shadows.lift
theme.shadows.glow
theme.shadows.sm
theme.shadows.md
theme.shadows.lg
theme.shadows.xl

theme.transitions.smooth
theme.transitions.bounce
theme.transitions.fast
theme.transitions.slow

theme.borderRadius.none
theme.borderRadius.sm
theme.borderRadius.md
theme.borderRadius.lg
theme.borderRadius.xl
theme.borderRadius['2xl']
theme.borderRadius.full
```

## 🔧 Utility Hooks

### useBreakpoint

```tsx
import { useBreakpoint } from '@/hooks/useBreakpoint';

const Component = () => {
  const {
    current,        // 'mobile' | 'mobileLarge' | 'tablet' | 'desktop' | ...
    isMobile,       // true if < 480px
    isMobileLarge,  // true if >= 480px && < 768px
    isTablet,       // true if >= 768px && < 1024px
    isDesktop,      // true if >= 1024px && < 1440px
    isDesktopLarge, // true if >= 1440px && < 1920px
    isDesktopXL,    // true if >= 1920px
    width,          // Current window width
    height,         // Current window height
  } = useBreakpoint();
  
  return <div>{/* Conditional content */}</div>;
};
```

### useMediaQuery

```tsx
import { useMediaQuery } from '@/hooks/useBreakpoint';

const Component = () => {
  const isTabletOrAbove = useMediaQuery('tablet');
  const isDesktopOrAbove = useMediaQuery('desktop');
  
  return (
    <>
      {isTabletOrAbove && <TabletFeature />}
      {isDesktopOrAbove && <DesktopFeature />}
    </>
  );
};
```

## 📱 Testing Responsive Designs

### Browser DevTools
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test these breakpoints:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - iPad Pro (1024px)
   - Desktop (1440px)

### Key Things to Check
- ✅ No horizontal overflow/scrolling
- ✅ Touch targets are 44px+ minimum
- ✅ Text is readable (not too small)
- ✅ Images scale properly
- ✅ Navigation works on mobile
- ✅ Forms are usable
- ✅ Animations perform well

## 🚫 Common Mistakes to Avoid

### 1. Using Fixed Pixel Values
```tsx
// ❌ BAD
const Box = styled.div`
  padding: 16px;
  font-size: 14px;
`;

// ✅ GOOD
const Box = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;
```

### 2. Using max-width Media Queries
```tsx
// ❌ BAD - Desktop first
@media (max-width: 768px) {
  padding: 1rem;
}

// ✅ GOOD - Mobile first
padding: 1rem;  // Base mobile style

@media ${({ theme }) => theme.mediaQueries.tablet} {
  padding: 2rem;  // Enhance for tablet+
}
```

### 3. Forgetting Touch Targets
```tsx
// ❌ BAD - Too small for touch
const IconButton = styled.button`
  width: 24px;
  height: 24px;
`;

// ✅ GOOD - Proper touch target
const IconButton = styled.button`
  min-width: ${({ theme }) => theme.touchTargets.min};
  min-height: ${({ theme }) => theme.touchTargets.min};
  padding: ${({ theme }) => theme.spacing.sm};
  
  svg {
    width: 24px;  // Icon can be smaller
    height: 24px;
  }
`;
```

### 4. Heavy Effects on Mobile
```tsx
// ❌ BAD - Parallax on all devices
const Section = styled(motion.section)`
  /* Heavy animations */
`;

// ✅ GOOD - Conditional effects
const MySection = () => {
  const { isMobile, isTablet } = useBreakpoint();
  const shouldUseParallax = !isMobile && !isTablet;
  
  return (
    <Section
      style={shouldUseParallax ? { /* parallax */ } : {}}
    >
      {/* Content */}
    </Section>
  );
};
```

## 📚 Additional Resources

- **Full Documentation:** See `RESPONSIVE_REFACTORING_GUIDE.md`
- **Summary:** See `REFACTORING_SUMMARY.md`
- **Theme Reference:** `src/theme/theme.ts`
- **Example Components:** `src/components/`

## 🎯 Best Practices Checklist

When creating new components:

- [ ] Start with mobile styles (320px base)
- [ ] Use theme tokens (no hardcoded values)
- [ ] Progressive enhancement with min-width media queries
- [ ] Touch targets are 44px+ minimum
- [ ] Test on multiple breakpoints
- [ ] Disable heavy effects on mobile
- [ ] Use `useBreakpoint` for conditional logic
- [ ] Ensure no horizontal overflow
- [ ] TypeScript types for all props
- [ ] Co-locate styles with component

---

**Happy Coding! 🎉**

For questions or issues, refer to the comprehensive documentation in `RESPONSIVE_REFACTORING_GUIDE.md`.



