import { describe, expect, it } from 'vitest'
import { formatPrice, generateBookingCode } from '@/lib/utils'

describe('utils', () => {
  it('formats IDR price with locale id', () => {
    expect(formatPrice(150000, 'id')).toContain('Rp')
  })

  it('generates booking code with expected format', () => {
    const code = generateBookingCode()

    expect(code).toMatch(/^REF-[A-Z0-9]{6}$/)
  })
})
