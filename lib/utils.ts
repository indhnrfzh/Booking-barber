import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, locale: string = 'id') {
  return new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: Date | string, locale: string = 'id') {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd MMMM yyyy', { locale: locale === 'id' ? idLocale : undefined })
}

export function formatDateTime(date: Date | string, locale: string = 'id') {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd MMMM yyyy HH:mm', { locale: locale === 'id' ? idLocale : undefined })
}

export function generateBookingCode(): string {
  const prefix = 'REF'
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${random}`
}

export function convertTo24Hour(timeString: string): string {
  // Input format: "13:30" → Output: "13:30"
  return timeString
}

export function getTimeSlots(
  openTime: string,
  closeTime: string,
  duration: number,
  bookedSlots: string[] = []
) {
  const slots: string[] = []
  
  const [openHour, openMin] = openTime.split(':').map(Number)
  const [closeHour, closeMin] = closeTime.split(':').map(Number)
  
  let currentHour = openHour
  let currentMin = openMin
  
  const closeTimeInMin = closeHour * 60 + closeMin
  
  while (true) {
    const currentTimeInMin = currentHour * 60 + currentMin
    const nextTimeInMin = currentTimeInMin + duration
    
    if (nextTimeInMin > closeTimeInMin) break
    
    const timeSlot = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`
    
    if (!bookedSlots.includes(timeSlot)) {
      slots.push(timeSlot)
    }
    
    currentMin += 60 // Interval 1 jam
    if (currentMin >= 60) {
      currentHour += 1
      currentMin = 0
    }
  }
  
  return slots
}

export function getDayName(dayOfWeek: number, locale: string = 'id'): string {
  const daysId = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  if (locale === 'id') {
    return daysId[dayOfWeek]
  }
  return daysEn[dayOfWeek]
}

export async function withAsync<T>(
  fn: () => Promise<T>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await fn()
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
