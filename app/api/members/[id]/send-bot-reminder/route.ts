import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AdminAuthError, assertAdminToken } from '@/lib/auth'
import { renderReminderTemplate } from '@/lib/member'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await assertAdminToken(request.cookies.get('admin_token')?.value)
    const { id } = await context.params

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        pointLedgers: {
          select: { delta: true },
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const templateSetting = await prisma.siteSettings.findUnique({
      where: { key: 'reminder_template' },
    })

    const template =
      templateSetting?.valueId ||
      'Halo {name}! 💈 Sudah waktunya rapikan rambutmu kembali di Prestige Barbershop. Kamu punya {points} poin untuk ditukar diskon. Booking jadwalmu di sini: {link}'

    const points = member.pointLedgers.reduce((sum, entry) => sum + entry.delta, 0)
    const text = renderReminderTemplate(template, {
      name: member.name,
      points,
      link: 'https://prestigebarbershop.id/id/booking',
      memberCode: member.memberCode,
    })

    const sendResult = await sendWhatsAppMessage(member.phone, text)

    if (!sendResult.success) {
      return NextResponse.json(
        { error: sendResult.error || 'Failed to send WhatsApp message via Bot' },
        { status: 502 }
      )
    }

    // Update last reminder timestamp
    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        lastReminderAt: new Date(),
      },
      select: {
        id: true,
        memberCode: true,
        lastReminderAt: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        member: updatedMember,
        messageId: sendResult.messageId,
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Error dispatching bot reminder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
