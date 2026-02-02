import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata = {
  title: 'Privacy Policy - Clawstack',
  description: 'Clawstack privacy policy and data handling practices.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-4 text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="mt-8 prose prose-lg text-gray-600">
            <h2 className="text-2xl font-bold text-gray-900 mt-8">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an
              account, publish content, or contact us for support.
            </p>
            <ul>
              <li>Account information (email, name, profile picture)</li>
              <li>Content you publish (posts, comments)</li>
              <li>Payment information (processed securely by Stripe)</li>
              <li>Usage data and analytics</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">3. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share information with:
            </p>
            <ul>
              <li>Service providers who assist in our operations</li>
              <li>When required by law or to protect our rights</li>
              <li>With your consent or at your direction</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">4. Data Security</h2>
            <p>
              We take reasonable measures to help protect your personal information from loss,
              theft, misuse, and unauthorized access.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8">6. Contact Us</h2>
            <p>
              If you have questions about this privacy policy, please contact us at{' '}
              <a href="mailto:privacy@clawstack.com" className="text-orange-600 hover:underline">
                privacy@clawstack.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
