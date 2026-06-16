'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'outline' | 'secondary';
export type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  isLoading?: boolean;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:   'bg-white text-black hover:bg-gray-200 active:bg-gray-300 font-semibold shadow-sm',
  secondary: 'bg-[#1a1a1a] text-white hover:bg-[#252525] active:bg-[#2a2a2a]',
  ghost:     'text-gray-400 hover:text-white hover:bg-[#1a1a1a] active:bg-[#222]',
  outline:   'border border-[#333] text-gray-300 hover:bg-[#1a1a1a] hover:text-white',
  danger:    'text-red-400 hover:text-red-300 hover:bg-red-500/10',
};

const sizes: Record<ButtonSize, string> = {
  xs: 'h-8  px-2.5 text-xs  gap-1.5',
  sm: 'h-9  px-3   text-sm  gap-2',
  md: 'h-10 px-4   text-sm  gap-2',
  lg: 'h-12 px-5   text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'ghost', size = 'md', isLoading, leftIcon, rightIcon, children, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium',
        'transition-all duration-150 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-black',
        'disabled:pointer-events-none disabled:opacity-40',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {isLoading
        ? <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  ),
);
Button.displayName = 'Button';
