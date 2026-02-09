const SAFE_CATEGORY_VALUES = new Set([
  'ARTICLE',
  'SCRIPT',
  'PLUGIN',
  'PROMPT',
  'TUTORIAL',
  'CONFIG',
])

const SAFE_VISIBILITY_VALUES = new Set(['FREE', 'PREVIEW', 'PAID'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function toCleanString(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

function toNullableString(value: unknown, maxLength: number) {
  const next = toCleanString(value, maxLength)
  return next.length > 0 ? next : null
}

function toNullableInteger(value: unknown, min: number, max: number) {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  if (!Number.isInteger(num)) return null
  if (num < min || num > max) return null
  return num
}

export function validatePostPayload(payload: unknown) {
  if (!isRecord(payload)) return null

  const title = toCleanString(payload.title, 160)
  const slug = toCleanString(payload.slug, 200)
  const content = typeof payload.content === 'string' ? payload.content : ''
  const excerpt = toNullableString(payload.excerpt, 500)
  const category = toCleanString(payload.category, 40)
  const visibility = toCleanString(payload.visibility, 40)
  const published = Boolean(payload.published)
  const publicationId = toCleanString(payload.publicationId, 200)
  const id = toNullableString(payload.id, 200)

  if (!title || !slug || !content) return null
  if (!SAFE_CATEGORY_VALUES.has(category)) return null
  if (!SAFE_VISIBILITY_VALUES.has(visibility)) return null
  if (content.length > 1_000_000) return null

  return {
    id,
    publicationId,
    title,
    slug,
    content,
    excerpt,
    category,
    visibility,
    published,
  }
}

export function validateSettingsPayload(payload: unknown) {
  if (!isRecord(payload)) return null

  const publication = isRecord(payload.publication) ? payload.publication : null
  const user = isRecord(payload.user) ? payload.user : null

  if (!publication && !user) return null

  return {
    publication: publication
      ? {
          name: toCleanString(publication.name, 120),
          description: toNullableString(publication.description, 400),
          priceMonthly: toNullableInteger(publication.priceMonthly, 0, 500_000),
          priceYearly: toNullableInteger(publication.priceYearly, 0, 5_000_000),
        }
      : null,
    user: user
      ? {
          name: toNullableString(user.name, 80),
          bio: toNullableString(user.bio, 300),
        }
      : null,
  }
}

export function validateCommentPayload(payload: unknown) {
  if (!isRecord(payload)) return null

  const postId = toCleanString(payload.postId, 200)
  const content = toCleanString(payload.content, 4_000)
  if (!postId || !content) return null

  return { postId, content }
}

export function validateNewsletterPayload(payload: unknown) {
  if (!isRecord(payload)) return null

  const subject = toCleanString(payload.subject, 180)
  const content = toCleanString(payload.content, 200_000)
  if (!subject || !content) return null

  return { subject, content }
}

export function validateSendPostPayload(payload: unknown) {
  if (!isRecord(payload)) return null
  const postId = toCleanString(payload.postId, 200)
  if (!postId) return null
  return { postId }
}

export function hasSameOriginHeader(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return true

  const appUrl = process.env.NEXTAUTH_URL
  if (!appUrl) return true

  try {
    return new URL(origin).origin === new URL(appUrl).origin
  } catch {
    return false
  }
}

// Prevent CSV formula injection in spreadsheet apps.
export function escapeCsvCell(value: string) {
  const normalized = value.replace(/"/g, '""')
  if (/^[=+\-@]/.test(normalized)) {
    return `'${normalized}`
  }
  return normalized
}

