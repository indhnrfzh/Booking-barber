import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

async function verifyAdminToken(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  if (!token) throw new Error('No token')
  const verified = await jwtVerify(token, JWT_SECRET)
  if (verified.payload.role !== 'admin') throw new Error('Not admin')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    await verifyAdminToken(request)
    const { key } = await params
    const body = await request.json() as { valueId?: string; valueEn?: string }

    const { valueId, valueEn } = body
    if (!valueId || !valueEn) {
      return NextResponse.json({ error: 'valueId and valueEn are required' }, { status: 400 })
    }

    const existing = await prisma.siteSettings.findUnique({ where: { key } })
    if (!existing) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }

    const updated = await prisma.siteSettings.update({
      where: { key },
      data: { valueId, valueEn },
    })

    return NextResponse.json({ setting: updated }, { status: 200 })
  } catch (error) {
    if (error instanceof Error && (error.message === 'No token' || error.message === 'Not admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating setting:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}
