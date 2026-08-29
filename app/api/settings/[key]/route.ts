import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AdminAuthError, assertAdminToken } from '@/lib/auth'

async function verifyAdminToken(request: NextRequest) {
  await assertAdminToken(request.cookies.get('admin_token')?.value)
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

    const updated = await prisma.siteSettings.upsert({
      where: { key },
      create: { key, valueId, valueEn },
      update: { valueId, valueEn },
    })

    return NextResponse.json({ setting: updated }, { status: 200 })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating setting:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}
