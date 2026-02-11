'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { clsx } from 'clsx'

const baseNavItems = [
  { href: '/dashboard', label: 'Posts', icon: '📝' },
  { href: '/dashboard/subscribers', label: 'Subscribers', icon: '👥' },
  { href: '/dashboard/earnings', label: 'Earnings', icon: '💰' },
  { href: '/dashboard/newsletter', label: 'Newsletter', icon: '📧' },
  { href: '/dashboard/reports', label: 'Reports', icon: '🚩' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
]

export function DashboardNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isPlatformAdmin = session?.user?.isPlatformAdmin === true
  const navItems = isPlatformAdmin
    ? [...baseNavItems, { href: '/dashboard/admin', label: 'Admin', icon: '🛡️' }]
    : baseNavItems

  return (
    <nav className="border-b border-black/15 bg-[#f8f4ea]/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'border-amber-700 text-amber-800'
                    : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-black/35'
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
