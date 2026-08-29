'use client'

import { useState, useEffect, use } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface MemberData {
  id: string
  memberCode: string
  name: string
  phone: string
  email: string
  waOptIn: boolean
}

interface BookingHistory {
  id: string
  bookingCode: string
  bookingDate: string
  timeSlot: string
  status: string
  service: {
    nameId: string
    nameEn: string
    price: number
  }
  voucher?: {
    code: string
    discountType: 'PERCENT' | 'FIXED'
    discountValue: number
  } | null
}

interface VoucherItem {
  id: string
  code: string
  nameId: string
  nameEn: string
  discountType: 'PERCENT' | 'FIXED'
  discountValue: number
  pointsCost: number
  status: 'ACTIVE' | 'USED' | 'EXPIRED'
  expiresAt: string
  usedAt?: string | null
}

interface RewardItem {
  id: string
  nameId: string
  nameEn: string
  pointsCost: number
  discountType: 'PERCENT' | 'FIXED'
  discountValue: number
  isActive: boolean
  order: number
}

export default function MemberPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const t = useTranslations('member')

  const [memberCodeInput, setMemberCodeInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [member, setMember] = useState<MemberData | null>(null)
  const [points, setPoints] = useState<number>(0)
  const [bookings, setBookings] = useState<BookingHistory[]>([])
  const [vouchers, setVouchers] = useState<VoucherItem[]>([])
  const [rewards, setRewards] = useState<RewardItem[]>([])
  const [activeTab, setActiveTab] = useState<'vouchers' | 'rewards' | 'history'>('vouchers')
  const [redeemingRewardId, setRedeemingRewardId] = useState<string | null>(null)

  // Recovery dialog
  const [showRecover, setShowRecover] = useState(false)
  const [recoverEmail, setRecoverEmail] = useState('')
  const [recovering, setRecovering] = useState(false)

  // Fetch available rewards on load
  useEffect(() => {
    fetch('/api/rewards')
      .then((res) => res.json())
      .then((data) => {
        if (data.rewards) setRewards(data.rewards)
      })
      .catch(() => {})
  }, [])

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!memberCodeInput.trim() || !phoneInput.trim()) {
      toast.error(t('invalidMember'))
      return
    }

    setLoading(true)
    try {
      const query = new URLSearchParams({
        code: memberCodeInput.trim(),
        phone: phoneInput.trim(),
      })
      const res = await fetch(`/api/member/lookup?${query.toString()}`)
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || t('invalidMember'))
        return
      }

      setMember(data.member)
      setPoints(data.points)
      setBookings(data.bookings || [])
      setVouchers(data.vouchers || [])
    } catch {
      toast.error(t('invalidMember'))
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async (reward: RewardItem) => {
    if (points < reward.pointsCost) {
      toast.error(t('insufficientPoints'))
      return
    }

    if (!member) return

    setRedeemingRewardId(reward.id)
    try {
      const res = await fetch('/api/member/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: member.memberCode,
          phone: member.phone,
          rewardId: reward.id,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to redeem reward')
        return
      }

      toast.success(t('redeemSuccess'))
      setPoints(data.newBalance)
      setVouchers((prev) => [data.voucher, ...prev])
      setActiveTab('vouchers')
    } catch {
      toast.error('Failed to redeem reward')
    } finally {
      setRedeemingRewardId(null)
    }
  }

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recoverEmail.trim()) return

    setRecovering(true)
    try {
      await fetch('/api/member/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoverEmail }),
      })
      toast.success(t('recoverSuccess'))
      setShowRecover(false)
      setRecoverEmail('')
    } catch {
      toast.error('Failed to request code')
    } finally {
      setRecovering(false)
    }
  }

  const getVoucherStatusBadge = (status: VoucherItem['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">{t('statusActive')}</Badge>
      case 'USED':
        return <Badge variant="default">{t('statusUsed')}</Badge>
      case 'EXPIRED':
        return <Badge variant="error">{t('statusExpired')}</Badge>
    }
  }

  return (
    <>
      {/* Header */}
      <section className="relative py-16 bg-linear-to-b from-[#141414] to-[#0A0A0A]">
        <div className="container text-center max-w-2xl">
          <h1 className="font-cormorant text-4xl sm:text-5xl font-bold text-[#F5F5F0] mb-3">
            {t('title')}
          </h1>
          <p className="text-[#A0A09A] text-sm sm:text-base">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-py pt-8">
        <div className="container max-w-3xl">
          {!member ? (
            /* Lookup Form */
            <div className="bg-[#141414] border border-[#2A2A25] rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
              <h2 className="text-xl font-bold text-[#F5F5F0] flex items-center gap-2">
                <span>👑</span> {t('checkCardTitle')}
              </h2>

              <form onSubmit={handleLookup} className="space-y-4">
                <Input
                  label="Kode Member"
                  value={memberCodeInput}
                  onChange={(e) => setMemberCodeInput(e.target.value.toUpperCase())}
                  placeholder={t('codePlaceholder')}
                  required
                  className="uppercase font-mono tracking-wider"
                />

                <Input
                  label="Nomor WhatsApp"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder={t('phonePlaceholder')}
                  required
                />

                <Button type="submit" isLoading={loading} className="w-full">
                  {loading ? t('checking') : t('checkButton')}
                </Button>
              </form>

              <div className="pt-4 border-t border-[#2A2A25] text-center">
                <button
                  type="button"
                  onClick={() => setShowRecover(true)}
                  className="text-xs text-[#C9A84C] hover:text-[#E8C96A] underline font-medium"
                >
                  {t('forgotCode')}
                </button>
              </div>
            </div>
          ) : (
            /* Member Dashboard */
            <div className="space-y-8">
              {/* Profile & Points Hero Card */}
              <div className="bg-linear-to-br from-[#1C1C1C] via-[#141414] to-[#0A0A0A] border-2 border-[#C9A84C] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <span className="text-xs text-[#C9A84C] font-semibold tracking-widest uppercase">
                      PRESTIGE VIP MEMBER
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F0]">
                      {member.name}
                    </h2>
                    <p className="font-mono text-sm text-[#A0A09A] tracking-wider">
                      {member.memberCode} · {member.phone}
                    </p>
                  </div>

                  <div className="text-left sm:text-right bg-[#0A0A0A]/60 border border-[#2A2A25] rounded-xl p-4 sm:p-5">
                    <p className="text-xs text-[#A0A09A] uppercase tracking-wider">{t('pointsBalance')}</p>
                    <p className="font-cormorant text-4xl sm:text-5xl font-bold text-[#C9A84C]">
                      {points.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#2A2A25] flex flex-wrap items-center justify-between gap-4 text-xs text-[#808078]">
                  <p>{t('pointsInfo')}</p>
                  <button
                    onClick={() => {
                      setMember(null)
                      setMemberCodeInput('')
                      setPhoneInput('')
                    }}
                    className="text-[#C9A84C] hover:text-[#E8C96A] font-medium underline"
                  >
                    {t('logout')}
                  </button>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex gap-2 border-b border-[#2A2A25] pb-2">
                <button
                  onClick={() => setActiveTab('vouchers')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === 'vouchers'
                      ? 'bg-[#C9A84C] text-[#0A0A0A]'
                      : 'text-[#A0A09A] hover:text-[#F5F5F0]'
                  }`}
                >
                  🎟️ {t('tabVouchers')} ({vouchers.filter((v) => v.status === 'ACTIVE').length})
                </button>
                <button
                  onClick={() => setActiveTab('rewards')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === 'rewards'
                      ? 'bg-[#C9A84C] text-[#0A0A0A]'
                      : 'text-[#A0A09A] hover:text-[#F5F5F0]'
                  }`}
                >
                  🎁 {t('tabRewards')}
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === 'history'
                      ? 'bg-[#C9A84C] text-[#0A0A0A]'
                      : 'text-[#A0A09A] hover:text-[#F5F5F0]'
                  }`}
                >
                  📅 {t('tabHistory')}
                </button>
              </div>

              {/* Tab 1: Vouchers */}
              {activeTab === 'vouchers' && (
                <div className="space-y-4">
                  {vouchers.length === 0 ? (
                    <div className="bg-[#141414] border border-[#2A2A25] rounded-lg p-8 text-center text-[#808078]">
                      <p>{t('noVouchers')}</p>
                      <button
                        onClick={() => setActiveTab('rewards')}
                        className="mt-3 text-sm text-[#C9A84C] hover:underline"
                      >
                        Lihat Katalog Hadiah →
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {vouchers.map((v) => (
                        <div
                          key={v.id}
                          className={`bg-[#141414] border rounded-xl p-5 space-y-3 transition-all ${
                            v.status === 'ACTIVE'
                              ? 'border-[#C9A84C]/50 shadow-lg shadow-[#C9A84C]/5'
                              : 'border-[#2A2A25] opacity-60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-[#F5F5F0]">
                                {locale === 'id' ? v.nameId : v.nameEn}
                              </p>
                              <p className="text-xs text-[#808078]">
                                {t('expiresOn')}{' '}
                                {new Date(v.expiresAt).toLocaleDateString(
                                  locale === 'id' ? 'id-ID' : 'en-US',
                                  { day: 'numeric', month: 'short', year: 'numeric' }
                                )}
                              </p>
                            </div>
                            {getVoucherStatusBadge(v.status)}
                          </div>

                          <div className="bg-[#0A0A0A] border border-[#2A2A25] rounded-lg p-3 flex items-center justify-between">
                            <span className="text-xs text-[#808078]">Kode:</span>
                            <span className="font-mono font-bold text-lg text-[#C9A84C] tracking-widest select-all">
                              {v.code}
                            </span>
                          </div>

                          {v.status === 'ACTIVE' && (
                            <Link href={`/${locale}/booking`}>
                              <Button size="sm" variant="outline" className="w-full text-xs">
                                Gunakan Saat Booking →
                              </Button>
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Rewards Catalog */}
              {activeTab === 'rewards' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {rewards.map((reward) => {
                      const canAfford = points >= reward.pointsCost
                      const isRedeeming = redeemingRewardId === reward.id
                      return (
                        <div
                          key={reward.id}
                          className="bg-[#141414] border border-[#2A2A25] rounded-xl p-5 space-y-4 flex flex-col justify-between"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-[#C9A84C]">
                                {reward.pointsCost} POIN
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded bg-[#2A2A25] text-[#A0A09A]">
                                {reward.discountType === 'PERCENT'
                                  ? `Diskon ${reward.discountValue}%`
                                  : `Potongan ${formatPrice(reward.discountValue, locale)}`}
                              </span>
                            </div>
                            <h3 className="font-semibold text-[#F5F5F0] text-base">
                              {locale === 'id' ? reward.nameId : reward.nameEn}
                            </h3>
                          </div>

                          <Button
                            size="sm"
                            disabled={!canAfford || isRedeeming}
                            isLoading={isRedeeming}
                            onClick={() => handleRedeem(reward)}
                            className="w-full"
                          >
                            {canAfford ? t('redeemButton') : t('insufficientPoints')}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: History */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  {bookings.length === 0 ? (
                    <div className="bg-[#141414] border border-[#2A2A25] rounded-lg p-8 text-center text-[#808078]">
                      {t('noHistory')}
                    </div>
                  ) : (
                    bookings.map((b) => (
                      <div
                        key={b.id}
                        className="bg-[#141414] border border-[#2A2A25] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#F5F5F0]">
                              {locale === 'id' ? b.service.nameId : b.service.nameEn}
                            </span>
                            <Badge variant={b.status === 'COMPLETED' ? 'success' : 'default'}>
                              {b.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-[#808078]">
                            {new Date(b.bookingDate).toLocaleDateString(
                              locale === 'id' ? 'id-ID' : 'en-US',
                              { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
                            )}{' '}
                            · {b.timeSlot} · Kode: {b.bookingCode}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-sm font-semibold text-[#C9A84C]">
                            {formatPrice(b.service.price, locale)}
                          </p>
                          {b.status === 'COMPLETED' && (
                            <p className="text-xs text-green-400">
                              +{Math.floor(b.service.price / 1000)} Poin
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Recover Code Modal */}
      {showRecover && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1C1C1C] border border-[#2A2A25] rounded-xl p-6 max-w-md w-full space-y-4">
            <div>
              <h3 className="text-lg font-bold text-[#F5F5F0]">{t('recoverTitle')}</h3>
              <p className="text-xs text-[#A0A09A] mt-1">{t('recoverSubtitle')}</p>
            </div>

            <form onSubmit={handleRecover} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={recoverEmail}
                onChange={(e) => setRecoverEmail(e.target.value)}
                placeholder="nama@email.com"
                required
              />

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRecover(false)}
                >
                  {t('backToCheck')}
                </Button>
                <Button type="submit" isLoading={recovering}>
                  {t('recoverButton')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
