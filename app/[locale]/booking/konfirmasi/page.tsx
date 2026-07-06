'use client'

import { useTranslations } from 'next-intl'
import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useEffect, useState } from 'react'

interface BookingDetail {
  bookingCode: string
  customerName: string
  customerEmail: string
  bookingDate: string
  timeSlot: string
  service: {
    nameId: string
    nameEn: string
    duration: number
    price: number
  }
}

export default function KonfirmasiPage() {
  const t = useTranslations('booking')
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = pathname.split('/')[1] || 'id'
  const bookingCode = searchParams.get('code')
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingCode) {
        setIsError(true)
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/bookings?code=${bookingCode}`)
        if (!response.ok) {
          setIsError(true)
          return
        }

        const data = await response.json()
        setBooking(data.booking)
      } catch {
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooking()
  }, [bookingCode])

  const formattedDate = booking
    ? new Date(booking.bookingDate).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  const serviceName = booking
    ? locale === 'id'
      ? booking.service.nameId
      : booking.service.nameEn
    : ''

  const formattedPrice = booking
    ? new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(booking.service.price)
    : ''

  return (
    <section className="py-20 md:py-32 min-h-screen flex items-center">
      <div className="container max-w-2xl">
        <div className="text-center space-y-8">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]">
            <svg className="w-12 h-12 text-[#C9A84C]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Heading */}
          <div>
            <h1 className="font-cormorant text-4xl md:text-5xl font-bold text-[#F5F5F0] mb-2">
              {t('confirmSuccess')}
            </h1>
            <p className="text-[#A0A09A] text-lg">
              {t('confirmMessage')}
            </p>
          </div>

          {/* Booking Code */}
          {bookingCode && (
            <div className="bg-[#141414] border border-[#C9A84C] rounded-lg p-8 space-y-2">
              <p className="text-[#A0A09A] text-sm uppercase tracking-wider">
                {t('bookingCode')}
              </p>
              <p className="font-cormorant text-4xl font-bold text-[#C9A84C] tracking-wider">
                {bookingCode}
              </p>
              <p className="text-sm text-[#5A5A55]">
                {t('bookingCodeHelper')}
              </p>
            </div>
          )}

          {isLoading && (
            <div className="bg-[#1C1C1C] border border-[#2A2A25] rounded-lg p-6 text-[#A0A09A]">
              {t('loadingBooking')}
            </div>
          )}

          {!isLoading && isError && (
            <div className="bg-[#1C1C1C] border border-[#E55353] rounded-lg p-6 text-[#F5F5F0]">
              {t('bookingNotFound')}
            </div>
          )}

          {!isLoading && booking && (
            <div className="bg-[#141414] border border-[#2A2A25] rounded-lg p-6 text-left space-y-4">
              <h2 className="text-[#F5F5F0] font-semibold text-lg">{t('bookingDetails')}</h2>
              <div className="space-y-2 text-sm">
                <p className="text-[#A0A09A]">
                  {t('service')}: <span className="text-[#F5F5F0]">{serviceName}</span>
                </p>
                <p className="text-[#A0A09A]">
                  {t('dateTime')}: <span className="text-[#F5F5F0]">{formattedDate} · {booking.timeSlot}</span>
                </p>
                <p className="text-[#A0A09A]">
                  {t('duration')}: <span className="text-[#F5F5F0]">{booking.service.duration} min</span>
                </p>
                <p className="text-[#A0A09A]">
                  {t('price')}: <span className="text-[#C9A84C] font-semibold">{formattedPrice}</span>
                </p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-[#1C1C1C] border border-[#2A2A25] rounded-lg p-6 text-left space-y-3">
            <div>
              <p className="text-[#A0A09A] text-sm">{t('confirmationSent')}</p>
              <p className="text-[#F5F5F0] font-semibold">{booking?.customerEmail ?? 'your-email@example.com'}</p>
            </div>

            <div className="border-t border-[#2A2A25] pt-4">
              <p className="text-[#F5F5F0] text-sm leading-relaxed whitespace-pre-line">
                {`📧 ${t('emailDetails')}\n📱 ${t('contactUs')}\n⏰ ${t('arriveEarly')}`}
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href={`/${locale}`}>
              <Button variant="outline">
                {t('backHome')}
              </Button>
            </Link>
            <Link href={`/${locale}/booking`}>
              <Button>
                {t('bookAgain')}
              </Button>
            </Link>
          </div>

          {/* Support */}
          <div className="text-center text-[#5A5A55] text-sm space-y-2 pt-8 border-t border-[#2A2A25]">
            <p>{t('questions')}</p>
            <div className="flex justify-center gap-4">
              <a href="tel:+6285812345678" className="text-[#C9A84C] hover:text-[#E8C96A]">
                {t('phoneNumber')}
              </a>
              <span>•</span>
              <a href="mailto:info@prestigebarbershop.id" className="text-[#C9A84C] hover:text-[#E8C96A]">
                {t('emailAddress')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
