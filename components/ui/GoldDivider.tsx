'use client'

interface GoldDividerProps {
  className?: string
}

export function GoldDivider({ className = '' }: GoldDividerProps) {
  return <div className={`w-24 h-px bg-[#C9A84C] ${className}`} />
}
