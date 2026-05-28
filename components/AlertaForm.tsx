'use client'
import { useState, useTransition } from 'react'
import { createAlerta } from '@/app/actions/alertas'

const CONDITIONS = [
  { value: 'greater_than', label: 'Es mayor que' },
  { value: 'less_than',    label: 'Es menor que' },
  { value: 'equals',       label: 'Es igual a'   },
  { value: 'changed',      label: 'Cambia'        },
]

interface Props {
  headers: string[]
  defaultEmail: string
  onSuccess: () => void
}

export default function AlertaForm({ headers, defaultEmail, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError]            = useState<string | null>(null)
  const [condition, setCondition]    = useState('greater_than')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)

    startTransition(async () => {
      const res = await createAlerta(formData)
      if (res.ok) {
        onSuccess()
      } else {
        setError(res.error ?? 'Error desconocido.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Columna */}
      <div>
        <label className="label">Columna a monitorear</label>
        <select name="column" className="input-field" required defaultValue="">
          <option value="" disabled>Seleccioná una columna...</option>
          {headers.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
      </div>

      {/* Condición */}
      <div>
        <label className="label">Condición</label>
        <select
          name="condition"
          className="input-field"
          value={condition}
          onChange={e => setCondition(e.target.value)}
        >
          {CONDITIONS.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Umbral — solo si no es "changed" */}
      {condition !== 'changed' && (
        <div>
          <label className="label">Valor</label>
          <input
            type="number"
            name="threshold"
            className="input-field"
            placeholder="Ej: 50000"
            required
          />
        </div>
      )}

      {/* Email */}
      <div>
        <label className="label">Notificar a</label>
        <input
          type="email"
          name="email"
          className="input-field"
          defaultValue={defaultEmail}
          required
        />
      </div>

      {error && (
        <div
          className="text-sm rounded-lg px-4 py-3"
          style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}
        >
          ✗ {error}
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={isPending}>
        {isPending ? 'Creando...' : 'Crear alerta'}
      </button>
    </form>
  )
}
