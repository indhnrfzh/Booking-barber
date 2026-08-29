import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as createBooking } from '@/app/api/bookings/route'
import { PUT as updateBookingStatus } from '@/app/api/bookings/[id]/route'
import { GET as lookupMember } from '@/app/api/member/lookup/route'
import { POST as redeemReward } from '@/app/api/member/redeem/route'
import { POST as recoverMemberCode } from '@/app/api/member/recover/route'
import { integrationPrisma } from '@/tests/integration/helpers/db'
import { signToken } from '@/lib/auth'

function buildJsonRequest(url: string, method: string, body?: unknown, cookieToken?: string) {
  return new NextRequest(url, {
    method,
    headers: {
      'content-type': 'application/json',
      cookie: cookieToken ? `admin_token=${cookieToken}` : '',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('Member & Loyalty Integration Flow', () => {
  let serviceId = ''
  let adminToken = ''
  let testRewardId = ''
  const testEmail = 'loyalty.tester@example.com'
  const testPhone = '081299998888'

  beforeAll(async () => {
    const service = await integrationPrisma.service.findFirst({
      where: { isActive: true },
      select: { id: true },
    })

    if (!service) {
      throw new Error('Missing active service for loyalty tests')
    }
    serviceId = service.id

    adminToken = await signToken({
      sub: 'integration-admin',
      username: 'admin',
      role: 'admin',
    })

    // Create a test reward
    const reward = await integrationPrisma.reward.create({
      data: {
        nameId: 'Test Diskon 10 Poin',
        nameEn: 'Test 10 Points Off',
        pointsCost: 50,
        discountType: 'FIXED',
        discountValue: 10000,
        isActive: true,
      },
    })
    testRewardId = reward.id
  })

  afterAll(async () => {
    await integrationPrisma.booking.deleteMany({
      where: { customerEmail: testEmail },
    })
    const member = await integrationPrisma.member.findUnique({
      where: { email: testEmail },
    })
    if (member) {
      await integrationPrisma.pointLedger.deleteMany({
        where: { memberId: member.id },
      })
      await integrationPrisma.voucher.deleteMany({
        where: { memberId: member.id },
      })
      await integrationPrisma.member.delete({
        where: { id: member.id },
      })
    }
    if (testRewardId) {
      await integrationPrisma.reward.deleteMany({
        where: { id: testRewardId },
      })
    }
  })

  it('enrolls member during booking and returns memberCode', async () => {
    const response = await createBooking(
      buildJsonRequest('http://localhost/api/bookings', 'POST', {
        serviceId,
        bookingDate: '2026-06-15',
        timeSlot: '09:00',
        customerName: 'Loyalty Tester',
        customerPhone: testPhone,
        customerEmail: testEmail,
        joinMember: true,
        waOptIn: true,
      })
    )

    expect(response.status).toBe(201)
    const payload = await response.json()

    expect(payload.success).toBe(true)
    expect(payload.memberCode).toMatch(/^MBR-[A-Z0-9]{6}$/)

    // Verify in database
    const member = await integrationPrisma.member.findUnique({
      where: { email: testEmail },
    })
    expect(member).not.toBeNull()
    expect(member?.waOptIn).toBe(true)
    expect(member?.memberCode).toBe(payload.memberCode)
  })

  it('lookups member with matching code and phone', async () => {
    const member = await integrationPrisma.member.findUnique({
      where: { email: testEmail },
    })
    expect(member).not.toBeNull()

    // Successful lookup
    const response = await lookupMember(
      buildJsonRequest(
        `http://localhost/api/member/lookup?code=${member?.memberCode}&phone=${testPhone}`,
        'GET'
      )
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.member.memberCode).toBe(member?.memberCode)
    expect(payload.points).toBe(0)

    // Failed lookup: wrong phone
    const failedRes = await lookupMember(
      buildJsonRequest(
        `http://localhost/api/member/lookup?code=${member?.memberCode}&phone=089999999999`,
        'GET'
      )
    )
    expect(failedRes.status).toBe(404)
  })

  it('awards points on booking COMPLETED and prevents duplicate award', async () => {
    const booking = await integrationPrisma.booking.findFirst({
      where: { customerEmail: testEmail },
      include: { service: true },
    })
    expect(booking).not.toBeNull()

    // Mark as COMPLETED
    const response1 = await updateBookingStatus(
      buildJsonRequest(
        `http://localhost/api/bookings/${booking?.id}`,
        'PUT',
        { status: 'COMPLETED' },
        adminToken
      ),
      { params: Promise.resolve({ id: booking!.id }) }
    )

    expect(response1.status).toBe(200)

    // Verify points in DB
    const expectedPoints = Math.floor((booking?.service.price || 0) / 1000)
    const ledgers = await integrationPrisma.pointLedger.findMany({
      where: { bookingId: booking?.id },
    })
    expect(ledgers.length).toBe(1)
    expect(ledgers[0].delta).toBe(expectedPoints)

    // Mark as COMPLETED second time (Idempotency test)
    const response2 = await updateBookingStatus(
      buildJsonRequest(
        `http://localhost/api/bookings/${booking?.id}`,
        'PUT',
        { status: 'COMPLETED' },
        adminToken
      ),
      { params: Promise.resolve({ id: booking!.id }) }
    )
    expect(response2.status).toBe(200)

    const ledgersAfter = await integrationPrisma.pointLedger.findMany({
      where: { bookingId: booking?.id },
    })
    expect(ledgersAfter.length).toBe(1) // Still exactly 1 entry!
  })

  it('redeems voucher with points and verifies insufficient balance rejection', async () => {
    const member = await integrationPrisma.member.findUnique({
      where: { email: testEmail },
    })
    expect(member).not.toBeNull()

    // Redeem reward (50 points cost)
    const redeemRes = await redeemReward(
      buildJsonRequest('http://localhost/api/member/redeem', 'POST', {
        code: member?.memberCode,
        phone: testPhone,
        rewardId: testRewardId,
      })
    )

    expect(redeemRes.status).toBe(201)
    const payload = await redeemRes.json()
    expect(payload.success).toBe(true)
    expect(payload.voucher.code).toMatch(/^VCR-[A-Z0-9]{6}$/)
    expect(payload.voucher.status).toBe('ACTIVE')

    // Second redeem when points might be insufficient or exact
    // Let's create an expensive reward requiring 99999 points
    const expensiveReward = await integrationPrisma.reward.create({
      data: {
        nameId: 'VIP Supercar',
        nameEn: 'VIP Supercar',
        pointsCost: 999999,
        discountType: 'PERCENT',
        discountValue: 100,
      },
    })

    const failRedeem = await redeemReward(
      buildJsonRequest('http://localhost/api/member/redeem', 'POST', {
        code: member?.memberCode,
        phone: testPhone,
        rewardId: expensiveReward.id,
      })
    )

    expect(failRedeem.status).toBe(400)
    await integrationPrisma.reward.delete({ where: { id: expensiveReward.id } })
  })

  it('handles member code recovery cleanly', async () => {
    const res = await recoverMemberCode(
      buildJsonRequest('http://localhost/api/member/recover', 'POST', {
        email: testEmail,
      })
    )

    expect(res.status).toBe(200)
    const payload = await res.json()
    expect(payload.success).toBe(true)
  })
})
