import { normalizePhone } from './member'

export interface WhatsAppSendResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send WhatsApp message using configurable gateway (Fonnte by default, expandable to Wablas / Meta).
 * If WA_API_TOKEN is not configured, it gracefully falls back with a descriptive error.
 */
export async function sendWhatsAppMessage(
  targetPhone: string,
  message: string
): Promise<WhatsAppSendResult> {
  const token = process.env.WA_API_TOKEN || process.env.FONNTE_TOKEN
  if (!token) {
    return {
      success: false,
      error: 'WA_API_TOKEN is not configured in environment variables.',
    }
  }

  const cleanPhone = normalizePhone(targetPhone)
  if (!cleanPhone) {
    return {
      success: false,
      error: 'Invalid phone number format.',
    }
  }

  try {
    // Default integration with Fonnte (https://api.fonnte.com/send)
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: cleanPhone,
        message,
        countryCode: '62',
      }),
    })

    const data = await response.json()

    if (!response.ok || data.status === false) {
      return {
        success: false,
        error: data.reason || data.message || 'Failed to dispatch WhatsApp message via gateway.',
      }
    }

    return {
      success: true,
      messageId: data.id?.[0] || 'sent',
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown network error'
    console.error('WhatsApp dispatch error:', error)
    return {
      success: false,
      error: errorMsg,
    }
  }
}
