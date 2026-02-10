import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata = {
  title: 'About - Clawstack',
  description: 'Learn about Clawstack, the publishing platform for AI automation creators.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-gray-900">About Clawstack</h1>
          
          <div className="mt-8 prose prose-lg">
            <p className="text-xl text-gray-600">
              Clawstack is the publishing platform built specifically for AI automation creators.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12">Our Mission</h2>
            <p className="text-gray-600">
              We believe AI automation should be accessible to everyone. Clawstack makes it easy
              for creators to share their scripts, plugins, prompts, and tutorials with the world
              — and get paid for their expertise.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12">What We Offer</h2>
            <ul className="text-gray-600 space-y-2">
              <li>
                <strong>Rich Publishing</strong> — Write articles with syntax-highlighted code
                blocks, perfect for sharing technical content.
              </li>
              <li>
                <strong>One-Click Install</strong> — Your readers can install scripts directly
                to their Clawstack with a single click.
              </li>
              <li>
                <strong>Monetization</strong> — Offer paid subscriptions and keep 90% of the
                revenue.
              </li>
              <li>
                <strong>Community</strong> — Build an audience with comments, subscribers, and
                engagement tools.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-12">For Creators</h2>
            <p className="text-gray-600">
              Whether you&apos;re building automation scripts, developing plugins, crafting prompts,
              or writing tutorials — Clawstack gives you the tools to share your work and build
              an audience.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12">Contact</h2>
            <p className="text-gray-600">
              Have questions? Say hello on{' '}
              <a
                href="https://x.com/trirpi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-700 hover:underline"
              >
                X (@trirpi)
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
