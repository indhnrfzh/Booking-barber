import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AdminAuthError, assertAdminToken } from '@/lib/auth'

async function verifyAdminToken(request: NextRequest) {
  await assertAdminToken(request.cookies.get('admin_token')?.value)
}

export async function GET(request: NextRequest) {
  try {
    const includeInactive = request.nextUrl.searchParams.get('includeInactive') === 'true'

    const images = await prisma.galleryImage.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        src: true,
        category: true,
        alt: true,
        order: true,
        isActive: true,
      },
    })

    return NextResponse.json({ images }, { status: 200 })
  } catch (error) {
    console.error('Error fetching gallery images:', error)
    return NextResponse.json({ error: 'Failed to fetch gallery images' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await verifyAdminToken(request)

    const body = await request.json()
    const { src, category, alt, order, isActive } = body

    if (!src || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const image = await prisma.galleryImage.create({
      data: {
        src,
        category,
        alt: alt || null,
        order: Number.isFinite(order) ? order : 0,
        isActive: typeof isActive === 'boolean' ? isActive : true,
      },
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Error creating gallery image:', error)
    return NextResponse.json(
      { error: 'Failed to create gallery image' },
      { status: 500 }
    )
  }
}
