'use client';

import { ReactNode } from 'react';

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export function ResponsiveCard({ 
  children, 
  className = '', 
  padding = 'md',
  hover = false,
  clickable = false,
  onClick 
}: ResponsiveCardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  const baseClasses = `
    rounded-lg shadow-sm border transition-all duration-200
    ${paddingClasses[padding]}
    ${hover ? 'hover:shadow-md hover:scale-[1.02]' : ''}
    ${clickable ? 'cursor-pointer' : ''}
    ${className}
  `;

  return (
    <div 
      className={baseClasses}
      onClick={onClick}
      style={{ 
        background: 'var(--card)',
        borderColor: 'var(--border)',
        color: 'var(--card-foreground)'
      }}
    >
      {children}
    </div>
  );
}

export function ResponsiveCardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mb-4 sm:mb-6 ${className}`}>
      {children}
    </div>
  );
}

export function ResponsiveCardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`text-lg sm:text-xl font-semibold leading-none tracking-tight ${className}`} style={{ color: 'var(--foreground)' }}>
      {children}
    </h3>
  );
}

export function ResponsiveCardDescription({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-sm text-muted-foreground mt-1.5 ${className}`} style={{ color: 'var(--muted-foreground)' }}>
      {children}
    </p>
  );
}

export function ResponsiveCardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
}

export function ResponsiveCardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 pt-4 sm:pt-6 ${className}`}>
      {children}
    </div>
  );
}