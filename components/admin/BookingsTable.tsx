'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Booking } from '@prisma/client'
import { BookingStatusForm } from './BookingStatusForm'
import { Badge } from '@/components/ui/Badge'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

interface BookingsTableProps {
  bookings: (Booking & {
    service: {
      nameId: string
      nameEn: string
      price: number
    }
  })[]
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const [filteredBookings, setFilteredBookings] = useState(bookings)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const handleFilter = (status: string) => {
    setStatusFilter(status)
    applyFilters(status, searchTerm)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    applyFilters(statusFilter, term)
  }

  const applyFilters = useCallback((status: string, search: string) => {
    let filtered = bookings

    if (status !== 'all') {
      filtered = filtered.filter((b) => b.status === status)
    }

    if (search) {
      filtered = filtered.filter(
        (b) =>
          b.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
          b.customerName.toLowerCase().includes(search.toLowerCase()) ||
          b.customerPhone.includes(search)
      )
    }

    setFilteredBookings(filtered)
  }, [bookings])

  useEffect(() => {
    applyFilters(statusFilter, searchTerm)
  }, [applyFilters, searchTerm, statusFilter])

  const getStatusColor = (status: string): BadgeVariant => {
    switch (status) {
      case 'PENDING':
        return 'warning'
      case 'CONFIRMED':
        return 'success'
      case 'COMPLETED':
        return 'default'
      case 'CANCELLED':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
        <input
          type="text"
          placeholder="Search by code, name, or phone..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 min-h-12 px-4 py-3 bg-[#2A2A25] border border-[#3A3A35] rounded-md text-[#F5F5F0] placeholder-[#808078]"
        />
        <div className="flex gap-2 flex-wrap">
          {(['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleFilter(status)}
              className={`min-h-11 px-4 py-2 rounded-md transition-colors text-sm ${
                statusFilter === status
                  ? 'bg-[#C9A84C] text-[#0A0A0A]'
                  : 'bg-[#2A2A25] text-[#F5F5F0] hover:bg-[#3A3A35]'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-3 md:hidden">
        {filteredBookings.length === 0 ? (
          <div className="rounded-lg border border-[#2A2A25] bg-[#141414] p-4 text-center text-[#808078]">
            No bookings found
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="rounded-lg border border-[#2A2A25] bg-[#141414] p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-[#808078]">Booking Code</p>
                  <p className="font-mono text-sm text-[#F5F5F0]">{booking.bookingCode}</p>
                </div>
                <Badge variant={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[#808078]">Customer</p>
                  <p className="text-[#F5F5F0]">{booking.customerName}</p>
                  <p className="text-xs text-[#808078] break-all">{booking.customerPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-[#808078]">Service</p>
                  <p className="text-[#F5F5F0]">{booking.service.nameId}</p>
                </div>
                <div>
                  <p className="text-xs text-[#808078]">Date</p>
                  <p className="text-[#F5F5F0]">
                    {new Date(booking.bookingDate).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#808078]">Time</p>
                  <p className="text-[#F5F5F0]">{booking.timeSlot}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#2A2A25]">
                <BookingStatusForm bookingId={booking.id} currentStatus={booking.status} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A25]">
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Booking Code</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Customer</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Service</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Date</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Time</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Status</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-[#808078]">
                  No bookings found
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-[#2A2A25] hover:bg-[#2A2A25] transition-colors">
                  <td className="px-4 py-3 text-[#F5F5F0] font-mono">{booking.bookingCode}</td>
                  <td className="px-4 py-3">
                    <div className="text-[#F5F5F0]">{booking.customerName}</div>
                    <div className="text-xs text-[#808078]">{booking.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3 text-[#F5F5F0]">{booking.service.nameId}</td>
                  <td className="px-4 py-3 text-[#F5F5F0]">
                    {new Date(booking.bookingDate).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-[#F5F5F0]">{booking.timeSlot}</td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <BookingStatusForm bookingId={booking.id} currentStatus={booking.status} />
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
