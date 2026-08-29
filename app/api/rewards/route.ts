import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AdminAuthError, assertAdminToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const isAll = request.nextUrl.searchParams.get('all') === 'true'

    if (isAll) {
      // Check admin auth if asking for all (including inactive)
      await assertAdminToken(request.cookies.get('admin_token')?.value)
      const rewards = await prisma.reward.findMany({
        orderBy: { order: 'asc' },
      })
      return NextResponse.json({ rewards }, { status: 200 })
    }

    const rewards = await prisma.reward.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ rewards }, { status: 200 })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching rewards:', error)
    return NextResponse.json({ error: 'Failed to fetch rewards' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await assertAdminToken(request.cookies.get('admin_token')?.value)

    const body = await request.json()
    const { nameId, nameEn, pointsCost, discountType, discountValue, isActive, order } = body

    if (!nameId || !nameEn || !pointsCost || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['PERCENT', 'FIXED'].includes(discountType)) {
      return NextResponse.json(
        { error: 'discountType must be PERCENT or FIXED' },
        { status: 400 }
      )
    }

    const reward = await prisma.reward.create({
      data: {
        nameId,
        nameEn,
        pointsCost: Number(pointsCost),
        discountType,
        discountValue: Number(discountValue),
        isActive: typeof isActive === 'boolean' ? isActive : true,
        order: Number.isFinite(order) ? Number(order) : 0,
      },
    })

    return NextResponse.json(reward, { status: 201 })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating reward:', error)
    return NextResponse.json({ error: 'Failed to create reward' }, { status: 500 })
  }
}
