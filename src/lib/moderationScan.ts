import type { ReportReason } from '@/lib/moderation'

type AutomatableReason = Exclude<ReportReason, 'other'>

export interface ModerationFinding {
  reason: AutomatableReason
  terms: string[]
}

export interface ModerationScanResult {
  blocked: boolean
  findings: ModerationFinding[]
}

const POLICY_TERM_MAP: Record<AutomatableReason, string[]> = {
  adult: [
    'porn',
    'xxx',
    'nude',
    'sex cam',
    'explicit sex',
    'adult service',
    'nsfw',
    'onlyfans',
  ],
  ip: [
    'counterfeit',
    'trademark infringement',
    'fake rolex',
    'fake gucci',
    'bootleg merch',
  ],
  copyright: [
    'pirated',
    'torrent download',
    'leaked album',
    'crack download',
    'warez',
    'stolen ebook',
  ],
  violent_extremism: [
    'heil hitler',
    'white power',
    'ethnic cleansing',
    'join isis',
    'kill all',
    'race war',
    'lynch',
  ],
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function scanTextForPolicyViolations(value: string): ModerationScanResult {
  const text = normalizeText(value)
  if (!text) {
    return { blocked: false, findings: [] }
  }

  const findings: ModerationFinding[] = []

  for (const [reason, rawTerms] of Object.entries(POLICY_TERM_MAP) as [AutomatableReason, string[]][]) {
    const matchedTerms = rawTerms.filter((term) => text.includes(term))
    if (matchedTerms.length > 0) {
      findings.push({
        reason,
        terms: matchedTerms,
      })
    }
  }

  return {
    blocked: findings.length > 0,
    findings,
  }
}

export function formatModerationSummary(findings: ModerationFinding[]) {
  return findings.map((finding) => `${finding.reason}: ${finding.terms.join(', ')}`).join(' | ')
}
