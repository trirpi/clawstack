import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'

export const metadata: Metadata = {
  title: 'Clawstack - Publish Technical Newsletters',
  description:
    'Publish scripts, prompts, tutorials, and technical notes with built-in subscriptions, newsletters, and moderation workflows.',
  keywords: ['Clawstack', 'technical newsletter', 'scripts', 'prompts', 'tutorials', 'creator'],
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
