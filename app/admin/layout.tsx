export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-lg font-semibold">G3 Backoffice</p>
            <p className="text-xs text-slate-500">Area amministrazione interna</p>
          </div>
          <span className="rounded border border-slate-300 bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
            Demo mode
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-6 py-8">{children}</main>
    </div>
  )
}
