// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { HeroSection } from '@/components/home/HeroSection'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const dict: Record<string, string> = {
      label: 'Premium Barber',
      title: 'Style Meets Precision',
      subtitle: 'Book your next cut now',
      cta1: 'Book now',
      cta2: 'See services',
    }

    return dict[key] ?? key
  },
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/id',
}))

describe('HeroSection', () => {
  it('renders headline and CTA links with locale path', () => {
    render(<HeroSection />)

    expect(screen.getByRole('heading', { name: 'Style Meets Precision' })).toBeInTheDocument()

    const bookingLink = screen.getByRole('link', { name: 'Book now' })
    const servicesLink = screen.getByRole('link', { name: 'See services' })

    expect(bookingLink).toHaveAttribute('href', '/id/booking')
    expect(servicesLink).toHaveAttribute('href', '/id/layanan')
  })
})
