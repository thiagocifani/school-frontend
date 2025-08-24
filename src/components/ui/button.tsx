import * as React from "react"
import { cn } from "@/lib/utils"
import { theme, getColor, getTransition } from "@/lib/theme"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
    
    const sizeStyles = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    }
    
    const variantStyles = {
      primary: {
        background: getColor('primary'),
        color: getColor('primaryForeground'),
        border: 'none',
        hover: 'brightness-110',
        focus: `ring-2 ring-offset-2 ring-[${getColor('ring')}]`,
      },
      secondary: {
        background: getColor('secondary'),
        color: getColor('secondaryForeground'),
        border: 'none',
        hover: 'brightness-95',
        focus: `ring-2 ring-offset-2 ring-[${getColor('ring')}]`,
      },
      accent: {
        background: getColor('accent'),
        color: getColor('accentForeground'),
        border: 'none',
        hover: 'brightness-110',
        focus: `ring-2 ring-offset-2 ring-[${getColor('ring')}]`,
      },
      success: {
        background: getColor('success'),
        color: getColor('successForeground'),
        border: 'none',
        hover: 'brightness-110',
        focus: `ring-2 ring-offset-2 ring-[${getColor('success')}]`,
      },
      warning: {
        background: getColor('warning'),
        color: getColor('warningForeground'),
        border: 'none',
        hover: 'brightness-110',
        focus: `ring-2 ring-offset-2 ring-[${getColor('warning')}]`,
      },
      error: {
        background: getColor('error'),
        color: getColor('errorForeground'),
        border: 'none',
        hover: 'brightness-110',
        focus: `ring-2 ring-offset-2 ring-[${getColor('error')}]`,
      },
      outline: {
        background: 'transparent',
        color: getColor('primary'),
        border: `1px solid ${getColor('primary')}`,
        hover: {
          background: getColor('primary'),
          color: getColor('primaryForeground'),
        },
        focus: `ring-2 ring-offset-2 ring-[${getColor('ring')}]`,
      },
      ghost: {
        background: 'transparent',
        color: getColor('mutedForeground'),
        border: 'none',
        hover: {
          background: getColor('muted'),
          color: getColor('foreground'),
        },
        focus: `ring-2 ring-offset-2 ring-[${getColor('ring')}]`,
      },
    }

    const currentVariant = variantStyles[variant] || variantStyles.primary
    const isDisabled = disabled || loading

    return (
      <button
        className={cn(
          baseStyles,
          sizeStyles[size],
          getTransition('default'),
          className
        )}
        ref={ref}
        disabled={isDisabled}
        style={{
          background: currentVariant?.background || getColor('primary'),
          color: currentVariant?.color || getColor('primaryForeground'),
          border: currentVariant?.border || 'none',
        }}
        onMouseEnter={(e) => {
          if (currentVariant?.hover && typeof currentVariant.hover === 'object') {
            e.currentTarget.style.background = currentVariant.hover.background || ''
            e.currentTarget.style.color = currentVariant.hover.color || ''
          } else if (typeof currentVariant?.hover === 'string') {
            e.currentTarget.style.filter = currentVariant.hover
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = currentVariant?.background || getColor('primary')
          e.currentTarget.style.color = currentVariant?.color || getColor('primaryForeground')
          e.currentTarget.style.filter = 'none'
        }}
        onFocus={(e) => {
          if (currentVariant?.focus) {
            e.currentTarget.style.boxShadow = currentVariant.focus
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none'
        }}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }