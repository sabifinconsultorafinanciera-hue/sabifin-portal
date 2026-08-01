export default function AdminLoading() {
  return (
    <div className="p-6 lg:p-8 animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-56 rounded-lg" style={{ background: 'var(--color-border-light)' }} />
        <div className="h-4 w-80 rounded-lg" style={{ background: 'var(--color-border-light)' }} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card space-y-3">
            <div className="h-3 w-20 rounded" style={{ background: 'var(--color-border-light)' }} />
            <div className="h-9 w-12 rounded" style={{ background: 'var(--color-border-light)' }} />
          </div>
        ))}
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border-light">
          <div className="h-5 w-36 rounded" style={{ background: 'var(--color-border-light)' }} />
        </div>
        <div className="p-5 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 rounded-lg" style={{ background: 'var(--color-border-light)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
