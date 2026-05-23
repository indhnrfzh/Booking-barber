import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

async function verifyAdminToken(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  if (!token) {
    throw new Error('No token')
  }
  const verified = await jwtVerify(token, JWT_SECRET)
  if (verified.payload.role !== 'admin') {
    throw new Error('Not admin')
  }
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
    const message = error instanceof Error ? error.message : 'Failed to create service'

    return NextResponse.json(
      { error: message },
      { status: message === 'No token' ? 401 : 500 }
    )
  }
}
