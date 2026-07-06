'use client'

import { ReactNode, use } from 'react'
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

// Import messages
import idMessages from '@/messages/id.json'
import enMessages from '@/messages/en.json'

const messages: Record<string, AbstractIntlMessages> = {
  id: idMessages,
  en: enMessages,
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)

  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale as 'id' | 'en']} timeZone="Asia/Jakarta">
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  )
}
