// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders children label', () => {
    render(<Button>Book now</Button>)

    expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument()
  })

  it('prevents click when loading', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Button isLoading onClick={onClick}>
        Submit
      </Button>
    )

    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(onClick).not.toHaveBeenCalled()
  })
})
