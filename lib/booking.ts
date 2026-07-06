import { prisma } from '@/lib/prisma'

const JAKARTA_OFFSET = '+07:00'
const SLOT_INTERVAL_MINUTES = 30

type AvailabilityReason = 'service_not_found' | 'closed' | 'ok'

type AvailabilityResult = {
  service: { id: string; duration: number } | null
  schedule: { openTime: string; closeTime: string; isOpen: boolean } | null
  slots: string[]
  dateRange: {
    start: Date
    end: Date
    dayOfWeek: number
  }
  reason: AvailabilityReason
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export function getJakartaDateRange(date: string) {
  return {
    start: new Date(`${date}T00:00:00.000${JAKARTA_OFFSET}`),
    end: new Date(`${date}T23:59:59.999${JAKARTA_OFFSET}`),
    dayOfWeek: new Date(`${date}T12:00:00.000${JAKARTA_OFFSET}`).getDay(),
  }
}

export async function getAvailableSlotsForDate(params: {
  date: string
  serviceId: string
}): Promise<AvailabilityResult> {
  const { date, serviceId } = params
  const dateRange = getJakartaDateRange(date)

  const service = await prisma.service.findFirst({
    where: { id: serviceId, isActive: true },
  })

  if (!service) {
    return {
      service: null,
      schedule: null,
      slots: [],
      dateRange,
      reason: 'service_not_found',
    }
  }

  const schedule = await prisma.schedule.findUnique({
    where: { dayOfWeek: dateRange.dayOfWeek },
  })

  if (!schedule || !schedule.isOpen) {
    return {
      service,
      schedule,
      slots: [],
      dateRange,
      reason: 'closed',
    }
  }

  const bookings = await prisma.booking.findMany({
    where: {
      bookingDate: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
    select: {
      timeSlot: true,
      service: {
        select: {
          duration: true,
        },
      },
    },
  })

  const openMin = timeToMinutes(schedule.openTime)
  const closeMin = timeToMinutes(schedule.closeTime)
  const requestedDuration = service.duration

  const slots: string[] = []

  for (
    let currentMin = openMin;
    currentMin + requestedDuration <= closeMin;
    currentMin += SLOT_INTERVAL_MINUTES
  ) {
    const candidateStart = currentMin
    const candidateEnd = currentMin + requestedDuration

    const hasOverlap = bookings.some((booking: { timeSlot: string; service: { duration: number } }) => {
      const bookedStart = timeToMinutes(booking.timeSlot)
      const bookedEnd = bookedStart + booking.service.duration
      return candidateStart < bookedEnd && candidateEnd > bookedStart
    })

    if (!hasOverlap) {
      slots.push(minutesToTime(currentMin))
    }
  }

  return {
    service,
    schedule,
    slots,
    dateRange,
    reason: 'ok',
  }
}
