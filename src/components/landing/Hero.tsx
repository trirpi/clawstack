import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center deco-card rounded-3xl px-6 py-10 sm:px-10 sm:py-14">
          <div className="deco-kicker mb-4">Independent Publishing</div>
          <h1 className="deco-title text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
            Share your{' '}
            <span className="text-amber-700">Clawstack</span>{' '}
            creations with the world
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-700">
            The publishing platform for AI automation creators. Share scripts,
            plugins, prompts, and tutorials. Build an audience and earn from your
            expertise.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg">Start Publishing</Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" size="lg">
                Explore Content
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center deco-card rounded-2xl p-5">
            <div className="deco-title text-4xl font-semibold text-amber-700">10K+</div>
            <div className="mt-2 text-gray-700">Active Creators</div>
          </div>
          <div className="text-center deco-card rounded-2xl p-5">
            <div className="deco-title text-4xl font-semibold text-amber-700">50K+</div>
            <div className="mt-2 text-gray-700">Scripts Shared</div>
          </div>
          <div className="text-center deco-card rounded-2xl p-5">
            <div className="deco-title text-4xl font-semibold text-amber-700">90%</div>
            <div className="mt-2 text-gray-700">Creator Earnings</div>
          </div>
        </div>
      </div>
    </section>
  )
}
