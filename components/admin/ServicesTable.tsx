'use client'

import { useState } from 'react'
import type { Service } from '@prisma/client'
import { ServiceForm } from './ServiceForm'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

interface ServicesTableProps {
  services: Service[]
}

export function ServicesTable({ services }: ServicesTableProps) {
  const router = useRouter()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? All related bookings will also be deleted.')) {
      return
    }

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete service')
        return
      }

      toast.success('Service deleted successfully')
      router.refresh()
    } catch {
      toast.error('An error occurred')
    }
  }

  const handleOpenForm = (service?: Service) => {
    if (service) {
      setEditingService(service)
    } else {
      setEditingService(null)
    }
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingService(null)
  }

  return (
    <div className="space-y-4">
      {/* Add Service Button */}
      <div className="mb-6">
        <Button
          onClick={() => handleOpenForm()}
          className="w-full sm:w-auto bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#E8C96A]"
        >
          + Add Service
        </Button>
      </div>

      {/* Service Form Modal */}
      {isFormOpen && (
        <ServiceForm
          service={editingService}
          onClose={handleCloseForm}
          onSuccess={() => {
            handleCloseForm()
            router.refresh()
          }}
        />
      )}

      {/* Mobile Cards */}
      <div className="grid gap-3 md:hidden">
        {services.length === 0 ? (
          <div className="rounded-lg border border-[#2A2A25] bg-[#141414] p-4 text-center text-[#808078]">
            No services found. Click &quot;Add Service&quot; to create one.
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="rounded-lg border border-[#2A2A25] bg-[#141414] p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[#808078]">Name (ID)</p>
                  <p className="font-semibold text-[#F5F5F0] truncate">{service.nameId}</p>
                  <p className="text-sm text-[#A0A09A] truncate">{service.nameEn}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold shrink-0 ${
                  service.isActive
                    ? 'bg-green-600/20 text-green-400'
                    : 'bg-red-600/20 text-red-400'
                }`}>
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[#808078]">Price</p>
                  <p className="text-[#F5F5F0] font-semibold">{formatPrice(service.price)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#808078]">Duration</p>
                  <p className="text-[#F5F5F0]">{service.duration} min</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#2A2A25]">
                <button
                  onClick={() => handleOpenForm(service)}
                  className="flex-1 min-h-11 px-3 py-2 bg-[#2A2A25] hover:bg-[#3A3A35] text-[#F5F5F0] rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
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
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Price</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Duration</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Status</th>
              <th className="text-left px-4 py-3 text-[#C9A84C] font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-[#808078]">
                  No services found. Click &quot;Add Service&quot; to create one.
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service.id} className="border-b border-[#2A2A25] hover:bg-[#2A2A25] transition-colors">
                  <td className="px-4 py-3 text-[#F5F5F0]">{service.nameId}</td>
                  <td className="px-4 py-3 text-[#F5F5F0]">{service.nameEn}</td>
                  <td className="px-4 py-3 text-[#F5F5F0] font-semibold">{formatPrice(service.price)}</td>
                  <td className="px-4 py-3 text-[#F5F5F0]">{service.duration} min</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      service.isActive
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-red-600/20 text-red-400'
                    }`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => handleOpenForm(service)}
                      className="px-3 py-1 bg-[#2A2A25] hover:bg-[#3A3A35] text-[#F5F5F0] rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
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
