import { prisma } from '@/lib/prisma'
import { MembersTable } from '@/components/admin/MembersTable'
import { AdminNavbar } from '@/components/admin/Navbar'
import { getAdminUser } from '@/lib/admin-auth'

export default async function AdminMembersPage() {
  const admin = await getAdminUser()

  const membersRaw = await prisma.member.findMany({
    include: {
      pointLedgers: {
        select: {
          delta: true,
        },
      },
      bookings: {
        orderBy: {
          bookingDate: 'desc',
        },
        take: 1,
        select: {
          bookingDate: true,
          status: true,
        },
      },
      _count: {
        select: {
          bookings: true,
          vouchers: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  })

  const members = membersRaw.map((m) => {
    const balance = m.pointLedgers.reduce((sum, entry) => sum + entry.delta, 0)
    return {
      id: m.id,
      memberCode: m.memberCode,
      name: m.name,
      phone: m.phone,
      email: m.email,
      waOptIn: m.waOptIn,
      lastReminderAt: m.lastReminderAt ? m.lastReminderAt.toISOString() : null,
      points: balance,
      totalBookings: m._count.bookings,
      totalVouchers: m._count.vouchers,
      lastBooking: m.bookings[0]
        ? {
            bookingDate: m.bookings[0].bookingDate.toISOString(),
            status: m.bookings[0].status,
          }
        : null,
      createdAt: m.createdAt.toISOString(),
    }
  })

  return (
    <>
      <AdminNavbar admin={admin} />
      <main className="pt-20 sm:pt-24 px-3 sm:px-4 md:px-8 container mx-auto space-y-6 sm:space-y-8 pb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F0]">VIP Members</h1>
          <p className="text-sm sm:text-base text-[#808078] mt-1">
            View customer member cards, points balances, and visit history
          </p>
        </div>

        <div className="bg-[#1C1C1C] border border-[#2A2A25] rounded-lg p-4 sm:p-6">
          <MembersTable initialMembers={members} />
        </div>
      </main>
    </>
  )
}
