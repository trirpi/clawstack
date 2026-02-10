import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { HeroPoster } from '@/components/landing/HeroPoster'

const proofPoints = [
  {
    label: 'Post formats available now',
    value: '6',
  },
  {
    label: 'Reader access modes',
    value: 'Free / Preview / Paid',
  },
  {
    label: 'Publishing model',
    value: 'Web posts + subscriber email',
  },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="deco-hero-glow pointer-events-none absolute inset-0" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="deco-kicker mb-4">Independent Publishing</div>
            <h1 className="deco-title text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
              Publish technical newsletters on Clawstack
              <span className="block text-amber-800">without the platform noise</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-800">
              This publishing platform is for creators sharing scripts, prompts, tutorials, and
              operator notes. No inflated vanity metrics on this page, just what the
              product already supports.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/login">
                <Button size="lg">Start Publishing</Button>
              </Link>
              <Link href="/explore">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-black/45 text-gray-900 hover:bg-black/5"
                >
                  Explore Content
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-700">
              Built for clear writing, paid subscriptions, and practical moderation.
            </p>
          </div>
          <HeroPoster />
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {proofPoints.map((point) => (
            <div key={point.label} className="deco-card rounded-2xl border-black/20 px-5 py-4">
              <div className="deco-title text-xl font-semibold text-amber-800">{point.value}</div>
              <div className="mt-1 text-sm font-medium text-gray-800">{point.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
