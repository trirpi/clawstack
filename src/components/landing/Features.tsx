const features = [
  {
    icon: '✍︎',
    title: 'Rich Editor',
    description:
      'Write long-form posts with headings, code blocks, links, highlights, and image embeds.',
  },
  {
    icon: '🔐',
    title: 'Access Controls',
    description:
      'Choose Free, Preview, or Paid visibility per post to tune what readers can access.',
  },
  {
    icon: '💰',
    title: 'Paid Subscriptions',
    description:
      'Connect Stripe and monetize your publication with recurring subscriptions.',
  },
  {
    icon: '📬',
    title: 'Newsletter Sending',
    description:
      'Send post updates to subscribers directly from the dashboard newsletter flow.',
  },
  {
    icon: '🧰',
    title: 'Boilerplate Templates',
    description:
      'Start faster with template posts for scripts, tutorials, and incident reports.',
  },
  {
    icon: '🛡',
    title: 'Reporting + Moderation',
    description:
      'Users can report violating content and admins can review, track, and resolve reports.',
  },
]

export function Features() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="deco-kicker mb-3">Craft + Commerce</div>
          <h2 className="deco-title text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Clear, practical tools for creator-run publications
          </h2>
          <p className="mt-4 text-lg text-gray-800">
            Focused feature set, no hype copy
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="deco-card rounded-2xl p-8 transition-all hover:-translate-y-0.5"
            >
              <div className="mb-4 inline-flex rounded-lg border border-black/20 bg-[#f6e8d2] px-3 py-2 text-3xl">
                {feature.icon}
              </div>
              <h3 className="deco-title text-xl font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-800">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
