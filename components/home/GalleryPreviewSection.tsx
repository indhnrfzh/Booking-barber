'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { SectionLabel } from '@/components/ui/SectionLabel'

interface GalleryPreviewPhoto {
  id: string
  src: string
  alt: string | null
}

interface GalleryPreviewSectionProps {
  locale: string
  galleryPhotos: GalleryPreviewPhoto[]
}

export function GalleryPreviewSection({ locale, galleryPhotos }: GalleryPreviewSectionProps) {
  const t = useTranslations('gallery')

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
                alt={photo.alt || `Gallery ${idx + 1}`}
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
