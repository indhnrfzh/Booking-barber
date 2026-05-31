// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ServiceForm } from '@/components/admin/ServiceForm'

const refreshMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('ServiceForm', () => {
  it('renders create mode title when no service is provided', () => {
    render(<ServiceForm service={null} onClose={vi.fn()} onSuccess={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Add New Service' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Service' })).toBeInTheDocument()
  })

  it('renders edit mode title when service is provided', () => {
    render(
      <ServiceForm
        service={{
          id: 'svc-1',
          nameId: 'Potong',
          nameEn: 'Haircut',
          descId: 'Deskripsi ID',
          descEn: 'Description EN',
          price: 100000,
          duration: 45,
          imageUrl: 'https://example.com/image.jpg',
          isActive: true,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    )

    expect(screen.getByRole('heading', { name: 'Edit Service' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Update Service' })).toBeInTheDocument()
  })

  it('switches image mode to upload', async () => {
    const user = userEvent.setup()

    render(<ServiceForm service={null} onClose={vi.fn()} onSuccess={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Upload Image' }))

    expect(screen.getByText(/Uploaded image will be stored as a data URL/i)).toBeInTheDocument()
  })
})
