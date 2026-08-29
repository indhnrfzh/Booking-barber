import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AdminAuthError, assertAdminToken } from '@/lib/auth'

async function verifyAdminToken(request: NextRequest) {
  await assertAdminToken(request.cookies.get('admin_token')?.value)
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
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'P2025') {
      return NextResponse.json({ error: 'Gallery image not found' }, { status: 404 })
    }
    console.error('Error updating gallery image:', error)
    return NextResponse.json(
      { error: 'Failed to update gallery image' },
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

    await verifyAdminToken(request)

    await prisma.galleryImage.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'P2025') {
      return NextResponse.json({ error: 'Gallery image not found' }, { status: 404 })
    }
    console.error('Error deleting gallery image:', error)
    return NextResponse.json(
      { error: 'Failed to delete gallery image' },
      { status: 500 }
    )
  }
}
