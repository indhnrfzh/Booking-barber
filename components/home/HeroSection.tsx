'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { SectionLabel } from '@/components/ui/SectionLabel'

export function HeroSection() {
  const t = useTranslations('hero')
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'id'

  return (
    <section className="relative w-full min-h-dvh flex items-center justify-center overflow-hidden py-20">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/Foto/hero-cover.jpg)',
        }}
      >
        {/* Dark Overlay Gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/60 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container text-center">
        <div className="space-y-8 max-w-3xl mx-auto">
          {/* Label */}
          <SectionLabel className="justify-center flex">
            {t('label')}
          </SectionLabel>

          {/* Main Heading */}
          <div className="space-y-6">
            <h1 className="font-cormorant text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-[#F5F5F0] leading-tight">
              {t('title')}
            </h1>
            <GoldDivider className="mx-auto" />
          </div>

          {/* Subtitle */}
          <p className="text-base md:text-xl text-[#A0A09A] font-light max-w-2xl mx-auto">
            {t('subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href={`/${locale}/booking`}>
              <Button size="lg" className="w-full sm:w-auto">
                {t('cta1')}
              </Button>
            </Link>
            <Link href={`/${locale}/layanan`}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                {t('cta2')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <svg className="w-6 h-6 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
