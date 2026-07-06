import { describe, expect, it } from 'vitest'

import { hashPassword, signToken, verifyPassword, verifyToken } from '@/lib/auth'

describe('auth helpers', () => {
  it('signs and verifies token payload', async () => {
    const token = await signToken({ username: 'admin', role: 'ADMIN' })
    const payload = await verifyToken(token)

    expect(payload).not.toBeNull()
    expect(payload?.username).toBe('admin')
    expect(payload?.role).toBe('ADMIN')
  })

  it('returns null for invalid token', async () => {
    const payload = await verifyToken('invalid.token.value')

    expect(payload).toBeNull()
  })

  it('hashes and verifies password pair', async () => {
    const hash = await hashPassword('super-secret')

    expect(hash).not.toBe('super-secret')
    expect(await verifyPassword('super-secret', hash)).toBe(true)
    expect(await verifyPassword('wrong-password', hash)).toBe(false)
  })
})
