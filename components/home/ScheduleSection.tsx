'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Badge } from '@/components/ui/Badge'
import { getDayName } from '@/lib/utils'

interface Schedule {
  id: string
  dayOfWeek: number
  openTime: string
  closeTime: string
  isOpen: boolean
}

interface ScheduleSectionProps {
  schedule: Schedule[]
  locale: string
}

export function ScheduleSection({ schedule, locale }: ScheduleSectionProps) {
  const t = useTranslations('schedule')
  const pathname = usePathname()
  const currentLocale = pathname.split('/')[1] || 'id'

  // Sort schedule by day of week
  const sortedSchedule = [...schedule].sort((a, b) => a.dayOfWeek - b.dayOfWeek)

  return (
    <section className="section-py bg-[#0A0A0A]">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Info */}
          <div className="space-y-8">
            <div>
              <SectionLabel>{t('label')}</SectionLabel>
              <h2 className="font-cormorant text-4xl md:text-5xl font-bold text-[#F5F5F0] mb-4">
                {t('title')}
              </h2>
              <GoldDivider />
            </div>

            <p className="text-[#A0A09A] text-lg leading-relaxed">
              {locale === 'id' 
                ? 'Kunjungi kami pada jam-jam operasional kami untuk mendapatkan pengalaman barbershop terbaik.'
                : 'Visit us during our operating hours for the best barbershop experience.'}
            </p>

            <Link href={`/${currentLocale}/booking`}>
              <Button size="lg">{t('cta')}</Button>
            </Link>
          </div>

          {/* Right: Schedule Table */}
          <div className="space-y-3">
            {sortedSchedule.map((day) => (
              <div
                key={day.id}
                className="bg-[#141414] border border-[#2A2A25] rounded-lg p-4 flex items-center justify-between hover:border-[#C9A84C]/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-[#F5F5F0]">
                    {getDayName(day.dayOfWeek, locale)}
                  </p>
                  <p className="text-sm text-[#A0A09A]">
                    {day.isOpen
                      ? `${day.openTime} - ${day.closeTime}`
                      : locale === 'id'
                      ? 'Tutup'
                      : 'Closed'}
                  </p>
                </div>
                <Badge variant={day.isOpen ? 'success' : 'error'}>
                  {day.isOpen ? t('open') : t('closed')}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
