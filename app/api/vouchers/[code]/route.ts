import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AdminAuthError, assertAdminToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    await assertAdminToken(request.cookies.get('admin_token')?.value)
    const { code } = await context.params

    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase().trim() },
      include: {
        member: {
          select: {
            memberCode: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    })

    if (!voucher) {
      return NextResponse.json({ error: 'Voucher not found' }, { status: 404 })
    }

    // Check expiry
    const isExpired = voucher.status === 'ACTIVE' && voucher.expiresAt < new Date()
    const currentStatus = isExpired ? 'EXPIRED' : voucher.status

    return NextResponse.json(
      {
        voucher: {
          ...voucher,
          status: currentStatus,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching voucher:', error)
    return NextResponse.json({ error: 'Failed to fetch voucher' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    await assertAdminToken(request.cookies.get('admin_token')?.value)
    const { code } = await context.params
    const body = await request.json()
    const { status } = body

    if (status !== 'USED' && status !== 'ACTIVE' && status !== 'EXPIRED') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const cleanCode = code.toUpperCase().trim()
    const existing = await prisma.voucher.findUnique({
      where: { code: cleanCode },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Voucher not found' }, { status: 404 })
    }

    if (status === 'USED' && existing.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: `Voucher is already ${existing.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    if (status === 'USED' && existing.expiresAt < new Date()) {
      await prisma.voucher.update({
        where: { id: existing.id },
        data: { status: 'EXPIRED' },
      })
      return NextResponse.json(
        { error: 'Voucher has expired' },
        { status: 400 }
      )
    }

    const updated = await prisma.voucher.update({
      where: { id: existing.id },
      data: {
        status,
        usedAt: status === 'USED' ? new Date() : existing.usedAt,
      },
      include: {
        member: {
          select: {
            memberCode: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ voucher: updated }, { status: 200 })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating voucher:', error)
    return NextResponse.json({ error: 'Failed to update voucher' }, { status: 500 })
  }
}
