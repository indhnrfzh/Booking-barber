'use client'

import { useState } from 'react'
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
  imageUrl: string
}

export default function LayananPage() {
  const t = useTranslations('services')
  const tBooking = useTranslations('booking')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'id'

  const categories = [
    { id: 'all', label: t('label') === 'LAYANAN KAMI' ? 'Semua' : 'All' },
    { id: 'cutting', label: locale === 'id' ? 'Potong Rambut' : 'Haircut' },
    { id: 'grooming', label: locale === 'id' ? 'Grooming' : 'Grooming' },
    { id: 'treatment', label: locale === 'id' ? 'Perawatan' : 'Treatment' },
  ]

  // Dummy services untuk demo (akan diganti dengan data dari DB di server component)
  const services: Service[] = [
    {
      id: '1',
      nameId: 'Potong Rambut Premium',
      nameEn: 'Premium Haircut',
      descId: 'Potong rambut dengan teknik modern dan konsultasi gaya pribadi',
      descEn: 'Modern haircut with personal style consultation',
      price: 100000,
      duration: 45,
      imageUrl: '/Foto/bshop-1.jpg',
    },
    {
      id: '2',
      nameId: 'Pencukuran Kumis & Jenggot',
      nameEn: 'Beard & Mustache Trim',
      descId: 'Pencukuran presisi untuk kumis, jenggot, dan styling',
      descEn: 'Precision trimming for beard and mustache styling',
      price: 75000,
      duration: 30,
      imageUrl: '/Foto/bshop-2.jpg',
    },
    {
      id: '3',
      nameId: 'Paket Lengkap (Potong + Cukur)',
      nameEn: 'Full Grooming Package',
      descId: 'Paket lengkap potong rambut + pencukuran kumis & jenggot + steam',
      descEn: 'Complete package with haircut, beard trim, and steam',
      price: 150000,
      duration: 75,
      imageUrl: '/Foto/bshop-3.jpg',
    },
  ]

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
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-11 px-6 py-2 rounded-full transition-all touch-manipulation ${
                  selectedCategory === cat.id
                    ? 'bg-[#C9A84C] text-black font-semibold'
                    : 'border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-[#141414] border border-[#2A2A25] rounded-lg overflow-hidden group hover:border-[#C9A84C] transition-all"
              >
                {/* Image */}
                <div className="relative h-52 sm:h-64 overflow-hidden bg-[#1C1C1C]">
                  <Image
                    src={service.imageUrl}
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
        </div>
      </section>
    </>
  )
}
