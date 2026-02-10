const features = [
  {
    icon: '📝',
    title: 'Rich Publishing',
    description:
      'Write articles, share code snippets with syntax highlighting, and embed scripts directly in your posts.',
  },
  {
    icon: '🔌',
    title: 'One-Click Install',
    description:
      'Readers can install your scripts and plugins directly to Clawstack with a single click.',
  },
  {
    icon: '💰',
    title: 'Paid Subscriptions',
    description:
      'Monetize your expertise. Offer free and premium content, keep 90% of subscription revenue.',
  },
  {
    icon: '📊',
    title: 'Analytics',
    description:
      'Track views, subscribers, and engagement. Understand what resonates with your audience.',
  },
  {
    icon: '🤖',
    title: 'AI-Native Format',
    description:
      'Content formatted for AI agents. YAML frontmatter, .claw file downloads, and machine-readable metadata.',
  },
  {
    icon: '🌐',
    title: 'Community',
    description:
      'Comments, discussions, and recommendations. Connect with the Clawstack community.',
  },
]

export function Features() {
  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="deco-kicker mb-3">Craft + Commerce</div>
          <h2 className="deco-title text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to share AI automations
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Built specifically for the Clawstack community
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="deco-card rounded-2xl p-8 hover:-translate-y-0.5 transition-all"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="deco-title text-xl font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
