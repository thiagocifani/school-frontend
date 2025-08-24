import * as React from "react"
import { cn } from "@/lib/utils"
import { getColor, getTransition } from "@/lib/theme"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseStyles = "flex w-full rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    
    const sizeStyles = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-3 text-sm",
      lg: "h-12 px-4 text-base",
    }
    
    const variantStyles = {
      default: {
        border: `1px solid ${getColor('border')}`,
        background: getColor('input'),
        color: getColor('foreground'),
        focus: `ring-2 ring-offset-2 ring-[${getColor('ring')}]`,
        placeholder: getColor('mutedForeground'),
      },
      success: {
        border: `1px solid ${getColor('success')}`,
        background: getColor('input'),
        color: getColor('foreground'),
        focus: `ring-2 ring-offset-2 ring-[${getColor('success')}]`,
        placeholder: getColor('mutedForeground'),
      },
      warning: {
        border: `1px solid ${getColor('warning')}`,
        background: getColor('input'),
        color: getColor('foreground'),
        focus: `ring-2 ring-offset-2 ring-[${getColor('warning')}]`,
        placeholder: getColor('mutedForeground'),
      },
      error: {
        border: `1px solid ${getColor('error')}`,
        background: getColor('input'),
        color: getColor('foreground'),
        focus: `ring-2 ring-offset-2 ring-[${getColor('error')}]`,
        placeholder: getColor('mutedForeground'),
      },
    }

    const currentVariant = variantStyles[variant]

    return (
      <input
        className={cn(
          baseStyles,
          sizeStyles[size],
          getTransition('default'),
          className
        )}
        ref={ref}
        style={{
          border: currentVariant.border,
          background: currentVariant.background,
          color: currentVariant.color,
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = currentVariant.focus
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none'
        }}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }