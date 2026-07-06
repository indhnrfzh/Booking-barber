import { prisma } from '@/lib/prisma'
import { AdminNavbar } from '@/components/admin/Navbar'
import { getAdminUser } from '@/lib/admin-auth'
import { SettingsManager } from '../../../components/admin/SettingsManager'

export default async function AdminSettingsPage() {
  const admin = await getAdminUser()

  const settingsRaw = await prisma.siteSettings.findMany()
  const settings: Record<string, { valueId: string; valueEn: string }> = {}
  for (const s of settingsRaw) {
    settings[s.key] = { valueId: s.valueId, valueEn: s.valueEn }
  }

  return (
    <>
      <AdminNavbar admin={admin} />
      <main className="pt-20 sm:pt-24 px-3 sm:px-4 md:px-8 container mx-auto space-y-6 sm:space-y-8 pb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F0]">Site Settings</h1>
          <p className="text-sm sm:text-base text-[#808078] mt-1">
            Manage contact info, footer text, and about section stats
          </p>
        </div>
        <SettingsManager initialSettings={settings} />
      </main>
    </>
  )
}
