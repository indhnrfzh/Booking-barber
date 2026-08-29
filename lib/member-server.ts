import { prisma } from '@/lib/prisma'
import { PrismaClient } from '@prisma/client'
import {
  generateMemberCode,
  generateVoucherCode,
  normalizePhone,
} from '@/lib/member'

export * from '@/lib/member'

type PrismaOrTx = PrismaClient | Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

export async function generateUniqueMemberCode(db: PrismaOrTx = prisma): Promise<string> {
  for (let i = 0; i < 8; i += 1) {
    const code = generateMemberCode()
    const existing = await db.member.findUnique({
      where: { memberCode: code },
      select: { id: true },
    })
    if (!existing) return code
  }
  throw new Error('Failed to generate unique member code')
}

export async function generateUniqueVoucherCode(db: PrismaOrTx = prisma): Promise<string> {
  for (let i = 0; i < 8; i += 1) {
    const code = generateVoucherCode()
    const existing = await db.voucher.findUnique({
      where: { code },
      select: { id: true },
    })
    if (!existing) return code
  }
  throw new Error('Failed to generate unique voucher code')
}

export async function getMemberBalance(memberId: string, db: PrismaOrTx = prisma): Promise<number> {
  const result = await db.pointLedger.aggregate({
    where: { memberId },
    _sum: { delta: true },
  })
  return result._sum.delta ?? 0
}

export async function verifyMemberAccess(
  code: string,
  rawPhone: string,
  db: PrismaOrTx = prisma
) {
  if (!code || !rawPhone) return null

  const member = await db.member.findUnique({
    where: { memberCode: code.toUpperCase().trim() },
  })

  if (!member) return null

  const normalizedInputPhone = normalizePhone(rawPhone)
  const normalizedMemberPhone = normalizePhone(member.phone)

  if (normalizedInputPhone !== normalizedMemberPhone) {
    return null
  }

  return member
}

export interface ResolveMemberParams {
  memberCode?: string
  joinMember?: boolean
  waOptIn?: boolean
  name: string
  phone: string
  email: string
}

export async function resolveMemberForBooking(
  params: ResolveMemberParams,
  db: PrismaOrTx = prisma
): Promise<{
  member: {
    id: string
    memberCode: string
    name: string
    phone: string
    email: string
    waOptIn: boolean
  } | null
  isNew: boolean
  error?: string
}> {
  const { memberCode, joinMember, waOptIn, name, phone, email } = params

  // 1. If explicit memberCode provided: link to existing member
  if (memberCode && memberCode.trim()) {
    const existing = await db.member.findUnique({
      where: { memberCode: memberCode.toUpperCase().trim() },
      select: {
        id: true,
        memberCode: true,
        name: true,
        phone: true,
        email: true,
        waOptIn: true,
      },
    })

    if (!existing) {
      return { member: null, isNew: false, error: 'Member code not found' }
    }

    if (waOptIn && !existing.waOptIn) {
      await db.member.update({
        where: { id: existing.id },
        data: { waOptIn: true },
      })
      existing.waOptIn = true
    }

    return { member: existing, isNew: false }
  }

  // 2. If joinMember opted-in: find by email (dedupe) or create
  if (joinMember) {
    const cleanEmail = email.toLowerCase().trim()
    const normalizedPhone = normalizePhone(phone)

    const existingByEmail = await db.member.findUnique({
      where: { email: cleanEmail },
      select: {
        id: true,
        memberCode: true,
        name: true,
        phone: true,
        email: true,
        waOptIn: true,
      },
    })

    if (existingByEmail) {
      if (waOptIn && !existingByEmail.waOptIn) {
        await db.member.update({
          where: { id: existingByEmail.id },
          data: { waOptIn: true },
        })
        existingByEmail.waOptIn = true
      }
      return { member: existingByEmail, isNew: false }
    }

    const newCode = await generateUniqueMemberCode(db)
    const newMember = await db.member.create({
      data: {
        memberCode: newCode,
        name: name.trim(),
        phone: normalizedPhone,
        email: cleanEmail,
        waOptIn: Boolean(waOptIn),
      },
      select: {
        id: true,
        memberCode: true,
        name: true,
        phone: true,
        email: true,
        waOptIn: true,
      },
    })

    return { member: newMember, isNew: true }
  }

  // 3. Guest booking
  return { member: null, isNew: false }
}
