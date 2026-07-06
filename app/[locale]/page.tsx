import { HeroSection } from '@/components/home/HeroSection'
import { AboutSection } from '@/components/home/AboutSection'
import { ServicesPreviewSection } from '@/components/home/ServicesPreviewSection'
import { GalleryPreviewSection } from '@/components/home/GalleryPreviewSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { ScheduleSection } from '@/components/home/ScheduleSection'
import { CtaBanner } from '@/components/home/CtaBanner'
import { prisma } from '@/lib/prisma'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const title = locale === 'id' 
    ? 'Prestige Barbershop - Potong Rambut Premium'
    : 'Prestige Barbershop - Premium Haircut'
  
  return {
    title,
    description: locale === 'id'
      ? 'Layanan barbershop premium di Jakarta. Potong rambut, styling, dan grooming untuk pria modern.'
      : 'Premium barbershop services in Jakarta. Haircuts, styling, and grooming for modern men.',
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const [servicesRaw, schedule, galleryPhotos, testimonialsRaw, settingsRaw] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }),
    prisma.schedule.findMany({
      orderBy: { dayOfWeek: 'asc' },
    }),
    prisma.galleryImage.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      take: 6,
      select: {
        id: true,
        src: true,
        alt: true,
      },
    }),
    prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        textId: true,
        textEn: true,
        author: true,
        rating: true,
      },
    }),
    prisma.siteSettings.findMany(),
  ])

  const services = servicesRaw.map((service: (typeof servicesRaw)[number]) => ({
    ...service,
    imageUrl:
      service.imageUrl ??
      '/Foto/bshop-1.jpg',
  }))

  // Build settings map and derive stats for AboutSection
  const settingsMap: Record<string, { valueId: string; valueEn: string }> = {}
  for (const s of settingsRaw) {
    settingsMap[s.key] = { valueId: s.valueId, valueEn: s.valueEn }
  }

  function pickSetting(key: string): string {
    const entry = settingsMap[key]
    if (!entry) return ''
    return locale === 'id' ? entry.valueId : entry.valueEn
  }

  const aboutStats = [
    { value: pickSetting('stat1_value') || '500+', label: pickSetting('stat1_label') || (locale === 'id' ? '500+ Klien' : '500+ Clients') },
    { value: pickSetting('stat2_value') || '10+', label: pickSetting('stat2_label') || (locale === 'id' ? '10+ Tahun' : '10+ Years') },
    { value: pickSetting('stat3_value') || '5★', label: pickSetting('stat3_label') || '5★ Rating' },
  ]

  return (
    <>
      <HeroSection />
      <AboutSection stats={aboutStats} />
      <ServicesPreviewSection services={services} locale={locale} />
      <GalleryPreviewSection locale={locale} galleryPhotos={galleryPhotos} />
      <TestimonialsSection locale={locale} testimonials={testimonialsRaw} />
      <ScheduleSection schedule={schedule} locale={locale} />
      <CtaBanner />
    </>
  )
}
