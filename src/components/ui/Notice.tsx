interface NoticeProps {
  tone?: 'success' | 'error' | 'info'
  message: string
}

export function Notice({ tone = 'info', message }: NoticeProps) {
  const styles =
    tone === 'success'
      ? 'border-green-200 bg-green-50 text-green-800'
      : tone === 'error'
        ? 'border-red-200 bg-red-50 text-red-800'
        : 'border-blue-200 bg-blue-50 text-blue-800'

  return <div className={`rounded-lg border px-3 py-2 text-sm ${styles}`}>{message}</div>
}

