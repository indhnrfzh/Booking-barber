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

        {/* Map */}
        <div className="mb-12">
          <h4 className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase font-semibold mb-6">
            {t('location')}
          </h4>
          <div className="relative w-full overflow-hidden rounded-lg border border-[#2A2A25]">
            <iframe
              title="Prestige Barbershop Location"
              src="https://www.google.com/maps?q=-6.1097144,120.4658672&z=16&output=embed"
              width="100%"
              height="320"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full grayscale-[0.3] contrast-[1.05]"
            />
          </div>
          <a
            href="https://maps.app.goo.gl/StKXtNpqR2f93w3q8"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-[#C9A84C] hover:text-[#E8C96A] transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
            </svg>
            {t('viewOnMaps')}
          </a>
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
              <a
                href="https://www.instagram.com/servis_rambut"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-[#C9A84C] hover:text-[#E8C96A] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.9 1.35a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="text-[#C9A84C] hover:text-[#E8C96A] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14.4 3h2.87c.27 1.6 1.53 2.87 3.13 3.14v2.9a6.08 6.08 0 0 1-3.1-1.12l-.02 6.5a5.42 5.42 0 1 1-5.42-5.42c.28 0 .55.02.82.06v2.83a2.6 2.6 0 1 0 1.72 2.44V3Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
