'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

interface GalleryImage {
  id: string
  src: string
  category: string
  alt: string | null
}

export default function GaleriPage() {
  const t = useTranslations('gallery')
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/gallery')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch gallery images')
        }

        setGalleryImages(data.images)
      } catch (error) {
        console.error(error)
        setGalleryImages([])
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  const filteredImages = activeCategory === 'all' ? galleryImages : galleryImages.filter((img) => img.category === activeCategory)

  const categories = useMemo(() => {
    const dynamicCategories = Array.from(new Set(galleryImages.map((image) => image.category)))
    return [
      { id: 'all', label: 'Semua' },
      ...dynamicCategories.map((category) => ({
        id: category,
        label: category.charAt(0).toUpperCase() + category.slice(1),
      })),
    ]
  }, [galleryImages])

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

      {/* Gallery */}
      <section className="section-py">
        <div className="container">
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`min-h-11 px-6 py-2 rounded-full transition-all touch-manipulation ${
                  activeCategory === cat.id
                    ? 'bg-[#C9A84C] text-black font-semibold'
                    : 'border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Masonry Grid */}
          {loading ? (
            <div className="rounded-lg border border-[#2A2A25] bg-[#141414] p-6 text-center text-[#808078]">
              Loading gallery images...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredImages.map((image) => (
              <div
                key={image.id}
                className="relative group cursor-pointer h-64 sm:h-80 overflow-hidden rounded-lg"
                onClick={() => setSelectedImage(image.id)}
              >
                <Image
                  src={image.src}
                  alt={image.alt || `Gallery ${image.id}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <path fill="currentColor" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))]"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full max-w-4xl h-[72dvh] max-h-[72dvh] sm:h-[80dvh] sm:max-h-[80dvh] md:h-150 md:max-h-150" onClick={(e) => e.stopPropagation()}>
            <Image
              src={galleryImages.find((img) => img.id === selectedImage)?.src || ''}
              alt={galleryImages.find((img) => img.id === selectedImage)?.alt || 'Gallery full'}
              fill
              sizes="100vw"
              className="object-contain"
            />
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] w-12 h-12 bg-[#C9A84C] rounded-full flex items-center justify-center hover:bg-[#E8C96A] transition-colors touch-manipulation"
            >
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
