'use client'
import { useState, useEffect } from 'react'
import AlertaForm from '@/components/AlertaForm'
import AlertasList from '@/components/AlertasList'

// ── Tipos ──────────────────────────────────────────────────
interface Alert {
  id: string; column: string; condition: string
  threshold?: number | null; email: string; active: boolean
}

interface PageData {
  alerts: Alert[]
  headers: string[]
  email: string
}

export default function AlertasPage() {
  const [data, setData]           = useState<PageData | null>(null)
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [error, setError]         = useState<string | null>(null)

  async function fetchData() {
    try {
      const res = await fetch('/api/alertas')
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      setError('No se pudo cargar la información.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded-lg" style={{ background: 'var(--color-border-light)' }} />
        <div className="h-4 w-72 rounded-lg" style={{ background: 'var(--color-border-light)' }} />
        <div className="h-20 rounded-xl" style={{ background: 'var(--color-border-light)' }} />
        <div className="h-20 rounded-xl" style={{ background: 'var(--color-border-light)' }} />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6 lg:p-8">
        <div className="card text-center py-12 text-sm" style={{ color: 'var(--color-error)', background: 'var(--color-error-bg)' }}>
          {error ?? 'Error cargando alertas.'}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Alertas</h1>
          <p className="text-sm text-text-secondary mt-1">
            Te notificamos por email cuando se cumple una condición en tus datos.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--color-brand-green)', color: '#fff' }}
          >
            + Nueva alerta
          </button>
        )}
      </div>

      {/* Formulario nueva alerta */}
      {showForm && (
        <div className="card max-w-lg">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-text-primary">Nueva alerta</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-text-muted hover:text-text-primary text-xl leading-none"
            >
              ×
            </button>
          </div>
          <AlertaForm
            headers={data.headers}
            defaultEmail={data.email}
            onSuccess={() => { setShowForm(false); setLoading(true); fetchData() }}
          />
        </div>
      )}

      {/* Lista de alertas */}
      {data.alerts.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">◉</p>
          <p className="font-semibold text-text-primary">No tenés alertas configuradas</p>
          <p className="text-sm text-text-muted mt-1">
            Creá una alerta para recibir notificaciones por email automáticamente.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--color-green-100)', color: 'var(--color-brand-green)' }}
          >
            + Crear primera alerta
          </button>
        </div>
      ) : (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-3">
            {data.alerts.length} {data.alerts.length === 1 ? 'alerta configurada' : 'alertas configuradas'}
          </p>
          <AlertasList
            alerts={data.alerts}
          />
        </div>
      )}

      {/* Info */}
      <div
        className="rounded-lg px-4 py-3 text-xs"
        style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}
      >
        ◎ Las alertas se verifican automáticamente cada vez que se actualizan los datos del Sheet.
      </div>

    </div>
  )
}
