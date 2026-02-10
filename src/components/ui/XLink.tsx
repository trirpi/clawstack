import { PLATFORM_CONTACT_X_HANDLE, PLATFORM_CONTACT_X_URL } from '@/lib/legal'

interface XLinkProps {
  className?: string
}

export function XLink({ className }: XLinkProps) {
  const classes = className ?? 'inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-900'

  return (
    <a
      href={PLATFORM_CONTACT_X_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
      aria-label={`X ${PLATFORM_CONTACT_X_HANDLE}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-4 w-4 fill-current"
      >
        <path d="M18.9 2H22l-6.8 7.8L23 22h-6.1l-4.8-6.4L6.4 22H3.3l7.3-8.3L1 2h6.2l4.3 5.8L18.9 2Zm-1.1 18h1.7L6.3 3.9H4.5L17.8 20Z" />
      </svg>
      <span>X ({PLATFORM_CONTACT_X_HANDLE})</span>
    </a>
  )
}
