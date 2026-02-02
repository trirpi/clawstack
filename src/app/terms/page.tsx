import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata = {
  title: 'Terms of Service - Clawstack',
  description: 'Clawstack terms of service and usage agreement.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
          <p className="mt-4 text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="mt-8 prose prose-lg text-gray-600">
            <h2 className="text-2xl font-bold text-gray-900 mt-8">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Clawstack, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">2. Use of Service</h2>
            <p>
              Clawstack provides a platform for creating and sharing content related to AI
              automation. You agree to use the service only for lawful purposes and in accordance
              with these terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the security of your account and all activities
              that occur under your account. You must notify us immediately of any unauthorized use.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">4. Content</h2>
            <p>
              You retain ownership of content you publish on Clawstack. By publishing, you grant
              us a license to display, distribute, and promote your content on our platform.
            </p>
            <p>You agree not to publish content that:</p>
            <ul>
              <li>Violates any laws or regulations</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains malware or harmful code</li>
              <li>Is spam, misleading, or fraudulent</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">5. Payments</h2>
            <p>
              If you offer paid subscriptions, Clawstack takes a 10% platform fee from subscription
              revenue. Payment processing is handled by Stripe and subject to their terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">6. Termination</h2>
            <p>
              We may terminate or suspend your account at any time for violations of these terms.
              You may also delete your account at any time.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">7. Disclaimers</h2>
            <p>
              Clawstack is provided &quot;as is&quot; without warranties of any kind. We do not guarantee
              that the service will be uninterrupted, secure, or error-free.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Clawstack shall not be liable for any
              indirect, incidental, special, or consequential damages.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">9. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the service after
              changes constitutes acceptance of the new terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">10. Contact</h2>
            <p>
              Questions about these terms? Contact us at{' '}
              <a href="mailto:legal@clawstack.com" className="text-orange-600 hover:underline">
                legal@clawstack.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
