'use client'

interface SectionLabelProps {
  children: React.ReactNode
  className?: string
}

export function SectionLabel({ children, className = '' }: SectionLabelProps) {
  return (
    <p className={`text-[#C9A84C] text-xs tracking-[0.2em] uppercase font-semibold mb-4 ${className}`}>
      {children}
    </p>
  )
}
