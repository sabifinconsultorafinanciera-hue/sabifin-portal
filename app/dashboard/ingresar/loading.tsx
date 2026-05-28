export default function IngresarLoading() {
  return (
    <div className="p-6 lg:p-8 animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg" style={{ background: 'var(--color-border-light)' }} />
        <div className="h-4 w-80 rounded-lg" style={{ background: 'var(--color-border-light)' }} />
      </div>
      <div className="max-w-lg">
        <div className="card space-y-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-28 rounded" style={{ background: 'var(--color-border-light)' }} />
              <div className="h-10 rounded-lg" style={{ background: 'var(--color-border-light)' }} />
            </div>
          ))}
          <div className="h-11 rounded-lg" style={{ background: 'var(--color-border-light)' }} />
        </div>
      </div>
    </div>
  )
}
