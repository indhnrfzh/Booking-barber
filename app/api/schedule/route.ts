import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
      orderBy: { dayOfWeek: 'asc' },
      select: {
        dayOfWeek: true,
        openTime: true,
        closeTime: true,
        isOpen: true,
      },
    })

    return NextResponse.json({ schedules }, { status: 200 })
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })
  }
}
