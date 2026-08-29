import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AdminAuthError, assertAdminToken } from '@/lib/auth'
import { calculatePoints } from '@/lib/member'

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
    await assertAdminToken(request.cookies.get('admin_token')?.value)

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
      include: {
        service: true,
        voucher: true,
      },
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Status transition actions
    if (status === 'COMPLETED') {
      // 1. Award points if memberId exists (Idempotent: unique bookingId in PointLedger)
      if (existingBooking.memberId) {
        const points = calculatePoints(existingBooking.service.price)
        if (points > 0) {
          try {
            await prisma.pointLedger.create({
              data: {
                memberId: existingBooking.memberId,
                bookingId: existingBooking.id,
                delta: points,
                note: `Poin dari booking ${existingBooking.bookingCode}`,
              },
            })
          } catch (err: unknown) {
            // If already exists (P2002 unique constraint on bookingId), ignore silently for idempotency
            if (!(err && typeof err === 'object' && 'code' in err && err.code === 'P2002')) {
              console.error('Error awarding points:', err)
            }
          }
        }
      }

      // 2. Mark attached voucher as USED
      if (existingBooking.voucherId && existingBooking.voucher?.status === 'ACTIVE') {
        await prisma.voucher.update({
          where: { id: existingBooking.voucherId },
          data: {
            status: 'USED',
            usedAt: new Date(),
          },
        })
      }
    } else if (status === 'CANCELLED') {
      // Release attached voucher so customer can use it again if booking is cancelled before completion
      if (existingBooking.voucherId && existingBooking.voucher?.status === 'ACTIVE') {
        await prisma.booking.update({
          where: { id },
          data: { voucherId: null },
        })
      }
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
        member: {
          select: {
            memberCode: true,
            name: true,
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
    if (error instanceof AdminAuthError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Error updating booking status:', error)
    return NextResponse.json(
      { error: 'Failed to update booking status' },
      { status: 500 }
    )
  }
}
