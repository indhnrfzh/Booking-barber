import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AdminAuthError, assertAdminToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await assertAdminToken(request.cookies.get('admin_token')?.value)

    const search = request.nextUrl.searchParams.get('q')?.trim() || ''

    const members = await prisma.member.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { memberCode: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
            ],
          }
        : undefined,
      include: {
        pointLedgers: {
          select: {
            delta: true,
          },
        },
        bookings: {
          orderBy: {
            bookingDate: 'desc',
          },
          take: 1,
          select: {
            bookingDate: true,
            status: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            vouchers: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    })

    const result = members.map((m) => {
      const balance = m.pointLedgers.reduce((sum, entry) => sum + entry.delta, 0)
      return {
        id: m.id,
        memberCode: m.memberCode,
        name: m.name,
        phone: m.phone,
        email: m.email,
        waOptIn: m.waOptIn,
        lastReminderAt: m.lastReminderAt,
        points: balance,
        totalBookings: m._count.bookings,
        totalVouchers: m._count.vouchers,
        lastBooking: m.bookings[0] || null,
        createdAt: m.createdAt,
      }
    })

    return NextResponse.json({ members: result }, { status: 200 })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching members:', error)
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
  }
}
