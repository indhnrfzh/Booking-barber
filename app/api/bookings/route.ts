import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateBookingCode } from '@/lib/utils'
import { getAvailableSlotsForDate } from '@/lib/booking'
import { sendBookingConfirmation } from '@/lib/email'

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
    const { serviceId, bookingDate, timeSlot, customerName, customerPhone, customerEmail, notes } =
      body

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

    const bookingCode = await generateUniqueBookingCode()

    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        customerName,
        customerPhone,
        customerEmail,
        serviceId,
        bookingDate: availability.dateRange.start,
        timeSlot,
        status: 'PENDING',
        notes: notes || null,
      },
      include: {
        service: true,
      },
    })

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
      })
      emailSent = Boolean(emailResult.success)
    }

    return NextResponse.json(
      {
        success: true,
        emailSent,
        bookingCode: booking.bookingCode,
        booking: {
          id: booking.id,
          bookingCode: booking.bookingCode,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          bookingDate: booking.bookingDate,
          timeSlot: booking.timeSlot,
          serviceName: booking.service.nameEn,
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
