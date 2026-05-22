'use client'

import { cn } from '@/lib/utils'
import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  containerClassName?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, containerClassName, ...props }, ref) => {
    return (
      <div className={containerClassName}>
        {label && (
          <label className="block text-sm font-medium text-[#F5F5F0] mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-[#1C1C1C] border border-[#2A2A25] rounded-lg text-[#F5F5F0] placeholder-[#5A5A55]',
            'transition-all duration-200 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] focus:outline-none',
            error && 'border-[#E55353] focus:ring-[#E55353]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[#E55353] text-xs font-medium mt-1">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
