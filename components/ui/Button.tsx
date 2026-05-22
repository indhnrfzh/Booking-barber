'use client'

import { cn } from '@/lib/utils'
import React from 'react'

type Variant = 'primary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
  children: React.ReactNode
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-[#C9A84C] text-black font-semibold hover:bg-[#E8C96A] active:scale-95',
  outline: 'border border-[#C9A84C] text-[#C9A84C] font-semibold hover:bg-[#C9A84C] hover:text-black',
  ghost: 'text-[#C9A84C] font-medium hover:text-[#E8C96A]',
}

const sizeStyles: Record<Size, string> = {
  sm: 'min-h-11 px-3 py-2 text-sm rounded-md',
  md: 'min-h-12 px-6 py-3 text-base rounded-lg',
  lg: 'min-h-12 px-8 py-4 text-lg rounded-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  isLoading,
  children,
  onClick,
  type,
  ...props
}: ButtonProps) {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (disabled || isLoading) {
      event.preventDefault()
      return
    }

    onClick?.(event)
    if (event.defaultPrevented) return

    const parent = event.currentTarget.parentElement
    if (parent && parent.tagName === 'A') {
      ;(parent as HTMLAnchorElement).click()
    }
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      type={type ?? 'button'}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}
