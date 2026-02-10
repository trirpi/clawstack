import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { XLink } from '@/components/ui/XLink'
import { PLATFORM_CONTACT_X_HANDLE, PLATFORM_CONTACT_X_URL } from '@/lib/legal'

describe('XLink', () => {
  it('renders handle text and points to configured X URL', () => {
    render(<XLink />)

    const link = screen.getByRole('link', { name: new RegExp(`X ${PLATFORM_CONTACT_X_HANDLE}`, 'i') })
    expect(link).toHaveAttribute('href', PLATFORM_CONTACT_X_URL)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
