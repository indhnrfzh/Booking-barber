'use client'

import { useState } from 'react'
import { renderReminderTemplate, normalizePhone } from '@/lib/member'
import toast from 'react-hot-toast'

export interface DueMember {
  id: string
  memberCode: string
  name: string
  phone: string
  email: string
  points: number
  lastBookingDate: string
  daysSinceLastVisit: number
  lastReminderAt: string | null
}

interface ReminderListProps {
  initialMembers: DueMember[]
  template: string
  bookingLink: string
  intervalDays: number
}

export function ReminderList({
  initialMembers,
  template,
  bookingLink,
  intervalDays,
}: ReminderListProps) {
  const [members, setMembers] = useState<DueMember[]>(initialMembers)
  const [activeTemplate, setActiveTemplate] = useState(template)
  const [editingTemplate, setEditingTemplate] = useState(false)
  const [sendingBotId, setSendingBotId] = useState<string | null>(null)
  const [sendingAll, setSendingAll] = useState(false)

  const handleSendReminder = async (member: DueMember) => {
    // Generate WA URL for manual click
    const cleanPhone = normalizePhone(member.phone)
    const text = renderReminderTemplate(activeTemplate, {
      name: member.name,
      points: member.points,
      link: bookingLink,
      memberCode: member.memberCode,
    })

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
    window.open(waUrl, '_blank')

    // Optimistically record that reminder was sent
    try {
      await fetch(`/api/members/${member.id}/reminded`, { method: 'POST' })
      toast.success(`Reminder manual dibuka untuk ${member.name}`)
      setMembers((prev) => prev.filter((m) => m.id !== member.id))
    } catch {
      // ignore
    }
  }

  const handleSendBotReminder = async (member: DueMember) => {
    setSendingBotId(member.id)
    try {
      const res = await fetch(`/api/members/${member.id}/send-bot-reminder`, {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Gagal mengirim pesan bot. Pastikan WA_API_TOKEN telah diset.')
        return
      }

      toast.success(`🤖 Pesan pengingat bot terkirim ke ${member.name}!`)
      setMembers((prev) => prev.filter((m) => m.id !== member.id))
    } catch {
      toast.error('Gagal menghubungi server pengingat bot.')
    } finally {
      setSendingBotId(null)
    }
  }

  const handleSendAllBot = async () => {
    if (!confirm(`Kirim pesan pengingat bot otomatis ke semua ${members.length} member ini?`)) {
      return
    }

    setSendingAll(true)
    let successCount = 0
    let failedCount = 0

    for (const member of members) {
      try {
        const res = await fetch(`/api/members/${member.id}/send-bot-reminder`, {
          method: 'POST',
        })
        if (res.ok) {
          successCount++
          setMembers((prev) => prev.filter((m) => m.id !== member.id))
        } else {
          failedCount++
        }
      } catch {
        failedCount++
      }
    }

    setSendingAll(false)
    if (successCount > 0) {
      toast.success(`Berhasil mengirim ${successCount} pesan pengingat via Bot!`)
    }
    if (failedCount > 0) {
      toast.error(`${failedCount} pesan gagal dikirim. Periksa kuota / token API WhatsApp.`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Template Preview / Quick Editor */}
      <div className="bg-[#2A2A25] border border-[#3A3A35] rounded-lg p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#C9A84C] uppercase tracking-wider">
            WhatsApp Message Template
          </h2>
          <button
            onClick={() => setEditingTemplate(!editingTemplate)}
            className="text-xs text-[#C9A84C] hover:text-[#E8C96A] underline"
          >
            {editingTemplate ? 'Close Editor' : 'Edit Template'}
          </button>
        </div>

        {editingTemplate ? (
          <div className="space-y-2">
            <textarea
              rows={3}
              value={activeTemplate}
              onChange={(e) => setActiveTemplate(e.target.value)}
              className="w-full bg-[#1C1C1C] border border-[#3A3A35] rounded-md p-3 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#C9A84C]"
            />
            <p className="text-xs text-[#808078]">
              Available placeholders: &#123;name&#125;, &#123;points&#125;, &#123;link&#125;, &#123;memberCode&#125;
            </p>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-[#A0A09A] bg-[#1C1C1C] p-3 rounded border border-[#3A3A35] italic">
            &quot;{activeTemplate}&quot;
          </p>
        )}
      </div>

      {/* Due Members List */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <p className="text-sm text-[#808078]">
            Showing members with last completed visit &ge; {intervalDays} days ago
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#C9A84C]/10 text-[#C9A84C] px-3 py-1 rounded-full border border-[#C9A84C]/30 font-semibold">
              {members.length} Due for Reminder
            </span>
            {members.length > 0 && (
              <button
                onClick={handleSendAllBot}
                disabled={sendingAll}
                className="text-xs px-3 py-1 bg-[#C9A84C] text-[#0A0A0A] font-semibold rounded-md hover:bg-[#E8C96A] disabled:opacity-50 transition-colors"
              >
                {sendingAll ? 'Mengirim Semua...' : '🤖 Kirim Semua via Bot'}
              </button>
            )}
          </div>
        </div>

        {members.length === 0 ? (
          <div className="bg-[#141414] border border-[#2A2A25] rounded-lg p-8 text-center text-[#808078]">
            🎉 No members due for a reminder right now. All caught up!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-[#141414] border border-[#2A2A25] rounded-xl p-5 space-y-4 flex flex-col justify-between hover:border-[#C9A84C]/50 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs text-[#C9A84C] font-semibold">
                        {member.memberCode}
                      </span>
                      <h3 className="text-lg font-bold text-[#F5F5F0]">{member.name}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#808078]">Points</span>
                      <p className="font-bold text-base text-[#C9A84C]">{member.points}</p>
                    </div>
                  </div>

                  <div className="text-xs text-[#A0A09A] space-y-1">
                    <p>📱 {member.phone}</p>
                    <p>
                      🗓️ Last visit:{' '}
                      <span className="text-[#F5F5F0] font-medium">
                        {new Date(member.lastBookingDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>{' '}
                      ({member.daysSinceLastVisit} days ago)
                    </p>
                    {member.lastReminderAt && (
                      <p className="text-[#808078]">
                        Last reminded:{' '}
                        {new Date(member.lastReminderAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSendBotReminder(member)}
                    disabled={sendingBotId === member.id || sendingAll}
                    className="py-2.5 px-3 bg-[#C9A84C] hover:bg-[#E8C96A] text-[#0A0A0A] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors text-xs shadow-md disabled:opacity-50"
                  >
                    <span>🤖</span> {sendingBotId === member.id ? 'Mengirim...' : 'Kirim via Bot'}
                  </button>
                  <button
                    onClick={() => handleSendReminder(member)}
                    className="py-2.5 px-3 bg-[#2A2A25] hover:bg-[#3A3A35] text-[#F5F5F0] border border-[#3A3A35] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors text-xs shadow-md"
                  >
                    <span>💬</span> Buka WA Manual
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
