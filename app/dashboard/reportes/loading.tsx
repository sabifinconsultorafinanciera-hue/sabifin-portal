export default function ReportesLoading() {
  return (
    <div className="p-6 lg:p-8 animate-pulse space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg" style={{ background: 'var(--color-border-light)' }} />
        <div className="h-4 w-80 rounded-lg" style={{ background: 'var(--color-border-light)' }} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card space-y-3">
            <div className="h-3 w-24 rounded" style={{ background: 'var(--color-border-light)' }} />
            <div className="h-7 w-28 rounded" style={{ background: 'var(--color-border-light)' }} />
          </div>
        ))}
      </div>
      <div className="card" style={{ height: 340 }}>
        <div className="h-5 w-48 rounded mb-2" style={{ background: 'var(--color-border-light)' }} />
        <div className="h-full rounded-lg mt-4" style={{ background: 'var(--color-border-light)' }} />
      </div>
    </div>
  )
}
