import sanitizeHtml from 'sanitize-html'

const baseAllowedTags = [
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
  'h4',
  'h5',
  'h6',
  'span',
  'img',
  'hr',
] as const

const baseAllowedAttributes: sanitizeHtml.IOptions['allowedAttributes'] = {
  a: ['href', 'name', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  code: ['class'],
  pre: ['class'],
  span: ['class'],
}

const baseAllowedSchemes = ['http', 'https', 'mailto', 'tel', 'data']

/**
 * Production-grade HTML sanitizer for editor/render/email content.
 * Keeps a small rich-text subset and strips any active content.
 */
export function sanitizeHtmlBasic(input: string): string {
  if (!input) return ''

  return sanitizeHtml(input, {
    allowedTags: [...baseAllowedTags],
    allowedAttributes: baseAllowedAttributes,
    allowedSchemes: baseAllowedSchemes,
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
    },
    allowedClasses: {
      code: ['hljs*', 'language-*'],
      pre: ['hljs*', 'language-*'],
      span: ['hljs*'],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        rel: 'noopener noreferrer',
        target: '_blank',
      }),
    },
    parseStyleAttributes: false,
    nonTextTags: ['script', 'style', 'textarea', 'noscript'],
    disallowedTagsMode: 'discard',
  })
}

export function sanitizePlainText(input: string): string {
  if (!input) return ''
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} }).trim()
}
