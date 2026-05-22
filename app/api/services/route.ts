import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
