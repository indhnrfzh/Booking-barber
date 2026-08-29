import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { renderReminderTemplate, DEFAULT_REMINDER_DAYS } from '@/lib/member'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

/**
 * Cron trigger endpoint to automatically send reminder messages to all due members.
 * Secured by CRON_SECRET authorization header (or callable by admin session).
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch reminder settings
    const [intervalSetting, templateSetting] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { key: 'reminder_interval_days' } }),
      prisma.siteSettings.findUnique({ where: { key: 'reminder_template' } }),
    ])

    const intervalDays = intervalSetting?.valueId
      ? parseInt(intervalSetting.valueId, 10) || DEFAULT_REMINDER_DAYS
      : DEFAULT_REMINDER_DAYS

    const template =
      templateSetting?.valueId ||
      'Halo {name}! 💈 Sudah waktunya rapikan rambutmu kembali di Prestige Barbershop. Kamu punya {points} poin untuk ditukar diskon. Booking jadwalmu di sini: {link}'

    const now = new Date()

    const members = await prisma.member.findMany({
      where: {
        waOptIn: true,
        bookings: {
          some: {
            status: 'COMPLETED',
          },
        },
      },
      include: {
        pointLedgers: {
          select: { delta: true },
        },
        bookings: {
          where: { status: 'COMPLETED' },
          orderBy: { bookingDate: 'desc' },
          take: 1,
          select: { bookingDate: true },
        },
      },
    })

    const dispatchResults = []

    for (const m of members) {
      const lastBooking = m.bookings[0]
      if (!lastBooking) continue

      const lastVisit = new Date(lastBooking.bookingDate)
      const diffDays = Math.floor(
        Math.abs(now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays >= intervalDays) {
        if (m.lastReminderAt) {
          const daysSinceReminded = Math.floor(
            Math.abs(now.getTime() - new Date(m.lastReminderAt).getTime()) / (1000 * 60 * 60 * 24)
          )
          if (daysSinceReminded < intervalDays) {
            continue
          }
        }

        const points = m.pointLedgers.reduce((sum, entry) => sum + entry.delta, 0)
        const text = renderReminderTemplate(template, {
          name: m.name,
          points,
          link: 'https://prestigebarbershop.id/id/booking',
          memberCode: m.memberCode,
        })

        const sendResult = await sendWhatsAppMessage(m.phone, text)

        if (sendResult.success) {
          await prisma.member.update({
            where: { id: m.id },
            data: { lastReminderAt: new Date() },
          })
          dispatchResults.push({ memberCode: m.memberCode, name: m.name, status: 'SENT' })
        } else {
          dispatchResults.push({
            memberCode: m.memberCode,
            name: m.name,
            status: 'FAILED',
            error: sendResult.error,
          })
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        processed: dispatchResults.length,
        details: dispatchResults,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in cron reminders:', error)
    return NextResponse.json({ error: 'Failed to process reminders' }, { status: 500 })
  }
}
