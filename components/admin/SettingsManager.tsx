'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface Setting {
  valueId: string
  valueEn: string
}

interface SettingsManagerProps {
  initialSettings: Record<string, Setting>
}

const SETTING_META: Record<string, { label: string; group: string; multiline?: boolean }> = {
  phone: { label: 'Phone Number', group: 'Contact' },
  email: { label: 'Email Address', group: 'Contact' },
  address: { label: 'Address', group: 'Contact', multiline: true },
  footer_about: { label: 'Footer About Text', group: 'Footer', multiline: true },
  footer_copyright: { label: 'Copyright Text', group: 'Footer' },
  stat1_value: { label: 'Stat 1 — Value (e.g. 500+)', group: 'About Stats' },
  stat1_label: { label: 'Stat 1 — Label', group: 'About Stats' },
  stat2_value: { label: 'Stat 2 — Value (e.g. 10+)', group: 'About Stats' },
  stat2_label: { label: 'Stat 2 — Label', group: 'About Stats' },
  stat3_value: { label: 'Stat 3 — Value (e.g. 5★)', group: 'About Stats' },
  stat3_label: { label: 'Stat 3 — Label', group: 'About Stats' },
}

const GROUPS = ['Contact', 'About Stats', 'Footer']

export function SettingsManager({ initialSettings }: SettingsManagerProps) {
  const [saved, setSaved] = useState<Record<string, Setting>>(initialSettings)
  const [editing, setEditing] = useState<Record<string, Setting>>(
    JSON.parse(JSON.stringify(initialSettings))
  )
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  async function saveSetting(key: string) {
    const current = editing[key]
    if (!current) return
    setSaving((prev) => ({ ...prev, [key]: true }))
    try {
      const res = await fetch(`/api/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valueId: current.valueId, valueEn: current.valueEn }),
      })
      if (!res.ok) throw new Error('Failed')
      setSaved((prev) => ({ ...prev, [key]: { ...current } }))
      toast.success('Setting saved')
    } catch {
      toast.error('Failed to save setting')
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }))
    }
  }

  function hasChanged(key: string) {
    const orig = saved[key]
    const curr = editing[key]
    if (!orig || !curr) return false
    return orig.valueId !== curr.valueId || orig.valueEn !== curr.valueEn
  }

  return (
    <div className="space-y-8">
      {GROUPS.map((group) => {
        const keysInGroup = Object.keys(SETTING_META).filter(
          (k) => SETTING_META[k].group === group
        )
        return (
          <div key={group} className="bg-[#1C1C1C] border border-[#2A2A25] rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-[#C9A84C] mb-6 pb-3 border-b border-[#2A2A25]">
              {group}
            </h2>
            <div className="space-y-6">
              {keysInGroup.map((key) => {
                const meta = SETTING_META[key]
                const curr = editing[key]
                const isSaving = saving[key] ?? false
                const changed = hasChanged(key)

                if (!curr) return null

                return (
                  <div key={key} className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-sm font-medium text-[#F5F5F0]">{meta.label}</label>
                      {changed && (
                        <button
                          onClick={() => saveSetting(key)}
                          disabled={isSaving}
                          className="shrink-0 px-4 py-1.5 text-xs font-semibold bg-[#C9A84C] text-[#0A0A0A] rounded-md hover:bg-[#E8C96A] disabled:opacity-50 transition-colors"
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-[#5A5A55] mb-1.5 uppercase tracking-wider">
                          Indonesian (ID)
                        </p>
                        {meta.multiline ? (
                          <textarea
                            rows={3}
                            value={curr.valueId}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [key]: { ...prev[key], valueId: e.target.value },
                              }))
                            }
                            className="w-full bg-[#0A0A0A] border border-[#2A2A25] rounded-md px-3 py-2 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#C9A84C] resize-none"
                          />
                        ) : (
                          <input
                            type="text"
                            value={curr.valueId}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [key]: { ...prev[key], valueId: e.target.value },
                              }))
                            }
                            className="w-full bg-[#0A0A0A] border border-[#2A2A25] rounded-md px-3 py-2 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#C9A84C]"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-[#5A5A55] mb-1.5 uppercase tracking-wider">
                          English (EN)
                        </p>
                        {meta.multiline ? (
                          <textarea
                            rows={3}
                            value={curr.valueEn}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [key]: { ...prev[key], valueEn: e.target.value },
                              }))
                            }
                            className="w-full bg-[#0A0A0A] border border-[#2A2A25] rounded-md px-3 py-2 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#C9A84C] resize-none"
                          />
                        ) : (
                          <input
                            type="text"
                            value={curr.valueEn}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [key]: { ...prev[key], valueEn: e.target.value },
                              }))
                            }
                            className="w-full bg-[#0A0A0A] border border-[#2A2A25] rounded-md px-3 py-2 text-sm text-[#F5F5F0] focus:outline-none focus:border-[#C9A84C]"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
