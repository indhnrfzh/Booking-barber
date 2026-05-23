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
    const { src, category, alt, order, isActive } = body

    const image = await prisma.galleryImage.update({
      where: { id: params.id },
      data: {
        src,
        category,
        alt,
        order,
        isActive,
      },
    })

    return NextResponse.json(image)
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'P2025') {
      return NextResponse.json({ error: 'Gallery image not found' }, { status: 404 })
    }
    const message = error instanceof Error ? error.message : 'Failed to update gallery image'
    const isAuthError = error instanceof Error && error.message === 'No token'
    return NextResponse.json(
      { error: message },
      { status: isAuthError ? 401 : 500 }
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

    await prisma.galleryImage.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'P2025') {
      return NextResponse.json({ error: 'Gallery image not found' }, { status: 404 })
    }
    const message = error instanceof Error ? error.message : 'Failed to delete gallery image'
    const isAuthError = error instanceof Error && error.message === 'No token'
    return NextResponse.json(
      { error: message },
      { status: isAuthError ? 401 : 500 }
    )
  }
}
