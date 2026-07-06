import { prisma } from '@/lib/prisma'
import type { Booking } from '@prisma/client'
import { BookingsTable } from '@/components/admin/BookingsTable'
import { AdminNavbar } from '@/components/admin/Navbar'
import { getAdminUser } from '@/lib/admin-auth'

export default async function AdminDashboardPage() {
  const admin = await getAdminUser()

  // Fetch bookings with service data
  type BookingWithService = Booking & {
    service: { nameId: string; nameEn: string; price: number }
  }

  const bookings: BookingWithService[] = await prisma.booking.findMany({
    include: {
      service: {
        select: {
          nameId: true,
          nameEn: true,
          price: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  })

  // Calculate stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'PENDING').length,
    confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
    completed: bookings.filter((b) => b.status === 'COMPLETED').length,
    cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
    revenue: bookings
      .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
      .reduce((sum, b) => sum + (b.service?.price || 0), 0),
  }

  return (
    <>
      <AdminNavbar admin={admin} />
      <main className="pt-20 sm:pt-24 px-3 sm:px-4 md:px-8 container mx-auto space-y-6 sm:space-y-8 pb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F0]">Dashboard</h1>
          <p className="text-sm sm:text-base text-[#808078] mt-1">Manage bookings and view analytics</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatCard
            title="Total Bookings"
            value={stats.total}
            icon="📅"
            color="bg-[#C9A84C]"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon="⏳"
            color="bg-yellow-600"
          />
          <StatCard
            title="Confirmed"
            value={stats.confirmed}
            icon="✅"
            color="bg-green-600"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon="🎉"
            color="bg-blue-600"
          />
          <StatCard
            title="Revenue"
            value={`Rp ${(stats.revenue / 1000).toFixed(0)}K`}
            icon="💰"
            color="bg-purple-600"
          />
        </div>

        <div className="bg-[#1C1C1C] border border-[#2A2A25] rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F0] mb-4 sm:mb-6">Recent Bookings</h2>
          <BookingsTable bookings={bookings} />
        </div>
      </main>
    </>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  color: string
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className={`${color} rounded-lg p-4 sm:p-5 text-white`}>
      <div className="text-2xl sm:text-3xl mb-2">{icon}</div>
      <p className="text-xs sm:text-sm opacity-90">{title}</p>
      <p className="text-xl sm:text-2xl font-bold">{value}</p>
    </div>
  )
}
