import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateBookingCode } from '@/lib/utils'
import { getAvailableSlotsForDate } from '@/lib/booking'
import { sendBookingConfirmation } from '@/lib/email'
import { resolveMemberForBooking } from '@/lib/member-server'

async function generateUniqueBookingCode(): Promise<string> {
  for (let i = 0; i < 8; i += 1) {
    const code = generateBookingCode()
    const existing = await prisma.booking.findUnique({
      where: { bookingCode: code },
      select: { id: true },
    })

    if (!existing) return code
  }

  throw new Error('Failed to generate unique booking code')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      serviceId,
      bookingDate,
      timeSlot,
      customerName,
      customerPhone,
      customerEmail,
      notes,
      joinMember,
      waOptIn,
      memberCode,
      voucherCode,
    } = body

    // Validation
    if (!serviceId || !bookingDate || !timeSlot || !customerName || !customerPhone || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)) {
      return NextResponse.json(
        { error: 'Invalid bookingDate format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    if (!/^\d{2}:\d{2}$/.test(timeSlot)) {
      return NextResponse.json(
        { error: 'Invalid timeSlot format. Use HH:mm' },
        { status: 400 }
      )
    }

    if (!/^\S+@\S+\.\S+$/.test(customerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const availability = await getAvailableSlotsForDate({
      date: bookingDate,
      serviceId,
    })

    if (!availability.service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    if (availability.reason === 'closed') {
      return NextResponse.json(
        { error: 'Shop is closed on selected day' },
        { status: 409 }
      )
    }

    if (!availability.slots.includes(timeSlot)) {
      return NextResponse.json(
        { error: 'Selected time slot is no longer available' },
        { status: 409 }
      )
    }

    // Resolve member if memberCode or joinMember provided
    const memberResult = await resolveMemberForBooking({
      memberCode,
      joinMember: Boolean(joinMember),
      waOptIn: Boolean(waOptIn),
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
    })

    if (memberResult.error) {
      return NextResponse.json(
        { error: memberResult.error },
        { status: 404 }
      )
    }

    const member = memberResult.member

    // Validate voucher if voucherCode is provided
    let attachedVoucher: {
      id: string
      code: string
      discountType: 'PERCENT' | 'FIXED'
      discountValue: number
    } | null = null
    let discountAmount = 0
    let discountText = ''

    if (voucherCode && typeof voucherCode === 'string' && voucherCode.trim()) {
      if (!member) {
        return NextResponse.json(
          { error: 'Voucher can only be used by members' },
          { status: 400 }
        )
      }

      const cleanVoucherCode = voucherCode.toUpperCase().trim()
      const foundVoucher = await prisma.voucher.findUnique({
        where: { code: cleanVoucherCode },
      })

      if (
        !foundVoucher ||
        foundVoucher.memberId !== member.id ||
        foundVoucher.status !== 'ACTIVE' ||
        foundVoucher.expiresAt < new Date()
      ) {
        return NextResponse.json(
          { error: 'Voucher is invalid or has expired' },
          { status: 400 }
        )
      }

      // Check if voucher is already assigned to an active booking
      const existingBookingWithVoucher = await prisma.booking.findUnique({
        where: { voucherId: foundVoucher.id },
        select: { id: true, status: true },
      })

      if (
        existingBookingWithVoucher &&
        existingBookingWithVoucher.status !== 'CANCELLED'
      ) {
        return NextResponse.json(
          { error: 'Voucher is already used on another booking' },
          { status: 409 }
        )
      }

      attachedVoucher = {
        id: foundVoucher.id,
        code: foundVoucher.code,
        discountType: foundVoucher.discountType,
        discountValue: foundVoucher.discountValue,
      }

      if (foundVoucher.discountType === 'PERCENT') {
        discountAmount = Math.round((availability.service.price * foundVoucher.discountValue) / 100)
        discountText = `${foundVoucher.discountValue}%`
      } else {
        discountAmount = Math.min(availability.service.price, foundVoucher.discountValue)
        discountText = `Rp ${foundVoucher.discountValue.toLocaleString('id-ID')}`
      }
    }

    const bookingCode = await generateUniqueBookingCode()

    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        customerName,
        customerPhone,
        customerEmail,
        serviceId,
        memberId: member ? member.id : null,
        voucherId: attachedVoucher ? attachedVoucher.id : null,
        bookingDate: availability.dateRange.start,
        timeSlot,
        status: 'PENDING',
        notes: notes || null,
      },
      include: {
        service: true,
        member: {
          select: {
            memberCode: true,
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
    })

    const finalPrice = Math.max(0, booking.service.price - discountAmount)

    let emailSent = false
    if (process.env.RESEND_API_KEY) {
      const emailResult = await sendBookingConfirmation({
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        serviceName: booking.service.nameId,
        bookingDate,
        timeSlot: booking.timeSlot,
        bookingCode: booking.bookingCode,
        price: booking.service.price,
        memberCode: member?.memberCode,
        discountText: discountText || undefined,
        finalPrice,
      })
      emailSent = Boolean(emailResult.success)
    }

    return NextResponse.json(
      {
        success: true,
        emailSent,
        bookingCode: booking.bookingCode,
        memberCode: member?.memberCode || null,
        discount: attachedVoucher
          ? {
              code: attachedVoucher.code,
              type: attachedVoucher.discountType,
              value: attachedVoucher.discountValue,
              amount: discountAmount,
              finalPrice,
            }
          : null,
        booking: {
          id: booking.id,
          bookingCode: booking.bookingCode,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          bookingDate: booking.bookingDate,
          timeSlot: booking.timeSlot,
          serviceName: booking.service.nameEn,
          memberCode: member?.memberCode || null,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Booking code required' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { bookingCode: code },
      include: {
        service: true,
        member: {
          select: {
            memberCode: true,
            name: true,
          },
        },
        voucher: {
          select: {
            code: true,
            nameId: true,
            nameEn: true,
            discountType: true,
            discountValue: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ booking }, { status: 200 })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}
