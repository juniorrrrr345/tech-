export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a1630] text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold tracking-wide">TECH+</span>
          <span className="text-xs opacity-70">PARIS</span>
        </div>
        <a href="/admin" className="rounded-lg bg-white/5 px-3 py-1 text-xs hover:bg-white/10">Admin</a>
      </div>
    </header>
  );
}