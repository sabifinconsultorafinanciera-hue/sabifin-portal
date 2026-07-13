'use client'
import { useTransition } from 'react'
import { actualizarEstadoVenta } from '@/app/actions/ventas'
import type { EstadoVenta } from '@/lib/types'

const ESTADOS: { val: EstadoVenta; label: string; color: string; bg: string }[] = [
  { val: 'pendiente',  label: 'Pendiente',  color: '#b45309', bg: '#fef3c7' },
  { val: 'confirmada', label: 'Confirmada', color: '#1d6fa4', bg: '#dbeafe' },
  { val: 'entregada',  label: 'Entregada',  color: '#2d6a4f', bg: '#d1fae5' },
  { val: 'cancelada',  label: 'Cancelada',  color: '#991b1b', bg: '#fee2e2' },
]

export default function EstadoVentaSelector({
  ventaId,
  estadoActual,
}: {
  ventaId: string
  estadoActual: EstadoVenta
}) {
  const [pending, startTransition] = useTransition()

  function cambiar(estado: EstadoVenta) {
    if (estado === estadoActual) return
    startTransition(async () => {
      await actualizarEstadoVenta(ventaId, estado)
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ESTADOS.map(e => {
        const isActive = e.val === estadoActual
        return (
          <button
            key={e.val}
            onClick={() => cambiar(e.val)}
            disabled={pending}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-60"
            style={{
              background: isActive ? e.bg : 'transparent',
              color: isActive ? e.color : 'var(--color-text-muted)',
              border: `2px solid ${isActive ? e.color : 'var(--color-border)'}`,
              fontWeight: isActive ? 700 : 500,
            }}
          >
            {e.label}
          </button>
        )
      })}
    </div>
  )
}
