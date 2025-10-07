import React from 'react';
import { cn } from '@/lib/utils';

interface MobileFirstContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  maxWidth?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-full',
};

const paddingClasses = {
  none: '',
  sm: 'px-2 sm:px-4',
  md: 'px-4 sm:px-6 lg:px-8',
  lg: 'px-6 sm:px-8 lg:px-12',
};

export const MobileFirstContainer: React.FC<MobileFirstContainerProps> = ({
  children,
  className,
  size = 'xl',
  padding = 'md',
  maxWidth = true,
}) => {
  return (
    <div
      className={cn(
        'w-full mx-auto',
        maxWidth && sizeClasses[size],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

// Mobile-First Grid Component
interface MobileFirstGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

const gapClasses = {
  sm: 'gap-2 sm:gap-3 lg:gap-4',
  md: 'gap-3 sm:gap-4 lg:gap-6',
  lg: 'gap-4 sm:gap-6 lg:gap-8',
};

export const MobileFirstGrid: React.FC<MobileFirstGridProps> = ({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
}) => {
  const gridCols = `grid-cols-${cols.mobile} sm:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop}`;
  
  return (
    <div
      className={cn(
        'grid',
        gridCols,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

// Mobile-First Typography Component
interface MobileFirstTextProps {
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  color?: string;
}

const textSizeClasses = {
  xs: 'fluid-text-xs',
  sm: 'fluid-text-sm',
  base: 'fluid-text-base',
  lg: 'fluid-text-lg',
  xl: 'fluid-text-xl',
  '2xl': 'fluid-text-2xl',
  '3xl': 'fluid-text-3xl',
  '4xl': 'fluid-text-4xl',
  '5xl': 'fluid-text-5xl',
  '6xl': 'fluid-text-6xl',
};

const textWeightClasses = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const textAlignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export const MobileFirstText: React.FC<MobileFirstTextProps> = ({
  children,
  className,
  size = 'base',
  weight = 'normal',
  align = 'left',
  color,
}) => {
  return (
    <p
      className={cn(
        textSizeClasses[size],
        textWeightClasses[weight],
        textAlignClasses[align],
        color,
        className
      )}
      style={{ color }}
    >
      {children}
    </p>
  );
};

// Mobile-First Section Component
interface MobileFirstSectionProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  background?: 'default' | 'muted' | 'primary' | 'accent';
}

const sectionPaddingClasses = {
  sm: 'py-8 sm:py-12',
  md: 'py-12 sm:py-16 lg:py-20',
  lg: 'py-16 sm:py-20 lg:py-24 xl:py-32',
  xl: 'py-20 sm:py-24 lg:py-32 xl:py-40',
};

const sectionBackgroundClasses = {
  default: 'bg-background',
  muted: 'bg-muted',
  primary: 'bg-primary text-primary-foreground',
  accent: 'bg-accent text-accent-foreground',
};

export const MobileFirstSection: React.FC<MobileFirstSectionProps> = ({
  children,
  className,
  padding = 'md',
  background = 'default',
}) => {
  return (
    <section
      className={cn(
        'w-full',
        sectionPaddingClasses[padding],
        sectionBackgroundClasses[background],
        className
      )}
    >
      <MobileFirstContainer>
        {children}
      </MobileFirstContainer>
    </section>
  );
};
