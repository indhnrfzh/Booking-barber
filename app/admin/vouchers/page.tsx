'use client'

import { useState } from 'react'
import { AdminNavbar } from '@/components/admin/Navbar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface VoucherDetail {
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
  member: {
    memberCode: string
    name: string
    phone: string
    email: string
  }
}

export default function AdminVouchersPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [voucher, setVoucher] = useState<VoucherDetail | null>(null)
  const [marking, setMarking] = useState(false)

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    setVoucher(null)
    try {
      const res = await fetch(`/api/vouchers/${encodeURIComponent(code.trim().toUpperCase())}`)
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Voucher not found')
        return
      }

      setVoucher(data.voucher)
    } catch {
      toast.error('Failed to lookup voucher')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkUsed = async () => {
    if (!voucher) return
    setMarking(true)

    try {
      const res = await fetch(`/api/vouchers/${voucher.code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'USED' }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to update voucher')
        return
      }

      toast.success('Voucher marked as USED successfully')
      setVoucher((prev) => (prev ? { ...prev, status: 'USED', usedAt: new Date().toISOString() } : null))
    } catch {
      toast.error('An error occurred')
    } finally {
      setMarking(false)
    }
  }

  const getStatusBadge = (status: VoucherDetail['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">ACTIVE</Badge>
      case 'USED':
        return <Badge variant="default">USED</Badge>
      case 'EXPIRED':
        return <Badge variant="error">EXPIRED</Badge>
    }
  }

  return (
    <>
      <AdminNavbar admin={{ id: 'current', username: 'admin', role: 'admin' }} />
      <main className="pt-20 sm:pt-24 px-3 sm:px-4 md:px-8 container mx-auto space-y-6 sm:space-y-8 pb-8 max-w-2xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F0]">Voucher Checker</h1>
          <p className="text-sm sm:text-base text-[#808078] mt-1">
            Lookup and redeem customer discount vouchers for walk-in visits
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-[#1C1C1C] border border-[#2A2A25] rounded-lg p-5 sm:p-6 space-y-4">
          <form onSubmit={handleLookup} className="space-y-4">
            <Input
              label="Voucher Code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VCR-XXXXXX"
              className="uppercase font-mono text-lg tracking-wider"
              required
            />
            <Button type="submit" isLoading={loading} className="w-full">
              {loading ? 'Checking...' : 'Check Voucher'}
            </Button>
          </form>
        </div>

        {/* Voucher Result Card */}
        {voucher && (
          <div className="bg-[#141414] border-2 border-[#C9A84C] rounded-xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#808078]">Reward</p>
                <h2 className="text-xl font-bold text-[#F5F5F0]">{voucher.nameId}</h2>
                <p className="text-xs text-[#A0A09A]">{voucher.nameEn}</p>
              </div>
              {getStatusBadge(voucher.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-[#0A0A0A] border border-[#2A2A25] rounded-lg p-4">
              <div>
                <p className="text-xs text-[#808078]">Discount Value</p>
                <p className="text-lg font-bold text-[#C9A84C]">
                  {voucher.discountType === 'PERCENT'
                    ? `${voucher.discountValue}%`
                    : formatPrice(voucher.discountValue)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#808078]">Expires On</p>
                <p className="text-[#F5F5F0]">
                  {new Date(voucher.expiresAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="border-t border-[#2A2A25] pt-4 text-sm space-y-1">
              <p className="text-xs text-[#808078]">Member Info</p>
              <p className="font-semibold text-[#F5F5F0]">{voucher.member.name}</p>
              <p className="text-xs text-[#A0A09A]">
                {voucher.member.memberCode} · {voucher.member.phone}
              </p>
            </div>

            {voucher.status === 'ACTIVE' && (
              <div className="pt-2">
                <Button
                  onClick={handleMarkUsed}
                  isLoading={marking}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-base"
                >
                  ✓ Tandai Terpakai (Mark as Used)
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  )
}
