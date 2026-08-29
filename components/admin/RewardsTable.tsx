'use client'

import { useState } from 'react'
import { Reward } from '@prisma/client'
import { RewardForm } from './RewardForm'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

interface RewardsTableProps {
  rewards: Reward[]
}

export function RewardsTable({ rewards }: RewardsTableProps) {
  const router = useRouter()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)

  const handleDelete = async (rewardId: string) => {
    if (!confirm('Are you sure you want to delete this reward?')) {
      return
    }

    try {
      const response = await fetch(`/api/rewards/${rewardId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete reward')
        return
      }

      toast.success('Reward deleted successfully')
      router.refresh()
    } catch {
      toast.error('An error occurred')
    }
  }

  const handleOpenForm = (reward?: Reward) => {
    if (reward) {
      setEditingReward(reward)
    } else {
      setEditingReward(null)
    }
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingReward(null)
  }

  return (
    <div className="space-y-4">
      {/* Add Reward Button */}
      <div className="mb-6">
        <Button
          onClick={() => handleOpenForm()}
          className="w-full sm:w-auto bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#E8C96A]"
        >
          + Add Reward
        </Button>
      </div>

      {/* Reward Form Modal */}
      {isFormOpen && (
        <RewardForm
          reward={editingReward}
          onClose={handleCloseForm}
          onSuccess={() => {
            handleCloseForm()
            router.refresh()
          }}
        />
      )}

      {/* Mobile Cards */}
      <div className="grid gap-3 md:hidden">
        {rewards.length === 0 ? (
          <div className="rounded-lg border border-[#2A2A25] bg-[#141414] p-4 text-center text-[#808078]">
            No loyalty rewards found.
          </div>
        ) : (
          rewards.map((reward) => (
            <div key={reward.id} className="rounded-lg border border-[#2A2A25] bg-[#141414] p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[#F5F5F0] truncate">{reward.nameId}</p>
                  <p className="text-sm text-[#A0A09A] truncate">{reward.nameEn}</p>
                </div>
                <Badge variant={reward.isActive ? 'success' : 'error'}>
                  {reward.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[#808078]">Points Cost</p>
                  <p className="text-[#C9A84C] font-bold">{reward.pointsCost} Pts</p>
                </div>
                <div>
                  <p className="text-xs text-[#808078]">Discount</p>
                  <p className="text-[#F5F5F0]">
                    {reward.discountType === 'PERCENT'
                      ? `${reward.discountValue}%`
                      : formatPrice(reward.discountValue)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#2A2A25]">
                <button
                  onClick={() => handleOpenForm(reward)}
                  className="flex-1 min-h-11 px-3 py-2 bg-[#2A2A25] hover:bg-[#3A3A35] text-[#F5F5F0] rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(reward.id)}
                  className="flex-1 min-h-11 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-sm"
                >
                  Delete
                </button>
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
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Name (ID)</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Name (EN)</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Points Cost</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Discount</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Status</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rewards.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-[#808078]">
                  No loyalty rewards found.
                </td>
              </tr>
            ) : (
              rewards.map((reward) => (
                <tr key={reward.id} className="border-b border-[#2A2A25] hover:bg-[#2A2A25] transition-colors">
                  <td className="px-4 py-3 text-[#F5F5F0]">{reward.nameId}</td>
                  <td className="px-4 py-3 text-[#F5F5F0]">{reward.nameEn}</td>
                  <td className="px-4 py-3 font-bold text-[#C9A84C]">{reward.pointsCost} Pts</td>
                  <td className="px-4 py-3 text-[#F5F5F0]">
                    {reward.discountType === 'PERCENT'
                      ? `${reward.discountValue}%`
                      : formatPrice(reward.discountValue)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={reward.isActive ? 'success' : 'error'}>
                      {reward.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => handleOpenForm(reward)}
                      className="px-3 py-1 bg-[#2A2A25] hover:bg-[#3A3A35] text-[#F5F5F0] rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(reward.id)}
                      className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-sm"
                    >
                      Delete
                    </button>
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
