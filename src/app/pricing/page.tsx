import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'

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
    href: '/login',
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
    href: '/login',
    featured: true,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-b from-orange-50 to-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              Free to start. Only pay when you earn.
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.featured
                    ? 'bg-orange-600 text-white ring-4 ring-orange-600 ring-offset-2'
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                <h2 className={`text-2xl font-bold ${plan.featured ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h2>
                <div className="mt-4">
                  <span className={`text-5xl font-bold ${plan.featured ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  {plan.priceNote && (
                    <span className={`ml-2 text-sm ${plan.featured ? 'text-orange-100' : 'text-gray-500'}`}>
                      {plan.priceNote}
                    </span>
                  )}
                </div>
                <p className={`mt-2 ${plan.featured ? 'text-orange-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <svg
                        className={`w-5 h-5 ${plan.featured ? 'text-orange-200' : 'text-orange-600'}`}
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
                  <Link href={plan.href}>
                    <Button
                      variant={plan.featured ? 'white' : 'primary'}
                      size="lg"
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">How does the 10% fee work?</h3>
              <p className="mt-2 text-gray-600">
                We only charge when you earn. If you offer paid subscriptions, we take 10% of
                the subscription revenue. Payment processing fees (Stripe) are separate.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Can I switch plans later?</h3>
              <p className="mt-2 text-gray-600">
                Yes! You can enable paid subscriptions at any time. There&apos;s no commitment
                or contract.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">What payment methods do you accept?</h3>
              <p className="mt-2 text-gray-600">
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
