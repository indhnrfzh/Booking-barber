import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'

import { PUT } from '@/app/api/bookings/[id]/route'
import { signToken } from '@/lib/auth'
import { integrationPrisma } from '@/tests/integration/helpers/db'

function buildPut(url: string, token: string, body: unknown) {
  return new NextRequest(url, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      cookie: `admin_token=${token}`,
    },
    body: JSON.stringify(body),
  })
}

describe('PUT /api/bookings/[id]', () => {
  it('updates status when token is valid admin', async () => {
    const service = await integrationPrisma.service.findFirst({
      where: { isActive: true },
      select: { id: true },
      orderBy: { order: 'asc' },
    })

    if (!service) {
      throw new Error('Seed data is missing active service for booking status integration test.')
    }

    const booking = await integrationPrisma.booking.create({
      data: {
        bookingCode: 'REF-STAT01',
        customerName: 'Status Test',
        customerPhone: '081298765432',
        customerEmail: 'status.integration@test.dev',
        serviceId: service.id,
        bookingDate: new Date('2026-06-10T00:00:00.000+07:00'),
        timeSlot: '11:00',
        status: 'PENDING',
      },
      select: { id: true },
    })

    const token = await signToken({
      sub: 'integration-admin',
      username: 'admin',
      role: 'admin',
    })

    const response = await PUT(
      buildPut(`http://localhost/api/bookings/${booking.id}`, token, {
        status: 'CONFIRMED',
      }),
      {
        params: Promise.resolve({ id: booking.id }),
      }
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.success).toBe(true)
    expect(payload.booking.status).toBe('CONFIRMED')

    await integrationPrisma.booking.delete({ where: { id: booking.id } })
  })

  it('returns 401 when token is missing', async () => {
    const response = await PUT(
      new NextRequest('http://localhost/api/bookings/non-existent-id', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      }),
      {
        params: Promise.resolve({ id: 'non-existent-id' }),
      }
    )

    expect(response.status).toBe(401)
  })
})
