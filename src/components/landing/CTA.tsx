import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function CTA() {
  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center rounded-3xl border border-black/15 bg-[#16120f] px-8 py-12">
          <div className="deco-kicker text-amber-400">Launch Your Letter</div>
          <h2 className="deco-title mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ready to share your automations?
          </h2>
          <p className="mt-4 text-lg text-amber-100/90">
            Join thousands of creators building the future of AI automation.
            Free to start, only pay when you earn.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" variant="white">
                Create Your Publication
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
