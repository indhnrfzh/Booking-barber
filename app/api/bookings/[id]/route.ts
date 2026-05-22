import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

const ALLOWED_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const

type BookingStatus = (typeof ALLOWED_STATUSES)[number]

function isBookingStatus(value: string): value is BookingStatus {
  return ALLOWED_STATUSES.includes(value as BookingStatus)
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await context.params
    const body = await request.json()
    const { status } = body

    if (!status || typeof status !== 'string' || !isBookingStatus(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        service: {
          select: {
            nameId: true,
            nameEn: true,
            price: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        booking,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating booking status:', error)
    return NextResponse.json(
      { error: 'Failed to update booking status' },
      { status: 500 }
    )
  }
}
