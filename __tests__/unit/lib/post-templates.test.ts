import { describe, expect, it } from 'vitest'
import { getPostTemplate, POST_TEMPLATES } from '@/lib/postTemplates'

describe('post templates', () => {
  it('returns a template for known keys', () => {
    const firstTemplate = POST_TEMPLATES[0]

    expect(getPostTemplate(firstTemplate.key)?.title).toBe(firstTemplate.title)
  })

  it('returns null for unknown keys', () => {
    expect(getPostTemplate('does-not-exist')).toBeNull()
  })

  it('includes expected defaults for template publishing controls', () => {
    for (const template of POST_TEMPLATES) {
      expect(['ARTICLE', 'SCRIPT', 'PLUGIN', 'PROMPT', 'TUTORIAL', 'CONFIG']).toContain(
        template.category,
      )
      expect(['FREE', 'PREVIEW', 'PAID']).toContain(template.visibility)
    }
  })
})
