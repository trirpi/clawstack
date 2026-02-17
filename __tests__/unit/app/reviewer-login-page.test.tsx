import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import ReviewerLoginPage from '@/app/reviewer-login/page'

const PREVIOUS_ENV = { ...process.env }

function setReviewerEnv(enabled: boolean) {
  process.env.NEXT_PUBLIC_REVIEWER_AUTH_ENABLED = enabled ? 'true' : 'false'
  process.env.TEMP_REVIEWER_USERNAME = enabled ? 'stripe-reviewer' : ''
  process.env.TEMP_REVIEWER_PASSWORD = enabled ? 'secret' : ''
}

describe('reviewer login page', () => {
  beforeEach(() => {
    process.env = { ...PREVIOUS_ENV }
  })

  afterEach(() => {
    process.env = { ...PREVIOUS_ENV }
  })

  it('wraps client search param usage in a Suspense boundary', () => {
    setReviewerEnv(true)

    const pageElement = ReviewerLoginPage() as {
      type: symbol
      props: { fallback?: unknown; children?: unknown }
    }

    expect(pageElement.type).toBe(Symbol.for('react.suspense'))
    expect(pageElement.props.fallback).toBeTruthy()
    expect(pageElement.props.children).toBeTruthy()
  })

  it('returns not found when reviewer auth is disabled', () => {
    setReviewerEnv(false)

    expect(() => ReviewerLoginPage()).toThrow()
  })
})
