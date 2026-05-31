'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface BookingStatusFormProps {
  bookingId: string
  currentStatus: string
}

export function BookingStatusForm({ bookingId, currentStatus }: BookingStatusFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)

  const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || 'Failed to update status')
        setLoading(false)
        setSelectedStatus(currentStatus)
        return
      }

      toast.success('Status updated successfully')
      router.refresh()
    } catch {
      toast.error('An error occurred')
      setLoading(false)
      setSelectedStatus(currentStatus)
    }
  }

  const handleSelectChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = event.target.value
    setSelectedStatus(nextStatus)
    await handleStatusChange(nextStatus)
    setLoading(false)
  }

  return (
    <label className="block w-full">
      <span className="sr-only">Change booking status</span>
      <select
        value={selectedStatus}
        onChange={handleSelectChange}
        disabled={loading}
        className="w-full min-h-11 rounded-md border border-[#3A3A35] bg-[#2A2A25] px-3 py-2.5 text-sm text-[#F5F5F0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:ring-offset-2 focus:ring-offset-[#1C1C1C] disabled:opacity-60"
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </label>
  )
}
