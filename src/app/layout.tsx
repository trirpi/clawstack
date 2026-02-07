import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'

export const metadata: Metadata = {
  title: 'Clawstack - Share AI Automations',
  description:
    'The publishing platform for AI automation creators. Share scripts, plugins, prompts, and tutorials with the Clawstack community.',
  keywords: ['Clawstack', 'AI', 'automation', 'scripts', 'plugins', 'newsletter'],
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
