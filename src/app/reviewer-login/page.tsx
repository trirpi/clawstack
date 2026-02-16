import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ReviewerLoginForm } from './reviewer-login-form'

export const metadata: Metadata = {
  title: 'Reviewer Login - Clawstack',
  robots: {
    index: false,
    follow: false,
  },
}

function isReviewerAuthConfigured() {
  return (
    process.env.NEXT_PUBLIC_REVIEWER_AUTH_ENABLED === 'true' &&
    Boolean(process.env.TEMP_REVIEWER_USERNAME?.trim()) &&
    Boolean(process.env.TEMP_REVIEWER_PASSWORD)
  )
}

export default function ReviewerLoginPage() {
  if (!isReviewerAuthConfigured()) {
    notFound()
  }

  return <ReviewerLoginForm />
}
