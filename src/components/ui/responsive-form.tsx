'use client';

import { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

// Form Container
interface ResponsiveFormProps {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export function ResponsiveForm({ children, onSubmit, className = '' }: ResponsiveFormProps) {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 sm:space-y-6 ${className}`}>
      {children}
    </form>
  );
}

// Form Grid - responsive grid layout
interface FormGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}

export function FormGrid({ children, cols = 2, className = '' }: FormGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridClasses[cols]} gap-4 sm:gap-6 ${className}`}>
      {children}
    </div>
  );
}

// Form Field - base field container
interface FormFieldProps {
  children: ReactNode;
  className?: string;
}

export function FormField({ children, className = '' }: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  );
}

// Form Label
interface FormLabelProps {
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}

export function FormLabel({ children, required, htmlFor, className = '' }: FormLabelProps) {
  return (
    <label 
      htmlFor={htmlFor}
      className={`block text-sm font-medium leading-6 ${className}`}
      style={{ color: 'var(--foreground)' }}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

// Responsive Input
interface ResponsiveInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  fullWidth?: boolean;
}

export function ResponsiveInput({ 
  error, 
  fullWidth = true, 
  className = '', 
  ...props 
}: ResponsiveInputProps) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <input
        className={`
          block px-3 py-2 border rounded-md shadow-sm text-sm sm:text-base
          transition-colors duration-200 focus:outline-none focus:ring-2 
          focus:ring-offset-0 placeholder:text-gray-400 
          ${fullWidth ? 'w-full' : ''}
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
          ${className}
        `}
        style={{ 
          borderColor: error ? '#ef4444' : 'var(--border)',
          background: 'var(--background)',
          color: 'var(--foreground)'
        }}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// Responsive Select
interface ResponsiveSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  fullWidth?: boolean;
  options?: { value: string | number; label: string }[];
}

export function ResponsiveSelect({ 
  error, 
  fullWidth = true, 
  className = '',
  options = [],
  children,
  ...props 
}: ResponsiveSelectProps) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <select
        className={`
          block px-3 py-2 border rounded-md shadow-sm text-sm sm:text-base
          transition-colors duration-200 focus:outline-none focus:ring-2 
          focus:ring-offset-0 bg-white
          ${fullWidth ? 'w-full' : ''}
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
          ${className}
        `}
        style={{ 
          borderColor: error ? '#ef4444' : 'var(--border)',
          background: 'var(--background)',
          color: 'var(--foreground)'
        }}
        {...props}
      >
        {options.length > 0 
          ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : children
        }
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// Responsive Textarea
interface ResponsiveTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  fullWidth?: boolean;
}

export function ResponsiveTextarea({ 
  error, 
  fullWidth = true, 
  className = '', 
  rows = 3,
  ...props 
}: ResponsiveTextareaProps) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <textarea
        rows={rows}
        className={`
          block px-3 py-2 border rounded-md shadow-sm text-sm sm:text-base
          transition-colors duration-200 focus:outline-none focus:ring-2 
          focus:ring-offset-0 placeholder:text-gray-400 resize-vertical
          ${fullWidth ? 'w-full' : ''}
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
          ${className}
        `}
        style={{ 
          borderColor: error ? '#ef4444' : 'var(--border)',
          background: 'var(--background)',
          color: 'var(--foreground)'
        }}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// Responsive Checkbox
interface ResponsiveCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  error?: string;
  description?: string;
}

export function ResponsiveCheckbox({ 
  label, 
  error, 
  description,
  className = '', 
  id,
  ...props 
}: ResponsiveCheckboxProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id={id}
          className={`
            mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 
            focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
            ${className}
          `}
          {...props}
        />
        <div className="flex-1 min-w-0">
          <label htmlFor={id} className="text-sm font-medium cursor-pointer" style={{ color: 'var(--foreground)' }}>
            {label}
          </label>
          {description && (
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
              {description}
            </p>
          )}
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// Form Actions - responsive button layout
interface FormActionsProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
  stack?: boolean;
  className?: string;
}

export function FormActions({ 
  children, 
  align = 'right', 
  stack = false,
  className = '' 
}: FormActionsProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <div className={`
      pt-4 sm:pt-6 border-t mt-6 sm:mt-8
      ${stack 
        ? 'flex flex-col gap-3' 
        : `flex flex-col sm:flex-row gap-3 sm:gap-4 ${alignClasses[align]}`
      }
      ${className}
    `} style={{ borderColor: 'var(--border)' }}>
      {children}
    </div>
  );
}

// Helper hook for form validation
export function useFormValidation() {
  const validateField = (value: any, rules: any) => {
    if (rules.required && (!value || value.toString().trim() === '')) {
      return 'Este campo é obrigatório';
    }
    
    if (rules.minLength && value && value.length < rules.minLength) {
      return `Mínimo ${rules.minLength} caracteres`;
    }
    
    if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Email inválido';
    }
    
    return null;
  };

  return { validateField };
}