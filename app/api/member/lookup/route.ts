import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMemberBalance, verifyMemberAccess } from '@/lib/member-server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const phone = searchParams.get('phone')

    if (!code || !phone) {
      return NextResponse.json(
        { error: 'Member code and phone number are required' },
        { status: 400 }
      )
    }

    const member = await verifyMemberAccess(code, phone)
    if (!member) {
      return NextResponse.json(
        { error: 'Member not found or phone number does not match' },
        { status: 404 }
      )
    }

    // Lazy update expired vouchers
    await prisma.voucher.updateMany({
      where: {
        memberId: member.id,
        status: 'ACTIVE',
        expiresAt: { lt: new Date() },
      },
      data: {
        status: 'EXPIRED',
      },
    })

    const [points, bookings, vouchers] = await Promise.all([
      getMemberBalance(member.id),
      prisma.booking.findMany({
        where: { memberId: member.id },
        include: {
          service: {
            select: {
              nameId: true,
              nameEn: true,
              price: true,
            },
          },
          voucher: {
            select: {
              code: true,
              discountType: true,
              discountValue: true,
            },
          },
        },
        orderBy: {
          bookingDate: 'desc',
        },
        take: 30,
      }),
      prisma.voucher.findMany({
        where: { memberId: member.id },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ])

    return NextResponse.json(
      {
        member: {
          id: member.id,
          memberCode: member.memberCode,
          name: member.name,
          phone: member.phone,
          email: member.email,
          waOptIn: member.waOptIn,
        },
        points,
        bookings,
        vouchers,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error looking up member:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve member data' },
      { status: 500 }
    )
  }
}
