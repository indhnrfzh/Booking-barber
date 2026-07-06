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
    const message = error instanceof Error ? error.message : 'Failed to create gallery image'
    const isAuthError = error instanceof Error && error.message === 'No token'
    return NextResponse.json(
      { error: message },
      { status: isAuthError ? 401 : 500 }
    )
  }
}
