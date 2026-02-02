import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function CTA() {
  return (
    <section className="py-20 sm:py-32 bg-orange-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to share your automations?
          </h2>
          <p className="mt-4 text-lg text-orange-100">
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
