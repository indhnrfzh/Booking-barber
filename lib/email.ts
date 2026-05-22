import { Resend } from 'resend'

interface BookingEmailData {
  customerName: string
  customerEmail: string
  serviceName: string
  bookingDate: string
  timeSlot: string
  bookingCode: string
  price: number
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { success: false, error: 'RESEND_API_KEY is not configured' }
  }

  const resend = new Resend(apiKey)

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(data.price)

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0A0A0A; color: #C9A84C; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .booking-code { font-size: 24px; font-weight: bold; color: #C9A84C; background: #f0f0f0; padding: 10px; text-align: center; margin: 20px 0; }
          .detail { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #C9A84C; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Prestige Barbershop</h1>
            <p>Booking Confirmation</p>
          </div>
          
          <div class="content">
            <p>Halo ${data.customerName},</p>
            
            <p>Terima kasih telah melakukan booking di Prestige Barbershop! Berikut adalah detail booking Anda:</p>
            
            <div class="booking-code">${data.bookingCode}</div>
            
            <div class="detail">
              <strong>Layanan:</strong> ${data.serviceName}
            </div>
            <div class="detail">
              <strong>Tanggal:</strong> ${data.bookingDate}
            </div>
            <div class="detail">
              <strong>Waktu:</strong> ${data.timeSlot}
            </div>
            <div class="detail">
              <strong>Harga:</strong> ${formattedPrice}
            </div>
            
            <p style="margin-top: 20px; padding: 20px; background: #fffacd; border-radius: 5px;">
              <strong>⚠️ Penting:</strong> Harap tiba 5-10 menit sebelum jadwal booking Anda. Jika ada perubahan, hubungi kami secepatnya melalui WhatsApp.
            </p>
            
            <p>Terima kasih telah memilih Prestige Barbershop. Kami siap memberikan pengalaman terbaik untuk Anda!</p>
            
            <p>Best regards,<br><strong>Prestige Barbershop Team</strong></p>
          </div>
          
          <div class="footer">
            <p>Prestige Barbershop | Jl. Merdeka No. 123, Jakarta Selatan | +62 858-1234-5678</p>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    await resend.emails.send({
      from: 'booking@prestigebarbershop.id',
      to: data.customerEmail,
      subject: `Konfirmasi Booking - ${data.bookingCode}`,
      html: htmlContent,
    })
    return { success: true }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error }
  }
}
