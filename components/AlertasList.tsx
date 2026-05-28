'use client'
import { useTransition, useState } from 'react'
import { toggleAlerta, deleteAlerta } from '@/app/actions/alertas'

const CONDITION_LABELS: Record<string, string> = {
  greater_than: 'Mayor que',
  less_than:    'Menor que',
  equals:       'Igual a',
  changed:      'Cambia',
}

interface Alert {
  id: string
  column: string
  condition: string
  threshold?: number | null
  email: string
  active: boolean
}

interface Props { alerts: Alert[] }

export default function AlertasList({ alerts }: Props) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId]  = useState<string | null>(null)

  function handleToggle(id: string, current: boolean) {
    startTransition(() => toggleAlerta(id, !current))
  }

  function handleDelete(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      await deleteAlerta(id)
      setDeletingId(null)
    })
  }

  return (
    <div className="space-y-3">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className="card flex items-center gap-4"
          style={{ opacity: deletingId === alert.id ? 0.5 : 1 }}
        >
          {/* Toggle activo */}
          <button
            type="button"
            onClick={() => handleToggle(alert.id, alert.active)}
            disabled={isPending}
            className="shrink-0 w-10 h-6 rounded-full transition-colors relative"
            style={{ background: alert.active ? 'var(--color-success)' : 'var(--color-border-medium)' }}
            aria-label={alert.active ? 'Desactivar' : 'Activar'}
          >
            <span
              className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
              style={{ left: alert.active ? '22px' : '2px' }}
            />
          </button>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">
              {alert.column}
              <span className="font-normal text-text-secondary ml-2">
                {CONDITION_LABELS[alert.condition] ?? alert.condition}
                {alert.threshold != null && ` $${alert.threshold.toLocaleString('es-AR')}`}
              </span>
            </p>
            <p className="text-xs text-text-muted mt-0.5">→ {alert.email}</p>
          </div>

          {/* Estado */}
          <span
            className="text-xs px-2 py-1 rounded-full shrink-0"
            style={{
              background: alert.active ? 'var(--color-success-bg)' : 'var(--color-bg-page)',
              color: alert.active ? '#1B4332' : 'var(--color-text-muted)',
            }}
          >
            {alert.active ? 'Activa' : 'Pausada'}
          </span>

          {/* Eliminar */}
          <button
            type="button"
            onClick={() => handleDelete(alert.id)}
            disabled={isPending}
            className="text-text-muted hover:text-red-500 transition-colors text-lg leading-none shrink-0"
            aria-label="Eliminar alerta"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
