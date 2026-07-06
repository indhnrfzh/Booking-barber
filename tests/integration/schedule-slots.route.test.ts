import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'

import { GET } from '@/app/api/schedule/slots/route'
import { integrationPrisma } from '@/tests/integration/helpers/db'

function buildGetRequest(url: string) {
  return new NextRequest(url, { method: 'GET' })
}

describe('GET /api/schedule/slots', () => {
  it('returns available slots for valid date and service', async () => {
    const service = await integrationPrisma.service.findFirst({
      where: { isActive: true },
      select: { id: true },
      orderBy: { order: 'asc' },
    })

    if (!service) {
      throw new Error('Seed data is missing active service for slots integration test.')
    }

    const response = await GET(
      buildGetRequest(`http://localhost/api/schedule/slots?date=2026-06-08&serviceId=${service.id}`)
    )

    expect(response.status).toBe(200)
    const payload = await response.json()

    expect(Array.isArray(payload.slots)).toBe(true)
    expect(payload.slots.length).toBeGreaterThan(0)
  })

  it('returns 400 for missing params', async () => {
    const response = await GET(buildGetRequest('http://localhost/api/schedule/slots'))

    expect(response.status).toBe(400)
  })
})
