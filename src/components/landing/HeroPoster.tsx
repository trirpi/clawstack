export function HeroPoster() {
  return (
    <div className="deco-frame relative overflow-hidden rounded-[30px] bg-[#ece1cf] p-6 sm:p-8">
      <div className="deco-grain pointer-events-none absolute inset-0 opacity-35" />
      <div className="deco-poster-glow pointer-events-none absolute inset-0 opacity-80" />

      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full text-black/30"
        viewBox="0 0 600 600"
      >
        <path d="M80 520 Q300 130 520 520" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <path d="M120 520 Q300 190 480 520" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M165 520 Q300 255 435 520" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <line x1="80" y1="520" x2="520" y2="520" stroke="currentColor" strokeWidth="1.3" />
        <line x1="120" y1="440" x2="480" y2="440" stroke="currentColor" strokeWidth="0.8" />
        <line x1="150" y1="380" x2="450" y2="380" stroke="currentColor" strokeWidth="0.7" />
      </svg>

      <div className="relative z-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/20 bg-white/85 p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-stone-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-stone-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-stone-400" />
          </div>
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-black/20" />
            <div className="h-2 w-5/6 rounded-full bg-black/15" />
            <div className="h-2 w-2/3 rounded-full bg-black/10" />
          </div>
        </div>

        <div className="rounded-2xl border border-black/20 bg-white/78 p-4 shadow-sm sm:mt-8">
          <div className="mb-3 h-2 w-12 rounded-full bg-black/25" />
          <div className="grid grid-cols-5 gap-1.5">
            <span className="h-8 rounded-md bg-stone-800/85" />
            <span className="h-8 rounded-md bg-stone-700/75" />
            <span className="h-8 rounded-md bg-stone-600/65" />
            <span className="h-8 rounded-md bg-stone-500/60" />
            <span className="h-8 rounded-md bg-stone-400/55" />
          </div>
        </div>

        <div className="rounded-2xl border border-black/20 bg-white/82 p-4 shadow-sm sm:col-span-2">
          <div className="mb-2.5 h-2 w-16 rounded-full bg-black/25" />
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-black/20" />
            <div className="h-2 w-11/12 rounded-full bg-black/15" />
            <div className="h-2 w-3/4 rounded-full bg-black/10" />
          </div>
        </div>
      </div>
    </div>
  )
}
