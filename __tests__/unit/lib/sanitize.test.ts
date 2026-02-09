import { describe, expect, it } from 'vitest'
import { sanitizeHtmlBasic, sanitizePlainText } from '@/lib/sanitize'

describe('sanitize helpers', () => {
  it('removes scripts and unsafe links', () => {
    const dirty = `
      <p>Hello</p>
      <script>alert('xss')</script>
      <a href="javascript:alert('xss')">bad</a>
      <img src="javascript:alert('xss')" onerror="alert('xss')" />
    `

    const clean = sanitizeHtmlBasic(dirty)

    expect(clean).toContain('<p>Hello</p>')
    expect(clean).not.toContain('<script')
    expect(clean).not.toContain('javascript:')
    expect(clean).not.toContain('onerror')
  })

  it('preserves code block classes used by syntax highlighting', () => {
    const content = '<pre class="language-typescript"><code class="hljs language-typescript">const x = 1</code></pre>'
    const clean = sanitizeHtmlBasic(content)

    expect(clean).toContain('language-typescript')
    expect(clean).toContain('hljs')
  })

  it('strips tags from plain text sanitizer', () => {
    expect(sanitizePlainText('<b>Hi</b> there')).toBe('Hi there')
  })
})

