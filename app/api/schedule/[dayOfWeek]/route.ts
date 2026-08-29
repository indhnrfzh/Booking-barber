import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AdminAuthError, assertAdminToken } from '@/lib/auth'

async function verifyAdminToken(request: NextRequest) {
  await assertAdminToken(request.cookies.get('admin_token')?.value)
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
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    console.error('Error updating schedule:', error)
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    )
  }
}
