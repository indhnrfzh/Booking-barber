import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findMany()

    // Return as a flat object: { [key]: { valueId, valueEn } }
    const result: Record<string, { valueId: string; valueEn: string }> = {}
    for (const s of settings) {
      result[s.key] = { valueId: s.valueId, valueEn: s.valueEn }
    }

    return NextResponse.json({ settings: result }, { status: 200 })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}
