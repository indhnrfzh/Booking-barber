import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AdminAuthError, assertAdminToken } from '@/lib/auth'

async function verifyAdminToken(request: NextRequest) {
  await assertAdminToken(request.cookies.get('admin_token')?.value)
}

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        nameId: true,
        nameEn: true,
        descId: true,
        descEn: true,
        price: true,
        duration: true,
        imageUrl: true,
      },
    })

    return NextResponse.json({ services }, { status: 200 })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await verifyAdminToken(request)
    
    const body = await request.json()
    const { nameId, nameEn, descId, descEn, price, duration, imageUrl, isActive, order } = body

    if (!nameId || !nameEn || !descId || !descEn || !price || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const service = await prisma.service.create({
      data: {
        nameId,
        nameEn,
        descId,
        descEn,
        price,
        duration,
        imageUrl: imageUrl || null,
        isActive: isActive ?? true,
        order: order ?? 0,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}
