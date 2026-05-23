'use client'

import { useTranslations } from 'next-intl'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { useState, useEffect } from 'react'

interface TestimonialData {
  id: string
  textId: string
  textEn: string
  author: string
  rating: number
}

interface Testimonial {
  id: string
  text: string
  author: string
  rating: number
}

interface TestimonialsSectionProps {
  locale: string
  testimonials: TestimonialData[]
}

export function TestimonialsSection({ locale, testimonials: rawTestimonials }: TestimonialsSectionProps) {
  const t = useTranslations('testimonials')
  const [activeIndex, setActiveIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  const testimonials: Testimonial[] = rawTestimonials.map((item) => ({
    id: item.id,
    text: locale === 'id' ? item.textId : item.textEn,
    author: item.author,
    rating: item.rating,
  }))

  useEffect(() => {
    if (!autoPlay || testimonials.length === 0) return

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [autoPlay, testimonials.length])

  return (
    <section className="section-py bg-[#141414]">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <SectionLabel className="justify-center flex">{t('label')}</SectionLabel>
          <h2 className="font-cormorant text-3xl sm:text-4xl md:text-5xl font-bold text-[#F5F5F0] mb-4">
            {t('title')}
          </h2>
          <div className="flex justify-center mt-6">
            <GoldDivider />
          </div>
        </div>

        {/* Carousel */}
        <div
          className="mx-auto max-w-2xl"
          onMouseEnter={() => setAutoPlay(false)}
          onMouseLeave={() => setAutoPlay(true)}
        >
          <div className="relative bg-[#1C1C1C] border border-[#2A2A25] rounded-lg p-8 md:p-12 min-h-80">
            {/* Quote Mark */}
            <div className="absolute top-4 left-6 text-6xl text-[#C9A84C] opacity-20">&ldquo;</div>

            {/* Testimonial Content */}
            {testimonials.length === 0 ? (
              <div className="text-center text-[#808078] py-12">No testimonials available.</div>
            ) : (
              <div className="relative z-10 text-center">
                <p className="text-lg md:text-xl text-[#F5F5F0] mb-6 leading-relaxed italic">
                  {testimonials[activeIndex].text}
                </p>

                {/* Author & Rating */}
                <div className="space-y-3 pt-6 border-t border-[#2A2A25]">
                  <p className="font-semibold text-[#C9A84C]">
                    {testimonials[activeIndex].author}
                  </p>
                  <div className="flex justify-center gap-1">
                    {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-[#C9A84C]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveIndex(idx)
                    setAutoPlay(false)
                  }}
                  className={`min-h-8 min-w-8 inline-flex items-center justify-center rounded-full transition-all duration-300 ${
                    idx === activeIndex ? 'bg-[#C9A84C]/20' : 'bg-transparent'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                >
                  <span
                    className={`rounded-full transition-all duration-300 ${
                      idx === activeIndex ? 'bg-[#C9A84C] h-2 w-6' : 'bg-[#5A5A55] h-2.5 w-2.5'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
