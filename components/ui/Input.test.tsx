// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Input } from '@/components/ui/Input'

describe('Input', () => {
  it('renders label and input element', () => {
    render(<Input label="Customer name" placeholder="Type name" />)

    expect(screen.getByText('Customer name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type name')).toBeInTheDocument()
  })

  it('renders error message when provided', () => {
    render(<Input label="Email" error="Invalid email" />)

    expect(screen.getByText('Invalid email')).toBeInTheDocument()
  })
})
