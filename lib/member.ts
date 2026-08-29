export const POINTS_PER_IDR = 1000
export const VOUCHER_EXPIRY_DAYS = 90
export const DEFAULT_REMINDER_DAYS = 30

/**
 * Normalizes an Indonesian phone number to international format without plus sign (e.g., 6281234567890).
 */
export function normalizePhone(raw: string): string {
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''

  if (digits.startsWith('62')) {
    return digits
  }
  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`
  }
  if (digits.startsWith('8')) {
    return `62${digits}`
  }
  return digits
}

export function generateMemberCode(): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `MBR-${random}`
}

export function generateVoucherCode(): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `VCR-${random}`
}

export function calculatePoints(price: number): number {
  if (!price || price <= 0) return 0
  return Math.floor(price / POINTS_PER_IDR)
}

export function renderReminderTemplate(
  template: string,
  params: {
    name: string
    points: number
    link: string
    memberCode?: string
  }
): string {
  return template
    .replace(/{name}/g, params.name)
    .replace(/{points}/g, String(params.points))
    .replace(/{link}/g, params.link)
    .replace(/{memberCode}/g, params.memberCode || '')
}
