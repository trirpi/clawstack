export const CODE_LANGUAGES = [
  { value: 'plaintext', label: 'Plain text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
] as const

export function normalizeLinkUrl(url: string) {
  if (!url) return ''

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(url)) {
    return url
  }

  if (url.startsWith('/') || url.startsWith('#') || url.startsWith('?')) {
    return url
  }

  return `https://${url}`
}

export function normalizeImageUrl(url: string) {
  if (!url) return ''

  if (/^(https?:\/\/|\/|data:image\/)/i.test(url)) {
    return url
  }

  return `https://${url}`
}
