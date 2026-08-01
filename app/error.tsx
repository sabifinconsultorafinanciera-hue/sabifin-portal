'use client'
import { useEffect } from 'react'

export default function GlobalError({
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
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-bg-page)' }}>
      <div className="card max-w-md w-full text-center space-y-4">
        <p className="text-4xl">⚠</p>
        <h1 className="text-xl font-bold text-text-primary">Ocurrió un error</h1>
        <p className="text-sm text-text-secondary">
          Algo salió mal. Podés intentar de nuevo o contactar a Sabifin si el problema persiste.
        </p>
        {error.digest && (
          <p className="text-xs text-text-muted font-mono">ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'var(--color-brand-green)' }}>
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}
