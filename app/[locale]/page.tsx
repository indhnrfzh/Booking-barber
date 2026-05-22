import { HeroSection } from '@/components/home/HeroSection'
import { AboutSection } from '@/components/home/AboutSection'
import { ServicesPreviewSection } from '@/components/home/ServicesPreviewSection'
import { GalleryPreviewSection } from '@/components/home/GalleryPreviewSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { ScheduleSection } from '@/components/home/ScheduleSection'
import { CtaBanner } from '@/components/home/CtaBanner'
import { prisma } from '@/lib/prisma'
import type { Service } from '@prisma/client'

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

  const [servicesRaw, schedule] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }),
    prisma.schedule.findMany({
      orderBy: { dayOfWeek: 'asc' },
    }),
  ])

  const services = servicesRaw.map((service: Service) => ({
    ...service,
    imageUrl:
      service.imageUrl ??
      'https://picsum.photos/seed/service-fallback/500/500',
  }))

  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesPreviewSection services={services} locale={locale} />
      <GalleryPreviewSection />
      <TestimonialsSection />
      <ScheduleSection schedule={schedule} locale={locale} />
      <CtaBanner />
    </>
  )
}
