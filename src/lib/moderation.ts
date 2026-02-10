export const REPORT_REASON_VALUES = [
  'adult',
  'ip',
  'copyright',
  'violent_extremism',
  'other',
] as const

export type ReportReason = (typeof REPORT_REASON_VALUES)[number]

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  adult: 'Adult content or services',
  ip: 'Intellectual property infringement',
  copyright: 'Copyright-infringing content',
  violent_extremism: 'Violent extremism or hate speech',
  other: 'Other',
}

export const REPORT_STATUS_VALUES = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED'] as const
export type ReportStatus = (typeof REPORT_STATUS_VALUES)[number]
