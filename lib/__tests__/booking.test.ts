import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getAvailableSlotsForDate,
  getJakartaDateRange,
  minutesToTime,
  timeToMinutes,
} from '@/lib/booking'

const mockPrisma = vi.hoisted(() => ({
  service: {
    findFirst: vi.fn(),
  },
  schedule: {
    findUnique: vi.fn(),
  },
  booking: {
    findMany: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

describe('booking utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('converts between HH:mm and minutes', () => {
    expect(timeToMinutes('09:30')).toBe(570)
    expect(minutesToTime(570)).toBe('09:30')
  })

  it('creates Jakarta date range and day of week deterministically', () => {
    const range = getJakartaDateRange('2026-06-01')

    expect(range.start.toISOString()).toBe('2026-05-31T17:00:00.000Z')
    expect(range.end.toISOString()).toBe('2026-06-01T16:59:59.999Z')
    expect(range.dayOfWeek).toBe(1)
  })

  it('returns service_not_found when service is missing', async () => {
    mockPrisma.service.findFirst.mockResolvedValue(null)

    const result = await getAvailableSlotsForDate({
      date: '2026-06-01',
      serviceId: 'missing-service',
    })

    expect(result.reason).toBe('service_not_found')
    expect(result.slots).toEqual([])
    expect(mockPrisma.schedule.findUnique).not.toHaveBeenCalled()
  })

  it('returns closed when schedule is closed', async () => {
    mockPrisma.service.findFirst.mockResolvedValue({
      id: 'svc-1',
      duration: 60,
      isActive: true,
    })
    mockPrisma.schedule.findUnique.mockResolvedValue({
      openTime: '09:00',
      closeTime: '21:00',
      isOpen: false,
    })

    const result = await getAvailableSlotsForDate({
      date: '2026-06-01',
      serviceId: 'svc-1',
    })

    expect(result.reason).toBe('closed')
    expect(result.slots).toEqual([])
  })

  it('excludes overlapping slots from existing bookings', async () => {
    mockPrisma.service.findFirst.mockResolvedValue({
      id: 'svc-1',
      duration: 60,
      isActive: true,
    })
    mockPrisma.schedule.findUnique.mockResolvedValue({
      openTime: '09:00',
      closeTime: '12:00',
      isOpen: true,
    })
    mockPrisma.booking.findMany.mockResolvedValue([
      {
        timeSlot: '10:00',
        service: {
          duration: 60,
        },
      },
    ])

    const result = await getAvailableSlotsForDate({
      date: '2026-06-01',
      serviceId: 'svc-1',
    })

    expect(result.reason).toBe('ok')
    expect(result.slots).toEqual(['09:00', '11:00'])
  })
})
