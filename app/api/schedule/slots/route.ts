import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlotsForDate } from '@/lib/booking'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const serviceId = searchParams.get('serviceId')

    if (!date || !serviceId) {
      return NextResponse.json(
        { error: 'date and serviceId required' },
        { status: 400 }
      )
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    const availability = await getAvailableSlotsForDate({ date, serviceId })

    if (!availability.service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    if (availability.reason === 'closed') {
      return NextResponse.json(
        { slots: [], message: 'Closed on this day' },
        { status: 200 }
      )
    }

    return NextResponse.json({ slots: availability.slots }, { status: 200 })
  } catch (error) {
    console.error('Error fetching available slots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    )
  }
}
