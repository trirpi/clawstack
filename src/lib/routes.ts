export function buildLoginHref(callbackPath: string) {
  const safeCallback =
    callbackPath.startsWith('/') && !callbackPath.startsWith('//') ? callbackPath : '/'
  return `/login?callbackUrl=${encodeURIComponent(safeCallback)}`
}
