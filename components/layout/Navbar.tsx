'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useState, useEffect } from 'react'

export function Navbar() {
  const t = useTranslations('nav')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'id'
  const otherLocale = locale === 'id' ? 'en' : 'id'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: t('home'), href: `/${locale}` },
    { label: t('services'), href: `/${locale}/layanan` },
    { label: t('gallery'), href: `/${locale}/galeri` },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#141414]/90 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="container h-16 pt-[env(safe-area-inset-top)] flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-baseline gap-1">
          <span className="font-cormorant text-2xl font-bold text-[#C9A84C]">PRESTIGE</span>
          <span className="text-xs tracking-[0.2em] text-[#5A5A55] uppercase">Barbershop</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[#F5F5F0] hover:text-[#C9A84C] transition-colors text-sm"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <Link
            href={pathname.replace(/^\/[a-z]{2}/, `/${otherLocale}`)}
            className="text-xs uppercase font-semibold tracking-wider text-[#C9A84C] hover:text-[#E8C96A] transition-colors px-3 py-2"
          >
            {otherLocale.toUpperCase()}
          </Link>

          {/* Book Now Button */}
          <Link href={`/${locale}/booking`}>
            <Button size="sm" className="hidden sm:inline-flex">
              {t('bookNow')}
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden inline-flex min-h-12 min-w-12 items-center justify-center"
          >
            <span className="inline-flex flex-col gap-1.5">
              <span className="w-6 h-0.5 bg-[#C9A84C]" />
              <span className="w-6 h-0.5 bg-[#C9A84C]" />
              <span className="w-6 h-0.5 bg-[#C9A84C]" />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#141414]/95 backdrop-blur-md border-t border-[#2A2A25] max-h-[calc(100dvh-4rem)] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="container py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[#F5F5F0] hover:text-[#C9A84C] transition-colors text-sm py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href={`/${locale}/booking`} className="pt-2">
              <Button size="md" className="w-full">
                {t('bookNow')}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
