import { GalleryManager } from '@/components/admin/GalleryManager'
import { AdminNavbar } from '@/components/admin/Navbar'
import { getAdminUser } from '@/lib/admin-auth'

export default async function AdminGalleryPage() {
  const admin = await getAdminUser()

  return (
    <>
      <AdminNavbar admin={admin} />
      <main className="pt-20 sm:pt-24 px-3 sm:px-4 md:px-8 container mx-auto space-y-6 sm:space-y-8 pb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F0]">Gallery Management</h1>
          <p className="text-sm sm:text-base text-[#808078] mt-1">Manage your barbershop gallery images</p>
        </div>

        <div className="bg-[#1C1C1C] border border-[#2A2A25] rounded-lg p-4 sm:p-6">
          <GalleryManager />
        </div>
      </main>
    </>
  )
}
