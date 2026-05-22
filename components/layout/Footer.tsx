'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Footer() {
  const t = useTranslations('footer')
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'id'

  return (
    <footer className="bg-[#141414] border-t border-[#2A2A25]">
      <div className="container py-16">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* About */}
          <div>
            <h3 className="font-cormorant text-2xl font-bold text-[#C9A84C] mb-4">PRESTIGE</h3>
            <p className="text-[#A0A09A] text-sm leading-relaxed">
              {t('about')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase font-semibold mb-6">
              {t('nav')}
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href={`/${locale}`} className="text-[#A0A09A] hover:text-[#C9A84C] transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/layanan`} className="text-[#A0A09A] hover:text-[#C9A84C] transition-colors text-sm">
                  Services
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/galeri`} className="text-[#A0A09A] hover:text-[#C9A84C] transition-colors text-sm">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/booking`} className="text-[#A0A09A] hover:text-[#C9A84C] transition-colors text-sm">
                  Booking
                </Link>
              </li>
            </ul>
          </div>

          {/* Schedule */}
          <div>
            <h4 className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase font-semibold mb-6">
              {t('schedule')}
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-[#A0A09A]">
              <li>Senin - Jumat: 09:00 - 21:00</li>
              <li>Sabtu: 10:00 - 22:00</li>
              <li>Minggu: 11:00 - 20:00</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase font-semibold mb-6">
              {t('contact')}
            </h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <a href="tel:+6285812345678" className="text-[#A0A09A] hover:text-[#C9A84C] transition-colors">
                  {t('phone')}
                </a>
              </li>
              <li>
                <a href="mailto:info@prestigebarbershop.id" className="text-[#A0A09A] hover:text-[#C9A84C] transition-colors">
                  {t('email')}
                </a>
              </li>
              <li className="text-[#A0A09A]">{t('address')}</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#2A2A25] mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-[#5A5A55] text-xs">{t('copyright')}</p>
          
          {/* Social Links */}
          <div className="flex gap-6 mt-6 md:mt-0">
            <a href="#" className="text-[#C9A84C] hover:text-[#E8C96A] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
              </svg>
            </a>
            <a href="#" className="text-[#C9A84C] hover:text-[#E8C96A] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
