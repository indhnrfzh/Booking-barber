import { prisma } from '@/lib/prisma'
import { AdminNavbar } from '@/components/admin/Navbar'
import { getAdminUser } from '@/lib/admin-auth'
import { ReminderList, DueMember } from '@/components/admin/ReminderList'
import { DEFAULT_REMINDER_DAYS } from '@/lib/member'

export default async function AdminRemindersPage() {
  const admin = await getAdminUser()

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

  // Calculate cutoff date
  const now = new Date()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - intervalDays)

  // Query members with waOptIn = true who have completed bookings
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
        select: {
          delta: true,
        },
      },
      bookings: {
        where: {
          status: 'COMPLETED',
        },
        orderBy: {
          bookingDate: 'desc',
        },
        take: 1,
        select: {
          bookingDate: true,
        },
      },
    },
  })

  const dueMembers: DueMember[] = []

  for (const m of members) {
    const lastBooking = m.bookings[0]
    if (!lastBooking) continue

    const lastVisit = new Date(lastBooking.bookingDate)
    const diffTime = Math.abs(now.getTime() - lastVisit.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    // Due if last visit is older than intervalDays
    if (diffDays >= intervalDays) {
      // Check if already reminded recently within intervalDays
      if (m.lastReminderAt) {
        const lastRemindedTime = Math.abs(now.getTime() - new Date(m.lastReminderAt).getTime())
        const daysSinceLastReminder = Math.floor(lastRemindedTime / (1000 * 60 * 60 * 24))
        if (daysSinceLastReminder < intervalDays) {
          continue
        }
      }

      const balance = m.pointLedgers.reduce((sum, entry) => sum + entry.delta, 0)

      dueMembers.push({
        id: m.id,
        memberCode: m.memberCode,
        name: m.name,
        phone: m.phone,
        email: m.email,
        points: balance,
        lastBookingDate: lastBooking.bookingDate.toISOString(),
        daysSinceLastVisit: diffDays,
        lastReminderAt: m.lastReminderAt ? m.lastReminderAt.toISOString() : null,
      })
    }
  }

  // Sort by longest since last visit first
  dueMembers.sort((a, b) => b.daysSinceLastVisit - a.daysSinceLastVisit)

  return (
    <>
      <AdminNavbar admin={admin} />
      <main className="pt-20 sm:pt-24 px-3 sm:px-4 md:px-8 container mx-auto space-y-6 sm:space-y-8 pb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F0]">WhatsApp Reminders</h1>
          <p className="text-sm sm:text-base text-[#808078] mt-1">
            Send 1-click re-visit reminder messages to members due for their next haircut
          </p>
        </div>

        <div className="bg-[#1C1C1C] border border-[#2A2A25] rounded-lg p-4 sm:p-6">
          <ReminderList
            initialMembers={dueMembers}
            template={template}
            bookingLink="https://prestigebarbershop.id/id/booking"
            intervalDays={intervalDays}
          />
        </div>
      </main>
    </>
  )
}
