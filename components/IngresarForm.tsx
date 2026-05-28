'use client'
import { useState, useTransition, useRef } from 'react'
import { ingresarFila } from '@/app/actions/sheets'

// ── Constantes ─────────────────────────────────────────────
const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]
const mesActual = MESES[new Date().getMonth()]
const fechaHoy  = new Date().toISOString().split('T')[0]

// ── Detección automática de tipo de campo ──────────────────
type FieldType = 'movimiento' | 'mes' | 'fecha' | 'monto' | 'text'

function getFieldType(header: string): FieldType {
  const h = header.toLowerCase()
  if (['movimiento', 'tipo', 'type'].some(t => h.includes(t)))              return 'movimiento'
  if (['mes', 'month'].some(t => h.includes(t)))                             return 'mes'
  if (['fecha', 'date'].some(t => h.includes(t)))                            return 'fecha'
  if (['monto', 'valor', 'importe', 'total', 'amount'].some(t => h.includes(t))) return 'monto'
  return 'text'
}

// ── Componente ─────────────────────────────────────────────
interface Props { headers: string[] }

export default function IngresarForm({ headers }: Props) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult]          = useState<{ ok: boolean; error?: string } | null>(null)
  const formRef                      = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setResult(null)

    startTransition(async () => {
      const res = await ingresarFila(formData)
      setResult(res)
      if (res.ok) formRef.current?.reset()
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">

      {/* Encabezados ocultos para el Server Action */}
      <input type="hidden" name="__headers" value={headers.join('|')} />

      {/* Campos dinámicos según los headers del Sheet */}
      {headers.map(header => {
        const type = getFieldType(header)
        return (
          <div key={header}>
            <label className="label">{header}</label>

            {type === 'movimiento' && (
              <select name={header} className="input-field" required defaultValue="">
                <option value="" disabled>Seleccioná...</option>
                <option value="INGRESO">INGRESO</option>
                <option value="EGRESO">EGRESO</option>
              </select>
            )}

            {type === 'mes' && (
              <select name={header} className="input-field" defaultValue={mesActual}>
                {MESES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            )}

            {type === 'fecha' && (
              <input
                type="date"
                name={header}
                className="input-field"
                defaultValue={fechaHoy}
              />
            )}

            {type === 'monto' && (
              <input
                type="number"
                name={header}
                className="input-field"
                placeholder="0"
                min="0"
                step="1"
                required
              />
            )}

            {type === 'text' && (
              <input
                type="text"
                name={header}
                className="input-field"
                placeholder={header}
              />
            )}
          </div>
        )
      })}

      {/* Feedback */}
      {result?.ok && (
        <div
          className="text-sm rounded-lg px-4 py-3"
          style={{ background: 'var(--color-success-bg)', color: '#1B4332' }}
        >
          ✓ Registro guardado correctamente en tu hoja.
        </div>
      )}
      {result?.error && (
        <div
          className="text-sm rounded-lg px-4 py-3"
          style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}
        >
          ✗ {result.error}
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Guardar registro'}
      </button>

    </form>
  )
}
