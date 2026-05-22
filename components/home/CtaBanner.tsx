'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function CtaBanner() {
  const t = useTranslations('cta')
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'id'

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-r from-[#8B6E2A] via-[#C9A84C] to-[#8B6E2A] opacity-5" />

      {/* Pattern SVG Overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
          <pattern id="scissors" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <text x="50" y="50" fontSize="60" fill="white" textAnchor="middle" dominantBaseline="middle">
              ✂
            </text>
          </pattern>
          <rect width="1000" height="200" fill="url(#scissors)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 container text-center max-w-2xl mx-auto">
        <h2 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-bold text-[#F5F5F0] mb-6">
          {t('title')}
        </h2>

        <p className="text-lg md:text-xl text-[#A0A09A] mb-10">
          {t('subtitle')}
        </p>

        <Link href={`/${locale}/booking`}>
          <Button size="lg" className="bg-[#C9A84C] text-black hover:bg-[#E8C96A]">
            {t('button')}
          </Button>
        </Link>
      </div>
    </section>
  )
}
