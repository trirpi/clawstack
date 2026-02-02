import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

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
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
