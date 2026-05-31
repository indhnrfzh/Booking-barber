import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'

import { GET, POST } from '@/app/api/bookings/route'
import { integrationPrisma } from '@/tests/integration/helpers/db'

function buildJsonRequest(url: string, method: 'POST' | 'GET', body?: unknown) {
  return new NextRequest(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('POST /api/bookings and GET /api/bookings', () => {
  let serviceId = ''

  beforeAll(async () => {
    const service = await integrationPrisma.service.findFirst({
      where: { isActive: true },
      select: { id: true },
      orderBy: { order: 'asc' },
    })

    if (!service) {
      throw new Error('Seed data is missing active service for integration test.')
    }

    serviceId = service.id
  })

  afterAll(async () => {
    await integrationPrisma.booking.deleteMany({
      where: { customerEmail: { in: ['integration.success@test.dev', 'integration.conflict@test.dev'] } },
    })
  })

  it('creates booking successfully and returns bookingCode', async () => {
    const response = await POST(
      buildJsonRequest('http://localhost/api/bookings', 'POST', {
        serviceId,
        bookingDate: '2026-06-08',
        timeSlot: '09:00',
        customerName: 'Integration Success',
        customerPhone: '081234567890',
        customerEmail: 'integration.success@test.dev',
        notes: 'integration test booking',
      })
    )

    expect(response.status).toBe(201)
    const payload = await response.json()

    expect(payload.success).toBe(true)
    expect(payload.bookingCode).toMatch(/^REF-[A-Z0-9]{6}$/)

    const created = await integrationPrisma.booking.findUnique({
      where: { bookingCode: payload.bookingCode },
      select: { customerEmail: true, timeSlot: true },
    })

    expect(created?.customerEmail).toBe('integration.success@test.dev')
    expect(created?.timeSlot).toBe('09:00')
  })

  it('rejects duplicate/conflicting booking slot with 409', async () => {
    const first = await POST(
      buildJsonRequest('http://localhost/api/bookings', 'POST', {
        serviceId,
        bookingDate: '2026-06-09',
        timeSlot: '10:00',
        customerName: 'Conflict A',
        customerPhone: '081111111111',
        customerEmail: 'integration.conflict@test.dev',
        notes: 'first booking',
      })
    )

    expect(first.status).toBe(201)

    const second = await POST(
      buildJsonRequest('http://localhost/api/bookings', 'POST', {
        serviceId,
        bookingDate: '2026-06-09',
        timeSlot: '10:00',
        customerName: 'Conflict B',
        customerPhone: '082222222222',
        customerEmail: 'integration.success@test.dev',
        notes: 'second booking same slot',
      })
    )

    expect(second.status).toBe(409)
    const payload = await second.json()
    expect(String(payload.error || '')).toContain('no longer available')
  })

  it('fetches booking by booking code', async () => {
    const created = await integrationPrisma.booking.findFirst({
      where: { customerEmail: 'integration.success@test.dev' },
      orderBy: { createdAt: 'desc' },
      select: { bookingCode: true },
    })

    if (!created) {
      throw new Error('No booking found for confirmation fetch test.')
    }

    const response = await GET(
      buildJsonRequest(
        `http://localhost/api/bookings?code=${encodeURIComponent(created.bookingCode)}`,
        'GET'
      )
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.booking.bookingCode).toBe(created.bookingCode)
  })
})
