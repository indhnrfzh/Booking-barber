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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    
    await verifyAdminToken(request)

    const body = await request.json()
    const { nameId, nameEn, descId, descEn, price, duration, imageUrl, isActive, order } = body

    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        nameId,
        nameEn,
        descId,
        descEn,
        price,
        duration,
        imageUrl,
        isActive,
        order,
      },
    })

    return NextResponse.json(service)
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    const message = error instanceof Error ? error.message : 'Failed to update service'

    return NextResponse.json(
      { error: message },
      { status: message === 'No token' ? 401 : 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    
    await verifyAdminToken(request)

    await prisma.service.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    const message = error instanceof Error ? error.message : 'Failed to delete service'

    return NextResponse.json(
      { error: message },
      { status: message === 'No token' ? 401 : 500 }
    )
  }
}
