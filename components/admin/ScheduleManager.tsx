'use client'

import { useState } from 'react'
import type { Schedule } from '@prisma/client'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface ScheduleManagerProps {
  schedules: (Schedule & { dayName: string })[]
}

interface ScheduleFormItem {
  openTime: string
  closeTime: string
  isOpen: boolean
}

type ScheduleField = keyof ScheduleFormItem

export function ScheduleManager({ schedules }: ScheduleManagerProps) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, ScheduleFormItem>>({})
  const [loading, setLoading] = useState(false)

  const handleEdit = (schedule: Schedule & { dayName: string }) => {
    setEditingId(schedule.id)
    setFormData({
      [schedule.id]: {
        openTime: schedule.openTime,
        closeTime: schedule.closeTime,
        isOpen: schedule.isOpen,
      },
    })
  }

  const handleChange = (scheduleId: string, field: ScheduleField, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [scheduleId]: {
        ...prev[scheduleId],
        [field]: value,
      },
    }))
  }

  const handleSave = async (scheduleId: string, dayOfWeek: number) => {
    if (!formData[scheduleId]) return

    setLoading(true)

    try {
      const response = await fetch(`/api/schedule/${dayOfWeek}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData[scheduleId]),
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || 'Failed to update schedule')
        setLoading(false)
        return
      }

      toast.success('Schedule updated successfully')
      setEditingId(null)
      router.refresh()
    } catch {
      toast.error('An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="bg-[#2A2A25] border border-[#3A3A35] rounded-lg p-4">
        <p className="text-[#F5F5F0] text-sm">
          <strong>Time Format:</strong> Use 24-hour format (e.g., 09:00 for 9 AM, 21:00 for 9 PM)
        </p>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-3 md:hidden">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="rounded-lg border border-[#2A2A25] bg-[#141414] p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-[#808078]">Day</p>
                <p className="font-semibold text-[#F5F5F0]">{schedule.dayName}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                schedule.isOpen
                  ? 'bg-green-600/20 text-green-400'
                  : 'bg-red-600/20 text-red-400'
              }`}>
                {schedule.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>

            {editingId === schedule.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#C9A84C] mb-1">Open Time</label>
                    <input
                      type="time"
                      value={formData[schedule.id]?.openTime || ''}
                      onChange={(e) => handleChange(schedule.id, 'openTime', e.target.value)}
                      className="w-full min-h-11 px-3 py-2 bg-[#2A2A25] border border-[#3A3A35] rounded text-[#F5F5F0]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#C9A84C] mb-1">Close Time</label>
                    <input
                      type="time"
                      value={formData[schedule.id]?.closeTime || ''}
                      onChange={(e) => handleChange(schedule.id, 'closeTime', e.target.value)}
                      className="w-full min-h-11 px-3 py-2 bg-[#2A2A25] border border-[#3A3A35] rounded text-[#F5F5F0]"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-sm text-[#F5F5F0]">
                  <input
                    type="checkbox"
                    checked={formData[schedule.id]?.isOpen || false}
                    onChange={(e) => handleChange(schedule.id, 'isOpen', e.target.checked)}
                    className="rounded"
                  />
                  <span>Open</span>
                </label>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(schedule.id, schedule.dayOfWeek)}
                    disabled={loading}
                    className="flex-1 min-h-11 px-3 py-2 bg-[#C9A84C] text-[#0A0A0A] rounded text-sm font-semibold hover:bg-[#E8C96A] disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 min-h-11 px-3 py-2 bg-[#2A2A25] hover:bg-[#3A3A35] text-[#F5F5F0] rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[#808078]">Open Time</p>
                  <p className="text-[#F5F5F0]">{schedule.openTime}</p>
                </div>
                <div>
                  <p className="text-xs text-[#808078]">Close Time</p>
                  <p className="text-[#F5F5F0]">{schedule.closeTime}</p>
                </div>
              </div>
            )}

            {editingId !== schedule.id && (
              <button
                onClick={() => handleEdit(schedule)}
                className="w-full min-h-11 px-3 py-2 bg-[#2A2A25] hover:bg-[#3A3A35] text-[#F5F5F0] rounded text-sm"
              >
                Edit
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2A2A25]">
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Day</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Open Time</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Close Time</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Status</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.id} className="border-b border-[#2A2A25] hover:bg-[#2A2A25] transition-colors">
                <td className="px-4 py-3 text-[#F5F5F0] font-semibold">{schedule.dayName}</td>

                {editingId === schedule.id ? (
                  <>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        value={formData[schedule.id]?.openTime || ''}
                        onChange={(e) => handleChange(schedule.id, 'openTime', e.target.value)}
                        className="px-3 py-2 bg-[#2A2A25] border border-[#3A3A35] rounded text-[#F5F5F0]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        value={formData[schedule.id]?.closeTime || ''}
                        onChange={(e) => handleChange(schedule.id, 'closeTime', e.target.value)}
                        className="px-3 py-2 bg-[#2A2A25] border border-[#3A3A35] rounded text-[#F5F5F0]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData[schedule.id]?.isOpen || false}
                          onChange={(e) => handleChange(schedule.id, 'isOpen', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-[#F5F5F0] text-sm">Open</span>
                      </label>
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={() => handleSave(schedule.id, schedule.dayOfWeek)}
                        disabled={loading}
                        className="px-3 py-1 bg-[#C9A84C] text-[#0A0A0A] rounded text-sm font-semibold hover:bg-[#E8C96A] disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-[#2A2A25] hover:bg-[#3A3A35] text-[#F5F5F0] rounded text-sm"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-[#F5F5F0]">{schedule.openTime}</td>
                    <td className="px-4 py-3 text-[#F5F5F0]">{schedule.closeTime}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        schedule.isOpen
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-red-600/20 text-red-400'
                      }`}>
                        {schedule.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="px-3 py-1 bg-[#2A2A25] hover:bg-[#3A3A35] text-[#F5F5F0] rounded text-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
