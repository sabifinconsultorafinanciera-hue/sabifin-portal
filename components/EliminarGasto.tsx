'use client'
import { useState, useTransition } from 'react'
import { eliminarGasto } from '@/app/actions/gastos'

export default function EliminarGasto({ gastoId }: { gastoId: string }) {
  const [confirm, setConfirm]   = useState(false)
  const [pending, startTransition] = useTransition()

  if (!confirm) {
    return (
      <button onClick={() => setConfirm(true)}
        className="text-xs text-text-muted hover:text-error transition-colors">
        Eliminar
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-muted">¿Seguro?</span>
      <button onClick={() => setConfirm(false)} className="text-xs text-text-muted">No</button>
      <button
        disabled={pending}
        onClick={() => startTransition(() => eliminarGasto(gastoId))}
        className="text-xs font-medium disabled:opacity-50"
        style={{ color: 'var(--color-error)' }}>
        Sí, eliminar
      </button>
    </div>
  )
}
