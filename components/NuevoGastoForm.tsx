'use client'
import { useRouter } from 'next/navigation'
import { crearGasto } from '@/app/actions/gastos'
import { useState } from 'react'

const CATEGORIAS = [
  { val: 'sueldos',   label: 'Sueldos' },
  { val: 'alquiler',  label: 'Alquiler' },
  { val: 'servicios', label: 'Servicios' },
  { val: 'logistica', label: 'Logística' },
  { val: 'marketing', label: 'Marketing' },
  { val: 'impuestos', label: 'Impuestos' },
  { val: 'compras',   label: 'Compras' },
  { val: 'otros',     label: 'Otros' },
]

export default function NuevoGastoForm() {
  const router  = useRouter()
  const today   = new Date().toISOString().slice(0, 10)
  const [error, setError]   = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setPending(true)
    const res = await crearGasto(new FormData(e.currentTarget))
    setPending(false)
    if (res && !res.ok) setError(res.error ?? 'Error')
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Fecha *</label>
          <input name="fecha" type="date" defaultValue={today} required
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Monto *</label>
          <input name="monto" type="number" min="1" step="any" required placeholder="0"
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Categoría *</label>
        <select name="categoria" required
          className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
          style={{ border: '1px solid var(--color-border)' }}>
          {CATEGORIAS.map(c => <option key={c.val} value={c.val}>{c.label}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Descripción *</label>
        <input name="descripcion" required placeholder="Ej: Alquiler depósito enero"
          className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
          style={{ border: '1px solid var(--color-border)' }} />
      </div>

      {error && (
        <p className="text-sm px-4 py-3 rounded-lg" style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}>
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.back()}
          className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary border"
          style={{ border: '1px solid var(--color-border)' }}>
          Cancelar
        </button>
        <button type="submit" disabled={pending}
          className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: 'var(--color-brand-green)' }}>
          {pending ? 'Guardando...' : 'Registrar gasto'}
        </button>
      </div>
    </form>
  )
}
