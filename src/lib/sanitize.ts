const allowedTags = [
  'p',
  'br',
  'strong',
  'em',
  'a',
  'ul',
  'ol',
  'li',
  'pre',
  'code',
  'blockquote',
  'h1',
  'h2',
  'h3',
  'span',
  'img',
  'hr',
]

const allowedTagPattern = new RegExp(`^/?(${allowedTags.join('|')})(\\s|>|$)`, 'i')

/**
 * Basic HTML sanitizer for server-side rendering.
 * Strips scripts/styles, event handlers, and javascript: URLs.
 * This is intentionally conservative and should be replaced with a
 * dedicated sanitizer if/when a dependency can be installed.
 */
export function sanitizeHtmlBasic(input: string): string {
  if (!input) return ''

  let output = input

  // Remove script/style blocks
  output = output.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script>/gi, '')
  output = output.replace(/<\s*style[^>]*>[\s\S]*?<\s*\/\s*style>/gi, '')

  // Remove inline event handlers and styles
  output = output.replace(/\son\w+="[^"]*"/gi, '')
  output = output.replace(/\son\w+='[^']*'/gi, '')
  output = output.replace(/\sstyle="[^"]*"/gi, '')
  output = output.replace(/\sstyle='[^']*'/gi, '')

  // Remove javascript: URLs
  output = output.replace(/\shref\s*=\s*(['"])\s*javascript:[\s\S]*?\1/gi, '')
  output = output.replace(/\ssrc\s*=\s*(['"])\s*javascript:[\s\S]*?\1/gi, '')

  // Strip disallowed tags entirely
  output = output.replace(/<[^>]*>/g, (tag) => {
    const normalized = tag.replace(/^<\s*/, '').replace(/\s*>$/, '')
    if (allowedTagPattern.test(normalized)) {
      return tag
    }
    return ''
  })

  // Ensure rel on links
  output = output.replace(/<a\b([^>]*)>/gi, (match, attrs) => {
    const hasRel = /\brel\s*=/i.test(attrs)
    const hasTarget = /\btarget\s*=/i.test(attrs)
    let nextAttrs = attrs
    if (!hasRel) {
      nextAttrs += ' rel="noopener noreferrer"'
    }
    if (!hasTarget) {
      nextAttrs += ' target="_blank"'
    }
    return `<a${nextAttrs}>`
  })

  return output
}
