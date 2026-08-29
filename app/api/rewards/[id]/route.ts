import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AdminAuthError, assertAdminToken } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    await assertAdminToken(request.cookies.get('admin_token')?.value)

    const body = await request.json()
    const { nameId, nameEn, pointsCost, discountType, discountValue, isActive, order } = body

    const reward = await prisma.reward.update({
      where: { id: params.id },
      data: {
        nameId,
        nameEn,
        pointsCost: pointsCost !== undefined ? Number(pointsCost) : undefined,
        discountType,
        discountValue: discountValue !== undefined ? Number(discountValue) : undefined,
        isActive: typeof isActive === 'boolean' ? isActive : undefined,
        order: order !== undefined ? Number(order) : undefined,
      },
    })

    return NextResponse.json(reward)
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Reward not found' },
        { status: 404 }
      )
    }

    console.error('Error updating reward:', error)
    return NextResponse.json(
      { error: 'Failed to update reward' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    await assertAdminToken(request.cookies.get('admin_token')?.value)

    await prisma.reward.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Reward not found' },
        { status: 404 }
      )
    }

    console.error('Error deleting reward:', error)
    return NextResponse.json(
      { error: 'Failed to delete reward' },
      { status: 500 }
    )
  }
}
