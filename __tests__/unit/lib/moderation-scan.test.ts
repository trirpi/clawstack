import { describe, expect, it } from 'vitest'
import { formatModerationSummary, scanTextForPolicyViolations } from '@/lib/moderationScan'

describe('moderationScan', () => {
  it('returns no findings for neutral content', () => {
    const result = scanTextForPolicyViolations('Weekly CI report and deployment notes.')
    expect(result.blocked).toBe(false)
    expect(result.findings).toHaveLength(0)
  })

  it('flags adult keywords', () => {
    const result = scanTextForPolicyViolations('subscriber-only nude content with explicit sex scenes')
    expect(result.blocked).toBe(true)
    expect(result.findings.some((item) => item.reason === 'adult')).toBe(true)
  })

  it('flags violent extremism keywords', () => {
    const result = scanTextForPolicyViolations('white power movement propaganda')
    expect(result.blocked).toBe(true)
    expect(result.findings.some((item) => item.reason === 'violent_extremism')).toBe(true)
  })

  it('formats moderation summary', () => {
    const result = scanTextForPolicyViolations('pirated torrent download')
    expect(formatModerationSummary(result.findings)).toContain('copyright')
  })
})
