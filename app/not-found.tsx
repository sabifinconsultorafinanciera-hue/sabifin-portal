import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: 'var(--color-bg-page)' }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-center rounded-2xl mb-8"
        style={{ background: '#2e2c2b', width: 64, height: 64 }}
      >
        <span className="font-black text-lg leading-none" style={{ color: '#e8e3d8' }}>SF</span>
      </div>

      {/* Número */}
      <p
        className="font-black leading-none mb-4"
        style={{ fontSize: '7rem', color: 'var(--color-border-medium)' }}
      >
        404
      </p>

      <h1 className="text-2xl font-bold text-text-primary mb-2">
        Página no encontrada
      </h1>
      <p className="text-text-secondary text-sm max-w-sm mb-8">
        La dirección que ingresaste no existe o fue movida. Volvé al inicio.
      </p>

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
        style={{ background: 'var(--color-brand-green)', color: '#fff' }}
      >
        ← Volver al dashboard
      </Link>
    </div>
  )
}
