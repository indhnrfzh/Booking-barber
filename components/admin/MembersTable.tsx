'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'

interface MemberItem {
  id: string
  memberCode: string
  name: string
  phone: string
  email: string
  waOptIn: boolean
  lastReminderAt: string | null
  points: number
  totalBookings: number
  totalVouchers: number
  lastBooking: {
    bookingDate: string
    status: string
  } | null
  createdAt: string
}

interface MembersTableProps {
  initialMembers: MemberItem[]
}

export function MembersTable({ initialMembers }: MembersTableProps) {
  const [members, setMembers] = useState<MemberItem[]>(initialMembers)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/members?q=${encodeURIComponent(searchTerm)}`)
      const data = await res.json()
      if (res.ok && data.members) {
        setMembers(data.members)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search by code, name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-h-12 px-4 py-3 bg-[#2A2A25] border border-[#3A3A35] rounded-md text-[#F5F5F0] placeholder-[#808078]"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-[#C9A84C] text-[#0A0A0A] font-semibold rounded-md hover:bg-[#E8C96A] transition-colors"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Mobile Cards */}
      <div className="grid gap-3 md:hidden">
        {members.length === 0 ? (
          <div className="rounded-lg border border-[#2A2A25] bg-[#141414] p-4 text-center text-[#808078]">
            No members found.
          </div>
        ) : (
          members.map((m) => (
            <div key={m.id} className="rounded-lg border border-[#2A2A25] bg-[#141414] p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono font-bold text-sm text-[#C9A84C]">{m.memberCode}</p>
                  <p className="font-semibold text-base text-[#F5F5F0]">{m.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#808078]">Points</p>
                  <p className="font-bold text-lg text-[#C9A84C]">{m.points}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-[#A0A09A]">
                <div>
                  <span className="text-[#808078]">Phone:</span> {m.phone}
                </div>
                <div>
                  <span className="text-[#808078]">Email:</span> {m.email}
                </div>
                <div>
                  <span className="text-[#808078]">Bookings:</span> {m.totalBookings}
                </div>
                <div>
                  <span className="text-[#808078]">WA Opt-in:</span>{' '}
                  <Badge variant={m.waOptIn ? 'success' : 'default'} className="text-[10px]">
                    {m.waOptIn ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              {m.lastBooking && (
                <div className="pt-2 border-t border-[#2A2A25] text-xs text-[#808078]">
                  Last visit:{' '}
                  <span className="text-[#F5F5F0]">
                    {new Date(m.lastBooking.bookingDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>{' '}
                  ({m.lastBooking.status})
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A25]">
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Member Code</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Name & Contact</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Points</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Bookings</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">WA Reminder</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Last Visit</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-[#808078]">
                  No members found.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr key={m.id} className="border-b border-[#2A2A25] hover:bg-[#2A2A25] transition-colors">
                  <td className="px-4 py-3 font-mono text-[#C9A84C] font-semibold">{m.memberCode}</td>
                  <td className="px-4 py-3">
                    <div className="text-[#F5F5F0] font-medium">{m.name}</div>
                    <div className="text-xs text-[#808078]">
                      {m.phone} · {m.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-base text-[#C9A84C]">{m.points}</td>
                  <td className="px-4 py-3 text-[#F5F5F0]">{m.totalBookings}</td>
                  <td className="px-4 py-3">
                    <Badge variant={m.waOptIn ? 'success' : 'default'}>
                      {m.waOptIn ? 'Opted In' : 'No'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[#F5F5F0]">
                    {m.lastBooking ? (
                      <div>
                        {new Date(m.lastBooking.bookingDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        <span className="text-xs text-[#808078] ml-1">({m.lastBooking.status})</span>
                      </div>
                    ) : (
                      <span className="text-[#808078]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#808078] text-xs">
                    {new Date(m.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
