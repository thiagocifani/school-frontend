/**
 * Responsive Design System
 * Breakpoints and utilities for consistent responsive behavior
 */

// Breakpoint definitions (matching Tailwind CSS)
export const breakpoints = {
  xs: '0px',     // Extra small devices
  sm: '640px',   // Small devices (tablets, phones in landscape)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (small desktops)
  xl: '1280px',  // Extra large devices (large desktops)
  '2xl': '1536px' // 2X Large devices (larger desktops)
} as const;

// Media queries
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs})`,
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
  
  // Max width media queries
  'max-xs': `(max-width: ${parseFloat(breakpoints.sm) - 0.1}px)`,
  'max-sm': `(max-width: ${parseFloat(breakpoints.md) - 0.1}px)`,
  'max-md': `(max-width: ${parseFloat(breakpoints.lg) - 0.1}px)`,
  'max-lg': `(max-width: ${parseFloat(breakpoints.xl) - 0.1}px)`,
  'max-xl': `(max-width: ${parseFloat(breakpoints['2xl']) - 0.1}px)`,
} as const;

// Hook to detect current breakpoint
export function useBreakpoint() {
  if (typeof window === 'undefined') {
    return 'sm'; // Default for SSR
  }

  const getBreakpoint = () => {
    const width = window.innerWidth;
    
    if (width >= parseFloat(breakpoints['2xl'])) return '2xl';
    if (width >= parseFloat(breakpoints.xl)) return 'xl';
    if (width >= parseFloat(breakpoints.lg)) return 'lg';
    if (width >= parseFloat(breakpoints.md)) return 'md';
    if (width >= parseFloat(breakpoints.sm)) return 'sm';
    return 'xs';
  };

  return getBreakpoint();
}

// Hook to check if viewport matches a breakpoint
export function useMediaQuery(query: string) {
  if (typeof window === 'undefined') {
    return false;
  }

  const [matches, setMatches] = React.useState(() => {
    return window.matchMedia(query).matches;
  });

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, [query]);

  return matches;
}

// Utility functions for responsive values
export function getResponsiveValue<T>(
  values: Partial<Record<keyof typeof breakpoints, T>>,
  currentBreakpoint: keyof typeof breakpoints
): T | undefined {
  const orderedBreakpoints: (keyof typeof breakpoints)[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = orderedBreakpoints.indexOf(currentBreakpoint);
  
  // Find the largest breakpoint that has a value and is <= current breakpoint
  for (let i = currentIndex; i >= 0; i--) {
    const breakpoint = orderedBreakpoints[i];
    if (values[breakpoint] !== undefined) {
      return values[breakpoint];
    }
  }
  
  return undefined;
}

// Common responsive classes
export const responsiveClasses = {
  // Grid columns
  gridCols: {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  },
  
  // Flex direction
  flexDir: {
    col: 'flex-col',
    row: 'flex-col sm:flex-row'
  },
  
  // Text sizes
  text: {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
    '3xl': 'text-3xl sm:text-4xl'
  },
  
  // Spacing
  padding: {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  },
  
  gap: {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4',
    lg: 'gap-4 sm:gap-6'
  },
  
  // Heights
  height: {
    auto: 'h-auto',
    screen: 'min-h-screen',
    header: 'h-12 sm:h-16'
  }
} as const;

// Responsive container widths
export const containerWidths = {
  xs: '100%',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// Device detection utilities
export const deviceUtils = {
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < parseFloat(breakpoints.md);
  },
  
  isTablet: () => {
    if (typeof window === 'undefined') return false;
    const width = window.innerWidth;
    return width >= parseFloat(breakpoints.md) && width < parseFloat(breakpoints.lg);
  },
  
  isDesktop: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= parseFloat(breakpoints.lg);
  },
  
  // Touch device detection
  isTouchDevice: () => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
} as const;

// Responsive font sizes (in rem)
export const fontSizes = {
  xs: { mobile: '0.75rem', desktop: '0.875rem' },     // 12px -> 14px
  sm: { mobile: '0.875rem', desktop: '1rem' },        // 14px -> 16px
  base: { mobile: '1rem', desktop: '1.125rem' },      // 16px -> 18px
  lg: { mobile: '1.125rem', desktop: '1.25rem' },     // 18px -> 20px
  xl: { mobile: '1.25rem', desktop: '1.5rem' },       // 20px -> 24px
  '2xl': { mobile: '1.5rem', desktop: '2rem' },       // 24px -> 32px
  '3xl': { mobile: '2rem', desktop: '2.5rem' }        // 32px -> 40px
} as const;

// Export a React import for the hooks
import React from 'react';