import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMemberCodeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    const member = await prisma.member.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        name: true,
        email: true,
        memberCode: true,
      },
    })

    if (member && process.env.RESEND_API_KEY) {
      await sendMemberCodeEmail({
        customerName: member.name,
        customerEmail: member.email,
        memberCode: member.memberCode,
      })
    }

    // Always return 200 for anti-enumeration
    return NextResponse.json(
      {
        success: true,
        message: 'If the email is registered, your member code has been sent.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error recovering member code:', error)
    return NextResponse.json(
      { error: 'Failed to recover member code' },
      { status: 500 }
    )
  }
}
