import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦞</span>
            <span className="text-lg font-bold text-gray-900">Clawstack</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <Link href="/about" className="hover:text-gray-900">
              About
            </Link>
            <Link href="/pricing" className="hover:text-gray-900">
              Pricing
            </Link>
            <Link href="/privacy" className="hover:text-gray-900">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gray-900">
              Terms
            </Link>
          </div>
          <div className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Clawstack. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
