import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function CTA() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="deco-frame mx-auto max-w-3xl text-center rounded-3xl bg-[#f1dfbf] px-8 py-12">
          <div className="deco-kicker text-amber-900">Launch Your Letter</div>
          <h2 className="deco-title mt-3 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Ready to share your automations?
          </h2>
          <p className="mt-4 text-lg text-gray-900">
            Create your publication, publish your first post, and start building a
            direct reader relationship.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/dashboard/new">
              <Button size="lg" variant="white" className="border border-black/20">
                Create Your Publication
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
