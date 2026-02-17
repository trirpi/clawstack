import { Suspense } from 'react'
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

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-pulse text-gray-400">Loading reviewer login...</div>
        </div>
      }
    >
      <ReviewerLoginForm />
    </Suspense>
  )
}
