'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface StatSetting {
  value: string
  label: string
}

interface AboutSectionProps {
  stats?: StatSetting[]
}

export function AboutSection({ stats: statsProp }: AboutSectionProps) {
  const t = useTranslations('about')
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'id'

  const stats = statsProp ?? [
    { label: t('stat1'), value: '500+' },
    { label: t('stat2'), value: '10+' },
    { label: t('stat3'), value: '5★' },
  ]

  return (
    <section className="section-py bg-[#0A0A0A]">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Image */}
          <div className="relative h-80 sm:h-96 lg:h-125 rounded-lg overflow-hidden">
            <Image
              src="/Foto/barber-about.jpg"
              alt="Barbershop"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {/* Decorative Border */}
            <div className="absolute inset-0 border-2 border-[#C9A84C] rounded-lg transform translate-x-4 translate-y-4 -z-10" />
          </div>

          {/* Right: Content */}
          <div className="space-y-8">
            <div>
              <SectionLabel>{t('label')}</SectionLabel>
              <h2 className="font-cormorant text-3xl sm:text-4xl md:text-5xl font-bold text-[#F5F5F0] mb-4">
                {t('title')}
              </h2>
              <GoldDivider />
            </div>

            {/* Description */}
            <div className="space-y-4 text-[#A0A09A]">
              <p className="text-lg leading-relaxed">{t('description1')}</p>
              <p className="text-lg leading-relaxed">{t('description2')}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-8 border-y border-[#2A2A25]">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-[#C9A84C]">
                    {stat.value}
                  </div>
                  <p className="text-xs md:text-sm text-[#5A5A55] uppercase tracking-wider mt-2">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link href={`/${locale}/layanan`}>
              <Button variant="ghost" className="group">
                {t('cta')} <span className="group-hover:translate-x-1 transition-transform inline-block ml-2">→</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
