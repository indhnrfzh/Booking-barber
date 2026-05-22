'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { SectionLabel } from '@/components/ui/SectionLabel'

export function GalleryPreviewSection() {
  const t = useTranslations('gallery')
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'id'

  const galleryPhotos = [
    { id: 1, src: 'https://picsum.photos/seed/gallery-1/600/500', alt: 'Haircut 1' },
    { id: 2, src: 'https://picsum.photos/seed/gallery-2/600/500', alt: 'Haircut 2' },
    { id: 3, src: 'https://picsum.photos/seed/gallery-3/600/500', alt: 'Haircut 3' },
    { id: 4, src: 'https://picsum.photos/seed/gallery-4/600/500', alt: 'Haircut 4' },
    { id: 5, src: 'https://picsum.photos/seed/gallery-5/600/500', alt: 'Haircut 5' },
    { id: 6, src: 'https://picsum.photos/seed/gallery-6/600/500', alt: 'Haircut 6' },
  ]

  return (
    <section className="section-py bg-[#0A0A0A]">
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

        {/* Gallery Masonry */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {galleryPhotos.map((photo, idx) => (
            <div
              key={photo.id}
              className={`relative overflow-hidden rounded-lg group cursor-pointer ${
                idx === 0 || idx === 4 ? 'lg:col-span-2 lg:row-span-2' : ''
              }`}
              style={{ aspectRatio: '16 / 9' }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center">
          <Link href={`/${locale}/galeri`}>
            <Button variant="outline">{t('viewAll')}</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
