import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'

export async function getAdminUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value

  if (!token) {
    redirect('/admin/login')
  }

  const payload = await verifyToken(token)

  if (!payload || payload.role !== 'admin') {
    redirect('/admin/login')
  }

  return {
    id: payload.sub as string,
    username: payload.username as string,
    role: payload.role as string,
  }
}