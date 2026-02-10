'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'
import { REPORT_REASON_LABELS, REPORT_REASON_VALUES, type ReportReason } from '@/lib/moderation'

interface ReportDialogProps {
  postId: string
  publicationId: string
  postSlug: string
  publicationSlug: string
}

const REASONS = REPORT_REASON_VALUES.map((value) => ({
  value,
  label: REPORT_REASON_LABELS[value],
}))

export function ReportDialog({ postId, publicationId, postSlug, publicationSlug }: ReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ReportReason>(REPORT_REASON_VALUES[0])
  const [email, setEmail] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null)

  const handleSubmit = async () => {
    if (details.trim().length > 2000) {
      setMessage({ tone: 'error', text: 'Details must be 2000 characters or fewer.' })
      return
    }

    setSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          publicationId,
          reason,
          reporterEmail: email,
          details,
          postSlug,
          publicationSlug,
          sourceUrl: `${window.location.origin}/${publicationSlug}/${postSlug}`,
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to submit report')
      }

      setMessage({ tone: 'success', text: 'Report submitted. Thanks for letting us know.' })
      setReason(REPORT_REASON_VALUES[0])
      setEmail('')
      setDetails('')
      setOpen(false)
    } catch (error) {
      setMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Failed to submit report',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Report content</h4>
          <p className="text-sm text-gray-600">
            Help us keep Clawstack safe. Report content that violates our policies.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Report
        </Button>
      </div>

      {message && <div className="mt-4"><Notice tone={message.tone} message={message.text} /></div>}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-200 px-5 py-4">
              <h3 className="text-base font-semibold text-gray-900">Report this post</h3>
            </div>
            <div className="space-y-4 px-5 py-4">
              <div>
                <label className="text-xs font-medium text-gray-600">Reason</label>
                <select
                  value={reason}
                  onChange={(event) => setReason(event.target.value as ReportReason)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                >
                  {REASONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Contact email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Details (optional)</label>
                <textarea
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  rows={4}
                  placeholder="Add helpful context for our review team"
                  maxLength={2000}
                />
                <div className="mt-1 text-xs text-gray-400">
                  {details.length}/2000
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Reports are reviewed by our team. Repeated abuse may result in account action.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit report'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
