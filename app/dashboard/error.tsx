'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="p-6 lg:p-8 flex items-center justify-center min-h-96">
      <div className="card max-w-sm w-full text-center space-y-4">
        <p className="text-3xl">⚠</p>
        <h2 className="text-lg font-bold text-text-primary">Error al cargar</h2>
        <p className="text-sm text-text-secondary">
          No se pudo cargar esta sección. Intentá de nuevo o volvé al inicio.
        </p>
        {error.digest && (
          <p className="text-xs text-text-muted font-mono">ID: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'var(--color-brand-green)' }}>
            Reintentar
          </button>
          <Link href="/dashboard"
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text-primary)' }}>
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
