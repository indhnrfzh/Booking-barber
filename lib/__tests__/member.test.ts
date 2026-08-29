import { describe, expect, it } from 'vitest'
import {
  calculatePoints,
  generateMemberCode,
  generateVoucherCode,
  normalizePhone,
  renderReminderTemplate,
} from '@/lib/member'

describe('member utils', () => {
  describe('normalizePhone', () => {
    it('normalizes leading 0 to 62', () => {
      expect(normalizePhone('081234567890')).toBe('6281234567890')
    })

    it('removes spaces, dashes, plus sign and formats correctly', () => {
      expect(normalizePhone('+62 812-3456-7890')).toBe('6281234567890')
    })

    it('prepends 62 if starting with 8', () => {
      expect(normalizePhone('81234567890')).toBe('6281234567890')
    })

    it('preserves existing 62 prefix', () => {
      expect(normalizePhone('6281234567890')).toBe('6281234567890')
    })

    it('returns empty string for empty input', () => {
      expect(normalizePhone('')).toBe('')
      expect(normalizePhone('   ')).toBe('')
    })
  })

  describe('code generation', () => {
    it('generates member code with MBR- prefix and 6 alphanumeric chars', () => {
      const code = generateMemberCode()
      expect(code).toMatch(/^MBR-[A-Z0-9]{6}$/)
    })

    it('generates voucher code with VCR- prefix and 6 alphanumeric chars', () => {
      const code = generateVoucherCode()
      expect(code).toMatch(/^VCR-[A-Z0-9]{6}$/)
    })
  })

  describe('calculatePoints', () => {
    it('calculates 1 point per 1000 IDR using floor', () => {
      expect(calculatePoints(100000)).toBe(100)
      expect(calculatePoints(75000)).toBe(75)
      expect(calculatePoints(150000)).toBe(150)
      expect(calculatePoints(1999)).toBe(1)
      expect(calculatePoints(999)).toBe(0)
      expect(calculatePoints(0)).toBe(0)
      expect(calculatePoints(-5000)).toBe(0)
    })
  })

  describe('renderReminderTemplate', () => {
    it('replaces all placeholders correctly', () => {
      const template = 'Halo {name}! Kamu punya {points} poin di Prestige. Booking: {link} (Kode: {memberCode})'
      const rendered = renderReminderTemplate(template, {
        name: 'Budi Santoso',
        points: 150,
        link: 'https://prestige.id/id/booking',
        memberCode: 'MBR-ABC123',
      })

      expect(rendered).toBe(
        'Halo Budi Santoso! Kamu punya 150 poin di Prestige. Booking: https://prestige.id/id/booking (Kode: MBR-ABC123)'
      )
    })
  })
})
