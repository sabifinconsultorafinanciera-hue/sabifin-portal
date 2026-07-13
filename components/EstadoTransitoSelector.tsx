'use client'
import { useState, useTransition } from 'react'
import { actualizarEstadoTransito } from '@/app/actions/transito'
import type { TipoTransito, EstadoTransito } from '@/lib/types'

const ESTADOS_POR_TIPO: Record<TipoTransito, EstadoTransito[]> = {
  fabricacion: ['en_produccion', 'listo_embarque', 'en_deposito', 'recibido'],
  importacion: ['en_transito', 'en_aduana', 'en_deposito', 'recibido'],
  compra:      ['en_transito', 'en_deposito', 'recibido'],
}

const ESTADO_LABEL: Record<EstadoTransito, string> = {
  en_produccion:  'En producción',
  listo_embarque: 'Listo p/ embarque',
  en_transito:    'En tránsito',
  en_aduana:      'En aduana',
  en_deposito:    'En depósito',
  recibido:       'Recibido ✓',
}

export default function EstadoTransitoSelector({
  transitoId, estadoActual, tipo,
}: {
  transitoId:   string
  estadoActual: EstadoTransito
  tipo:         TipoTransito
}) {
  const [estado, setEstado] = useState(estadoActual)
  const [pending, startTransition] = useTransition()

  const opciones = ESTADOS_POR_TIPO[tipo]

  function handleChange(nuevoEstado: EstadoTransito) {
    setEstado(nuevoEstado)
    startTransition(async () => {
      await actualizarEstadoTransito(transitoId, nuevoEstado)
    })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <p className="text-xs text-text-muted">Actualizar estado:</p>
      <div className="flex gap-1 flex-wrap">
        {opciones.map(op => (
          <button key={op} onClick={() => handleChange(op)}
            disabled={pending || op === estado}
            className="text-xs px-2 py-1 rounded transition-all disabled:opacity-50"
            style={{
              background: op === estado ? 'var(--color-brand-green)' : 'var(--color-green-100)',
              color:      op === estado ? '#fff' : 'var(--color-brand-green)',
              fontWeight: op === estado ? 600 : 400,
            }}>
            {ESTADO_LABEL[op]}
          </button>
        ))}
      </div>
    </div>
  )
}
