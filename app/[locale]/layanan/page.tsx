'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'

interface Service {
  id: string
  nameId: string
  nameEn: string
  descId: string
  descEn: string
  price: number
  duration: number
  imageUrl: string | null
}

const FALLBACK_IMAGE = '/Foto/bshop-1.jpg'

export default function LayananPage() {
  const t = useTranslations('services')
  const tBooking = useTranslations('booking')
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'id'

  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services')
        if (response.ok) {
          const data = await response.json()
          setServices(data.services)
        }
      } catch (error) {
        console.error('Error fetching services:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [])

  const serviceName = locale === 'id' ? 'nameId' : 'nameEn'
  const serviceDesc = locale === 'id' ? 'descId' : 'descEn'

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-linear-to-b from-[#141414] to-[#0A0A0A]">
        <div className="container text-center">
          <h1 className="font-cormorant text-4xl sm:text-5xl md:text-6xl font-bold text-[#F5F5F0] mb-4">
            {t('title')}
          </h1>
          <p className="text-[#A0A09A] text-lg md:text-xl max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Services Grid*/}
      <section className="section-py">
        <div className="container">
          {/* Services Grid */}
          {isLoading ? (
            <div className="rounded-lg border border-[#2A2A25] bg-[#141414] p-6 text-center text-[#808078]">
              {locale === 'id' ? 'Memuat layanan...' : 'Loading services...'}
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-lg border border-[#2A2A25] bg-[#141414] p-6 text-center text-[#808078]">
              {locale === 'id' ? 'Belum ada layanan tersedia.' : 'No services available yet.'}
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-[#141414] border border-[#2A2A25] rounded-lg overflow-hidden group hover:border-[#C9A84C] transition-all"
              >
                {/* Image */}
                <div className="relative h-52 sm:h-64 overflow-hidden bg-[#1C1C1C]">
                  <Image
                    src={service.imageUrl || FALLBACK_IMAGE}
                    alt={service[serviceName]}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-[#F5F5F0]">
                    {service[serviceName]}
                  </h3>

                  <p className="text-[#A0A09A] text-sm leading-relaxed">
                    {service[serviceDesc]}
                  </p>

                  {/* Details */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#2A2A25]">
                    <div>
                      <p className="text-2xl font-bold text-[#C9A84C]">
                        {formatPrice(service.price, locale)}
                      </p>
                      <p className="text-xs text-[#5A5A55]">
                        {service.duration} {locale === 'id' ? 'menit' : 'min'}
                      </p>
                    </div>
                    <Link href={`/${locale}/booking`}>
                      <Button size="sm">{tBooking('confirm')}</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>
    </>
  )
}
