'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'

interface Service {
  id: string
  nameId: string
  nameEn: string
  price: number
  duration: number
  imageUrl: string
  descId?: string
  descEn?: string
}

interface ServicesPreviewProps {
  services: Service[]
  locale: string
}

export function ServicesPreviewSection({ services, locale }: ServicesPreviewProps) {
  const t = useTranslations('services')
  const serviceName = locale === 'id' ? 'nameId' : 'nameEn'

  const topServices = services.slice(0, 3)

  return (
    <section className="section-py bg-[#141414]">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <SectionLabel className="justify-center flex">{t('label')}</SectionLabel>
          <h2 className="font-cormorant text-3xl sm:text-4xl md:text-5xl font-bold text-[#F5F5F0] mb-4">
            {t('title')}
          </h2>
          <p className="text-[#A0A09A] max-w-2xl mx-auto">{t('subtitle')}</p>
          <div className="flex justify-center mt-6">
            <GoldDivider />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {topServices.map((service) => (
            <div
              key={service.id}
              className="group bg-[#1C1C1C] border border-[#2A2A25] rounded-lg overflow-hidden hover:border-[#C9A84C] transition-all duration-300 hover:shadow-lg hover:shadow-[#C9A84C]/20 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-40 sm:h-48 overflow-hidden bg-linear-to-br from-[#C9A84C]/10 to-[#8B6E2A]/10">
                <Image
                  src={service.imageUrl}
                  alt={service[serviceName]}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Icon/Badge */}
                <div className="w-12 h-12 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#C9A84C]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                  </svg>
                </div>

                {/* Name & Duration */}
                <div>
                  <h3 className="text-lg font-semibold text-[#F5F5F0] mb-2">
                    {service[serviceName]}
                  </h3>
                  <Badge variant="info" className="text-xs">
                    {service.duration} {locale === 'id' ? 'menit' : 'min'}
                  </Badge>
                </div>

                {/* Description */}
                {service.descId && (
                  <p className="text-[#A0A09A] text-sm line-clamp-2">
                    {locale === 'id' ? service.descId : service.descEn}
                  </p>
                )}

                {/* Price */}
                <div className="pt-4 border-t border-[#2A2A25]">
                  <p className="text-2xl font-bold text-[#C9A84C]">
                    {formatPrice(service.price, locale)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center">
          <Link href={`/${locale}/layanan`}>
            <Button variant="outline">{t('viewAll')}</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
