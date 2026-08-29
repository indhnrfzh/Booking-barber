import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  generateUniqueVoucherCode,
  getMemberBalance,
  verifyMemberAccess,
  VOUCHER_EXPIRY_DAYS,
} from '@/lib/member-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, phone, rewardId } = body

    if (!code || !phone || !rewardId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const member = await verifyMemberAccess(code, phone)
    if (!member) {
      return NextResponse.json(
        { error: 'Member not found or phone number does not match' },
        { status: 404 }
      )
    }

    const reward = await prisma.reward.findFirst({
      where: {
        id: rewardId,
        isActive: true,
      },
    })

    if (!reward) {
      return NextResponse.json(
        { error: 'Reward not found or inactive' },
        { status: 404 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const currentBalance = await getMemberBalance(member.id, tx)

      if (currentBalance < reward.pointsCost) {
        throw new Error('INSUFFICIENT_POINTS')
      }

      const voucherCode = await generateUniqueVoucherCode(tx)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + VOUCHER_EXPIRY_DAYS)

      const voucher = await tx.voucher.create({
        data: {
          code: voucherCode,
          memberId: member.id,
          nameId: reward.nameId,
          nameEn: reward.nameEn,
          discountType: reward.discountType,
          discountValue: reward.discountValue,
          pointsCost: reward.pointsCost,
          status: 'ACTIVE',
          expiresAt,
        },
      })

      await tx.pointLedger.create({
        data: {
          memberId: member.id,
          voucherId: voucher.id,
          delta: -reward.pointsCost,
          note: `Tukar reward: ${reward.nameId}`,
        },
      })

      return {
        voucher,
        newBalance: currentBalance - reward.pointsCost,
      }
    })

    return NextResponse.json(
      {
        success: true,
        voucher: result.voucher,
        newBalance: result.newBalance,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'INSUFFICIENT_POINTS') {
      return NextResponse.json(
        { error: 'Insufficient points balance' },
        { status: 400 }
      )
    }

    console.error('Error redeeming reward:', error)
    return NextResponse.json(
      { error: 'Failed to redeem reward' },
      { status: 500 }
    )
  }
}
