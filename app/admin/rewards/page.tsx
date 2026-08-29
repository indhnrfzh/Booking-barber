import { prisma } from '@/lib/prisma'
import { RewardsTable } from '@/components/admin/RewardsTable'
import { AdminNavbar } from '@/components/admin/Navbar'
import { getAdminUser } from '@/lib/admin-auth'

export default async function AdminRewardsPage() {
  const admin = await getAdminUser()

  const rewards = await prisma.reward.findMany({
    orderBy: { order: 'asc' },
  })

  return (
    <>
      <AdminNavbar admin={admin} />
      <main className="pt-20 sm:pt-24 px-3 sm:px-4 md:px-8 container mx-auto space-y-6 sm:space-y-8 pb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F0]">Loyalty Rewards</h1>
          <p className="text-sm sm:text-base text-[#808078] mt-1">
            Manage catalog rewards that members can redeem with their points
          </p>
        </div>

        <div className="bg-[#1C1C1C] border border-[#2A2A25] rounded-lg p-4 sm:p-6">
          <RewardsTable rewards={rewards} />
        </div>
      </main>
    </>
  )
}
