import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AdminAuthError, assertAdminToken } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await assertAdminToken(request.cookies.get('admin_token')?.value)
    const { id } = await context.params

    const member = await prisma.member.update({
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

    return NextResponse.json({ success: true, member }, { status: 200 })
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    console.error('Error marking member as reminded:', error)
    return NextResponse.json({ error: 'Failed to update reminder timestamp' }, { status: 500 })
  }
}
