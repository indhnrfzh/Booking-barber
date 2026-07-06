'use client'

import { useState } from 'react'
import type { Service } from '@prisma/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface ServiceFormProps {
  service?: Service | null
  onClose: () => void
  onSuccess: () => void
}

export function ServiceForm({ service, onClose, onSuccess }: ServiceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageMode, setImageMode] = useState<'url' | 'upload'>(
    service?.imageUrl?.startsWith('data:') ? 'upload' : 'url'
  )
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nameId: service?.nameId || '',
    nameEn: service?.nameEn || '',
    descId: service?.descId || '',
    descEn: service?.descEn || '',
    price: service?.price || 0,
    duration: service?.duration || 30,
    imageUrl: service?.imageUrl || '',
    isActive: service?.isActive ?? true,
    order: service?.order || 0,
  })

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      event.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const result = reader.result

      if (typeof result === 'string') {
        setFormData((current) => ({
          ...current,
          imageUrl: result,
        }))
        setImageMode('upload')
        setSelectedFileName(file.name)
      }
    }

    reader.onerror = () => {
      toast.error('Failed to read image file')
    }

    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = service
        ? `/api/services/${service.id}`
        : '/api/services'
      
      const method = service ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to save service')
        setLoading(false)
        return
      }

      toast.success(service ? 'Service updated successfully' : 'Service created successfully')
      onSuccess()
      router.refresh()
    } catch {
      toast.error('An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-[#1C1C1C] border border-[#2A2A25] rounded-t-2xl sm:rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 sm:static sm:mx-0 sm:mt-0 sm:mb-6 bg-[#1C1C1C] pt-4 sm:pt-0 pb-3 sm:pb-0 border-b border-[#2A2A25] sm:border-0">
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F0]">
            {service ? 'Edit Service' : 'Add New Service'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name (Indonesian)"
              value={formData.nameId}
              onChange={(e) => setFormData({ ...formData, nameId: e.target.value })}
              required
            />
            <Input
              label="Name (English)"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#C9A84C] mb-2">Description (Indonesian)</label>
              <textarea
                value={formData.descId}
                onChange={(e) => setFormData({ ...formData, descId: e.target.value })}
                className="w-full px-3 py-2 bg-[#2A2A25] border border-[#3A3A35] rounded text-[#F5F5F0] placeholder-[#808078]"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-[#C9A84C] mb-2">Description (English)</label>
              <textarea
                value={formData.descEn}
                onChange={(e) => setFormData({ ...formData, descEn: e.target.value })}
                className="w-full px-3 py-2 bg-[#2A2A25] border border-[#3A3A35] rounded text-[#F5F5F0] placeholder-[#808078]"
                rows={3}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Price (IDR)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
              required
            />
            <Input
              label="Duration (minutes)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              required
            />
            <Input
              label="Order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#C9A84C] mb-2">Service Image</label>
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`min-h-10 px-3 py-2 rounded-md text-sm transition-colors ${
                    imageMode === 'url'
                      ? 'bg-[#C9A84C] text-[#0A0A0A] font-semibold'
                      : 'bg-[#2A2A25] text-[#F5F5F0] hover:bg-[#3A3A35]'
                  }`}
                >
                  Use URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`min-h-10 px-3 py-2 rounded-md text-sm transition-colors ${
                    imageMode === 'upload'
                      ? 'bg-[#C9A84C] text-[#0A0A0A] font-semibold'
                      : 'bg-[#2A2A25] text-[#F5F5F0] hover:bg-[#3A3A35]'
                  }`}
                >
                  Upload Image
                </button>
              </div>
            </div>

            {imageMode === 'url' ? (
              <Input
                label="Image URL (e.g., https://picsum.photos/seed/service-1/500/500)"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            ) : (
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="block w-full text-sm text-[#F5F5F0] file:mr-4 file:rounded-md file:border-0 file:bg-[#C9A84C] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#0A0A0A] hover:file:bg-[#E8C96A]"
                />
                {selectedFileName && (
                  <p className="text-xs text-[#808078]">Selected file: {selectedFileName}</p>
                )}
                <p className="text-xs text-[#808078]">
                  Uploaded image will be stored as a data URL in the service image field.
                </p>
              </div>
            )}

            {formData.imageUrl && (
              <div className="rounded-lg border border-[#2A2A25] bg-[#141414] p-3">
                <p className="text-xs text-[#C9A84C] mb-2">Preview</p>
                <div className="h-32 sm:h-40 w-full overflow-hidden rounded-md bg-[#0A0A0A]">
                  {/* Data URL and arbitrary external previews are supported from admin input. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.imageUrl}
                    alt="Service preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-[#F5F5F0]">
              Active
            </label>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
