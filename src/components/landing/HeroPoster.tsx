const workflowItems = [
  'Draft with rich text + code highlighting',
  'Choose Free, Preview, or Paid access',
  'Publish to web and notify subscribers',
]

export function HeroPoster() {
  return (
    <div className="deco-frame relative overflow-hidden rounded-[30px] bg-[#f6e8d2] p-6 sm:p-8">
      <div className="deco-grain pointer-events-none absolute inset-0 opacity-45" />
      <div className="deco-sunburst pointer-events-none absolute -top-40 left-1/2 h-[35rem] w-[35rem] -translate-x-1/2 opacity-45" />

      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full text-black/25"
        viewBox="0 0 600 600"
      >
        <circle cx="300" cy="300" r="220" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="300" cy="300" r="170" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="300" cy="300" r="122" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M300 70L300 530M70 300L530 300M130 130L470 470M130 470L470 130" stroke="currentColor" strokeWidth="1" />
      </svg>

      <div className="relative">
        <div className="deco-kicker mb-3 text-amber-900">Creator Workflow</div>
        <h3 className="deco-title text-2xl font-semibold text-gray-900 sm:text-3xl">
          A publishing stack for technical writing
        </h3>
        <p className="mt-3 text-sm text-gray-800 sm:text-base">
          Built for scripts, prompts, tutorials, and operational notes.
        </p>

        <ul className="mt-6 space-y-3">
          {workflowItems.map((item, index) => (
            <li
              key={item}
              className="rounded-xl border border-black/20 bg-white/80 px-3 py-2 text-sm font-medium text-gray-900 shadow-sm"
            >
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-black/30 text-xs">
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="deco-badge">6 post types</span>
          <span className="deco-badge">3 visibility modes</span>
          <span className="deco-badge">Reporting + moderation</span>
        </div>
      </div>
    </div>
  )
}
