'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

type SettingsMap = Record<string, { valueId: string; valueEn: string }>

export function Footer() {
  const t = useTranslations('footer')
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'id'
  const [settings, setSettings] = useState<SettingsMap | null>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data: { settings: SettingsMap }) => setSettings(data.settings))
      .catch(() => setSettings(null))
  }, [])

  function getSetting(key: string, fallback: string): string {
    if (!settings) return fallback
    const entry = settings[key]
    if (!entry) return fallback
    return locale === 'id' ? entry.valueId : entry.valueEn
  }

  const phone = getSetting('phone', t('phone'))
  const email = getSetting('email', t('email'))
  const address = getSetting('address', t('address'))
  const footerAbout = getSetting('footer_about', t('about'))
  const copyright = getSetting('footer_copyright', t('copyright'))

  return (
    <footer className="bg-[#141414] border-t border-[#2A2A25]">
      <div className="container py-16">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* About */}
          <div>
            <h3 className="font-cormorant text-2xl font-bold text-[#C9A84C] mb-4">PRESTIGE</h3>
            <p className="text-[#A0A09A] text-sm leading-relaxed">
              {footerAbout}
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
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-[#A0A09A] hover:text-[#C9A84C] transition-colors">
                  {phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="text-[#A0A09A] hover:text-[#C9A84C] transition-colors">
                  {email}
                </a>
              </li>
              <li className="text-[#A0A09A]">{address}</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#2A2A25] mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-[#5A5A55] text-xs">{copyright}</p>
          
          <div className="flex items-center gap-4 mt-6 md:mt-0">
            {/* Admin Login */}
            <Link
              href="/admin/login"
              className="inline-flex items-center rounded-full border border-[#2A2A25] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9A84C] hover:border-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors"
            >
              Admin Login
            </Link>

            {/* Social Links */}
            <div className="flex gap-4">
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
      </div>
    </footer>
  )
}
