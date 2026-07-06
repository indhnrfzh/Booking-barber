'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

interface GalleryImage {
  id: string
  src: string
  category: string
  alt: string | null
  order: number
  isActive: boolean
}

export function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editUrl, setEditUrl] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchImages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/gallery?includeInactive=true')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch gallery images')
      }

      setImages(data.images)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch gallery images'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchImages()
  }, [])

  const handleEdit = (image: GalleryImage) => {
    setEditingId(image.id)
    setEditUrl(image.src)
  }

  const handleSave = async (id: string) => {
    if (!editUrl.trim()) {
      toast.error('URL cannot be empty')
      return
    }

    try {
      setSaving(true)

      const target = images.find((image) => image.id === id)
      if (!target) {
        throw new Error('Gallery image not found')
      }

      const response = await fetch(`/api/gallery/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          src: editUrl,
          category: target.category,
          alt: target.alt,
          order: target.order,
          isActive: target.isActive,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update image URL')
      }

      toast.success('Gallery image updated')
      setEditingId(null)
      await fetchImages()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update image URL'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(images.map((image) => image.category)))]
  }, [images])

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="bg-[#2A2A25] border border-[#3A3A35] rounded-lg p-4">
        <p className="text-[#F5F5F0] text-sm">
          <strong>Note:</strong> Gallery images are now database-driven. Edit URL updates instantly without changing source code.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-[#808078]">
        {categories.map((category) => (
          <span key={category} className="rounded-full border border-[#3A3A35] px-3 py-1">
            {category}
          </span>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {loading ? (
          <div className="col-span-full rounded-lg border border-[#2A2A25] bg-[#141414] p-6 text-center text-[#808078]">
            Loading gallery images...
          </div>
        ) : images.length === 0 ? (
          <div className="col-span-full rounded-lg border border-[#2A2A25] bg-[#141414] p-6 text-center text-[#808078]">
            No gallery images found. Run seed or add images via API.
          </div>
        ) : images.map((image) => (
          <div key={image.id} className="bg-[#2A2A25] border border-[#3A3A35] rounded-lg overflow-hidden">
            {/* Image Preview */}
            <div className="aspect-square bg-[#0A0A0A] overflow-hidden">
              {/* Dynamic external URLs are user-managed; keep native img for unrestricted sources. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={`Gallery ${image.id}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#C9A84C] font-semibold">Order #{image.order}</span>
                <span className="text-sm px-2 py-1 bg-[#3A3A35] text-[#F5F5F0] rounded">
                  {image.category}
                </span>
              </div>

              {editingId === image.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    placeholder="Enter image URL"
                    disabled={saving}
                    className="w-full min-h-11 px-3 py-2.5 bg-[#1C1C1C] border border-[#3A3A35] rounded text-[#F5F5F0] text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(image.id)}
                      disabled={saving}
                      className="flex-1 min-h-11 px-3 py-2 bg-[#C9A84C] text-[#0A0A0A] rounded text-sm font-semibold hover:bg-[#E8C96A]"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      disabled={saving}
                      className="flex-1 min-h-11 px-3 py-2 bg-[#3A3A35] text-[#F5F5F0] rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[#808078] text-xs truncate">{image.src}</p>
                  <button
                    onClick={() => handleEdit(image)}
                    className="w-full min-h-11 px-3 py-2.5 bg-[#2A2A25] hover:bg-[#3A3A35] text-[#F5F5F0] rounded text-sm transition-colors"
                  >
                    Edit URL
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Future Enhancement Note */}
      <div className="bg-[#2A2A25] border border-[#3A3A35] rounded-lg p-4">
        <h3 className="text-[#C9A84C] font-semibold mb-2">📋 Future Enhancement</h3>
        <div className="text-[#F5F5F0] text-sm">
          Optional next step for richer media management:
          <ul className="list-disc list-inside mt-2 space-y-1 text-[#808078]">
            <li>Integrate cloud storage (Cloudinary, Supabase, etc.)</li>
            <li>Add image upload UI with drag-drop</li>
            <li>Enable image reordering and deletion</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
