import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

async function verifyAdminToken(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  if (!token) {
    throw new Error('No token')
  }
  const verified = await jwtVerify(token, JWT_SECRET)
  if (verified.payload.role !== 'admin') {
    throw new Error('Not admin')
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ dayOfWeek: string }> }
) {
  try {
    const params = await context.params
    
    await verifyAdminToken(request)

    const dayOfWeek = parseInt(params.dayOfWeek)
    if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { error: 'Invalid day of week (0-6)' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { openTime, closeTime, isOpen } = body

    if (!openTime || !closeTime) {
      return NextResponse.json(
        { error: 'Missing openTime or closeTime' },
        { status: 400 }
      )
    }

    const schedule = await prisma.schedule.update({
      where: { dayOfWeek },
      data: {
        openTime,
        closeTime,
        isOpen: isOpen ?? true,
      },
    })

    return NextResponse.json(schedule)
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    const message = error instanceof Error ? error.message : 'Failed to update schedule'

    return NextResponse.json(
      { error: message },
      { status: message === 'No token' ? 401 : 500 }
    )
  }
}
