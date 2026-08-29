'use client'

import { useState } from 'react'
import { Reward } from '@prisma/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface RewardFormProps {
  reward?: Reward | null
  onClose: () => void
  onSuccess: () => void
}

export function RewardForm({ reward, onClose, onSuccess }: RewardFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nameId: reward?.nameId || '',
    nameEn: reward?.nameEn || '',
    pointsCost: reward?.pointsCost || 100,
    discountType: reward?.discountType || 'PERCENT',
    discountValue: reward?.discountValue || 10,
    isActive: reward?.isActive ?? true,
    order: reward?.order || 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = reward ? `/api/rewards/${reward.id}` : '/api/rewards'
      const method = reward ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to save reward')
        setLoading(false)
        return
      }

      toast.success(reward ? 'Reward updated successfully' : 'Reward created successfully')
      onSuccess()
      router.refresh()
    } catch {
      toast.error('An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-[#1C1C1C] border border-[#2A2A25] rounded-t-2xl sm:rounded-lg p-4 sm:p-6 max-w-lg w-full max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 sm:static sm:mx-0 sm:mt-0 sm:mb-6 bg-[#1C1C1C] pt-4 sm:pt-0 pb-3 sm:pb-0 border-b border-[#2A2A25] sm:border-0">
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F0]">
            {reward ? 'Edit Reward' : 'Add New Reward'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name (Indonesian)"
            value={formData.nameId}
            onChange={(e) => setFormData({ ...formData, nameId: e.target.value })}
            placeholder="Diskon 10% Semua Layanan"
            required
          />

          <Input
            label="Name (English)"
            value={formData.nameEn}
            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
            placeholder="10% Discount All Services"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Points Cost"
              type="number"
              value={formData.pointsCost}
              onChange={(e) => setFormData({ ...formData, pointsCost: parseInt(e.target.value) || 0 })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-[#F5F5F0] mb-2">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountType: e.target.value as 'PERCENT' | 'FIXED',
                  })
                }
                className="w-full min-h-12 px-3 py-2 bg-[#2A2A25] border border-[#3A3A35] rounded-lg text-[#F5F5F0]"
              >
                <option value="PERCENT">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (IDR)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={formData.discountType === 'PERCENT' ? 'Discount Value (%)' : 'Discount Value (IDR)'}
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) || 0 })}
              required
            />

            <Input
              label="Order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="rewardIsActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded accent-[#C9A84C]"
            />
            <label htmlFor="rewardIsActive" className="text-[#F5F5F0] text-sm">
              Active in member catalog
            </label>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-[#2A2A25]">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Saving...' : reward ? 'Update Reward' : 'Create Reward'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
