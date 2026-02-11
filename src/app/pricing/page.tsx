import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { AuthCtaLink } from '@/components/ui/AuthCtaLink'

export const metadata = {
  title: 'Pricing - Clawstack',
  description: 'Simple, transparent pricing. Free to start, only pay when you earn.',
}

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      'Unlimited free posts',
      'Basic analytics',
      'Custom publication page',
      'Comments & engagement',
      'Email notifications',
    ],
    cta: 'Get Started',
    authHref: '/dashboard/new',
    featured: false,
  },
  {
    name: 'Pro',
    price: '10%',
    priceNote: 'of paid subscription revenue',
    description: 'For creators ready to monetize',
    features: [
      'Everything in Free',
      'Paid subscriptions',
      'Keep 90% of revenue',
      'Advanced analytics',
      'Priority support',
      'Custom domain (coming soon)',
    ],
    cta: 'Start Earning',
    authHref: '/dashboard/earnings',
    featured: true,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className="py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="deco-kicker mb-3">Pricing</div>
            <h1 className="deco-title text-4xl font-semibold text-gray-900 sm:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-800">
              Free to start. Only pay when you earn.
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.featured
                    ? 'deco-frame bg-[#2f2a26] text-[#f5efe7]'
                    : 'deco-card border-black/20 bg-white text-gray-900'
                }`}
              >
                {plan.featured && (
                  <div className="mb-4 inline-flex rounded-full border border-[#f6e7d2]/60 bg-[#f6e7d2]/20 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#fff4e6]">
                    Most Popular
                  </div>
                )}
                <h2
                  className={`deco-title text-3xl font-semibold ${plan.featured ? 'text-[#fff5ea]' : 'text-gray-900'}`}
                >
                  {plan.name}
                </h2>
                <div className="mt-4">
                  <span className={`text-5xl font-bold ${plan.featured ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  {plan.priceNote && (
                    <span className={`ml-2 text-sm ${plan.featured ? 'text-[#d8c7b3]' : 'text-gray-600'}`}>
                      {plan.priceNote}
                    </span>
                  )}
                </div>
                <p className={`mt-2 ${plan.featured ? 'text-[#d8c7b3]' : 'text-gray-700'}`}>
                  {plan.description}
                </p>
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <svg
                        className={`w-5 h-5 ${plan.featured ? 'text-[#dcccb9]' : 'text-stone-700'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <AuthCtaLink authenticatedHref={plan.authHref} callbackHref={plan.authHref}>
                    <Button
                      variant={plan.featured ? 'white' : 'primary'}
                      size="lg"
                      className={`w-full ${plan.featured ? 'border border-white/25' : ''}`}
                    >
                      {plan.cta}
                    </Button>
                  </AuthCtaLink>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="deco-title text-2xl font-semibold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="deco-card rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900">How does the 10% fee work?</h3>
              <p className="mt-2 text-gray-700">
                We only charge when you earn. If you offer paid subscriptions, we take 10% of
                the subscription revenue. Payment processing fees (Stripe) are separate.
              </p>
            </div>
            <div className="deco-card rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900">Can I switch plans later?</h3>
              <p className="mt-2 text-gray-700">
                Yes! You can enable paid subscriptions at any time. There&apos;s no commitment
                or contract.
              </p>
            </div>
            <div className="deco-card rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900">What payment methods do you accept?</h3>
              <p className="mt-2 text-gray-700">
                We use Stripe for payments, which supports all major credit cards and
                many local payment methods worldwide.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
