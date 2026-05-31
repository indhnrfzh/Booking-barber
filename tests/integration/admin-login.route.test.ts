import { describe, expect, it } from 'vitest'

import { POST } from '@/app/api/admin/login/route'

function buildPost(url: string, body: unknown) {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/login', () => {
  it('returns 200 and sets cookie for valid credentials', async () => {
    const response = await POST(
      buildPost('http://localhost/api/admin/login', {
        username: 'admin',
        password: 'admin123',
      }) as never
    )

    expect(response.status).toBe(200)

    const cookieHeader = response.headers.get('set-cookie') || ''
    expect(cookieHeader).toContain('admin_token=')

    const payload = await response.json()
    expect(payload.success).toBe(true)
    expect(payload.admin.username).toBe('admin')
  })

  it('returns 401 for invalid credentials', async () => {
    const response = await POST(
      buildPost('http://localhost/api/admin/login', {
        username: 'admin',
        password: 'wrong-password',
      }) as never
    )

    expect(response.status).toBe(401)
  })
})
