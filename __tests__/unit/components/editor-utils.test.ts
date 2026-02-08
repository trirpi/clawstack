import { describe, expect, it } from 'vitest'
import {
  CODE_LANGUAGES,
  normalizeImageUrl,
  normalizeLinkUrl,
} from '@/components/editor/editorUtils'

describe('editor utils', () => {
  describe('normalizeLinkUrl', () => {
    it('keeps absolute protocol URLs unchanged', () => {
      expect(normalizeLinkUrl('https://example.com')).toBe('https://example.com')
      expect(normalizeLinkUrl('mailto:hello@example.com')).toBe('mailto:hello@example.com')
    })

    it('keeps local/anchor/query links unchanged', () => {
      expect(normalizeLinkUrl('/pricing')).toBe('/pricing')
      expect(normalizeLinkUrl('#section')).toBe('#section')
      expect(normalizeLinkUrl('?tab=posts')).toBe('?tab=posts')
    })

    it('adds https:// for bare hostnames', () => {
      expect(normalizeLinkUrl('example.com')).toBe('https://example.com')
    })
  })

  describe('normalizeImageUrl', () => {
    it('keeps safe image URL forms unchanged', () => {
      expect(normalizeImageUrl('https://cdn.example.com/image.png')).toBe(
        'https://cdn.example.com/image.png',
      )
      expect(normalizeImageUrl('/uploads/file.png')).toBe('/uploads/file.png')
      expect(normalizeImageUrl('data:image/png;base64,abc123')).toBe(
        'data:image/png;base64,abc123',
      )
    })

    it('adds https:// for bare hostnames', () => {
      expect(normalizeImageUrl('cdn.example.com/file.webp')).toBe(
        'https://cdn.example.com/file.webp',
      )
    })
  })

  describe('CODE_LANGUAGES', () => {
    it('includes commonly used languages for code blocks', () => {
      const values = CODE_LANGUAGES.map((item) => item.value)

      expect(values).toEqual(
        expect.arrayContaining(['plaintext', 'javascript', 'typescript', 'python', 'json', 'bash']),
      )
    })
  })
})
