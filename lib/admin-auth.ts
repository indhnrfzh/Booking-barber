import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function getAdminUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value

  if (!token) {
    redirect('/admin/login')
  }

  try {
    const verified = await jwtVerify(token, JWT_SECRET)

    return {
      id: verified.payload.sub as string,
      username: verified.payload.username as string,
      role: verified.payload.role as string,
    }
  } catch {
    redirect('/admin/login')
  }
}