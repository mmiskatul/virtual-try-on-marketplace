export default function MarketplaceLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 animate-pulse">
      {/* Top Navbar Placeholder Skeleton */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-900/40 border border-purple-500/30" />
            <div className="h-6 w-28 rounded-md bg-slate-800" />
          </div>

          <div className="hidden md:block flex-1 max-w-md">
            <div className="h-10 w-full rounded-full bg-slate-900 border border-slate-800" />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800" />
            <div className="w-24 h-9 rounded-full bg-slate-800" />
          </div>
        </div>
      </header>

      {/* Hero Section Skeleton */}
      <section className="relative px-4 lg:px-8 py-16 overflow-hidden border-b border-slate-800/50 bg-gradient-to-b from-purple-950/20 via-slate-950 to-slate-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-block h-6 w-44 rounded-full bg-purple-900/40 border border-purple-500/20" />
            <div className="h-12 w-3/4 rounded-lg bg-slate-800" />
            <div className="h-12 w-1/2 rounded-lg bg-slate-800" />
            <div className="h-5 w-4/5 rounded-md bg-slate-800/60" />
            <div className="h-5 w-2/3 rounded-md bg-slate-800/60" />
            <div className="flex gap-3 pt-3">
              <div className="h-11 w-36 rounded-full bg-purple-600/40" />
              <div className="h-11 w-36 rounded-full bg-slate-800" />
            </div>
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm aspect-[3/4] rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs & Brand Carousel Skeleton */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 w-24 rounded-full bg-slate-900 border border-slate-800" />
            ))}
          </div>
          <div className="h-9 w-32 rounded-lg bg-slate-900 border border-slate-800 hidden sm:block" />
        </div>

        {/* Product Grid Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((card) => (
            <div
              key={card}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-3 space-y-3"
            >
              <div className="w-full aspect-[4/5] rounded-xl bg-slate-800/70" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-3.5 w-20 rounded bg-purple-900/40" />
                <div className="h-4 w-12 rounded bg-emerald-900/40" />
              </div>
              <div className="h-4 w-4/5 rounded bg-slate-800" />
              <div className="h-3 w-1/2 rounded bg-slate-800/60" />
              <div className="flex gap-2 pt-2">
                <div className="h-9 flex-1 rounded-lg bg-purple-900/30 border border-purple-500/20" />
                <div className="h-9 w-10 rounded-lg bg-slate-800/80" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
