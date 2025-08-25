'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface ResponsiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  responsive?: boolean;
}

export function ResponsiveButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  responsive = true,
  className = '',
  disabled,
  ...props
}: ResponsiveButtonProps) {
  const sizeClasses = {
    sm: responsive ? 'px-3 py-2 text-xs sm:text-sm h-8 sm:h-9' : 'px-3 py-2 text-sm h-9',
    md: responsive ? 'px-4 py-2 text-sm sm:text-base h-9 sm:h-10' : 'px-4 py-2 text-sm h-10',
    lg: responsive ? 'px-6 py-3 text-base sm:text-lg h-10 sm:h-11' : 'px-6 py-3 text-base h-11'
  };

  const variantStyles = {
    primary: {
      background: 'var(--primary)',
      color: 'var(--primary-foreground)',
      border: 'none',
      hover: 'brightness(110%)'
    },
    secondary: {
      background: 'var(--secondary)',
      color: 'var(--secondary-foreground)',
      border: 'none',
      hover: 'brightness(95%)'
    },
    outline: {
      background: 'transparent',
      color: 'var(--foreground)',
      border: '1px solid var(--border)',
      hover: 'var(--accent)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--foreground)',
      border: 'none',
      hover: 'var(--accent)'
    },
    destructive: {
      background: 'var(--destructive)',
      color: 'var(--destructive-foreground)',
      border: 'none',
      hover: 'brightness(110%)'
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2 rounded-md font-medium
    transition-all duration-200 focus-visible:outline-none focus-visible:ring-2
    focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background
    disabled:opacity-50 disabled:pointer-events-none
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${responsive ? 'min-w-0' : ''}
    ${className}
  `;

  const style = variantStyles[variant];

  return (
    <button
      className={baseClasses}
      style={{
        background: style.background,
        color: style.color,
        border: style.border
      }}
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          if (style.hover.includes('brightness')) {
            e.currentTarget.style.filter = style.hover;
          } else {
            e.currentTarget.style.background = style.hover;
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.filter = 'none';
          e.currentTarget.style.background = style.background;
        }
      }}
      {...props}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="h-4 w-4 flex-shrink-0" />}
          <span className={responsive ? 'truncate' : ''}>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="h-4 w-4 flex-shrink-0" />}
        </>
      )}
    </button>
  );
}

// Button group component for responsive button layouts
export function ResponsiveButtonGroup({ 
  children, 
  className = '',
  orientation = 'horizontal',
  spacing = 'md'
}: { 
  children: ReactNode; 
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
}) {
  const spacingClasses = {
    sm: orientation === 'horizontal' ? 'gap-2' : 'gap-2',
    md: orientation === 'horizontal' ? 'gap-3 sm:gap-4' : 'gap-3',
    lg: orientation === 'horizontal' ? 'gap-4 sm:gap-6' : 'gap-4'
  };

  const orientationClasses = orientation === 'horizontal' 
    ? 'flex flex-col sm:flex-row flex-wrap' 
    : 'flex flex-col';

  return (
    <div className={`${orientationClasses} ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
}