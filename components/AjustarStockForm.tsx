'use client'
import { ajustarStock } from '@/app/actions/productos'
import { useState, useTransition } from 'react'

export default function AjustarStockForm({ productoId, stockActual }: { productoId: string; stockActual: number }) {
  const [cantidad, setCantidad] = useState('')
  const [tipo, setTipo]         = useState<'sumar' | 'restar'>('sumar')
  const [ok, setOk]             = useState(false)
  const [error, setError]       = useState('')
  const [pending, start]        = useTransition()

  const preview = stockActual + (tipo === 'sumar' ? Number(cantidad) : -Number(cantidad))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cantidad || Number(cantidad) <= 0) { setError('Ingresá una cantidad válida.'); return }
    setError(''); setOk(false)
    start(async () => {
      const delta = tipo === 'sumar' ? Number(cantidad) : -Number(cantidad)
      const res = await ajustarStock(productoId, delta, tipo)
      if (res.ok) { setOk(true); setCantidad('') }
      else setError(res.error ?? 'Error')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <button type="button" onClick={() => setTipo('sumar')}
          className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: tipo === 'sumar' ? '#d1fae5' : 'transparent',
            color: tipo === 'sumar' ? '#2d6a4f' : 'var(--color-text-muted)',
            border: `2px solid ${tipo === 'sumar' ? '#2d6a4f' : 'var(--color-border)'}`,
          }}>
          + Agregar
        </button>
        <button type="button" onClick={() => setTipo('restar')}
          className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: tipo === 'restar' ? '#fee2e2' : 'transparent',
            color: tipo === 'restar' ? '#991b1b' : 'var(--color-text-muted)',
            border: `2px solid ${tipo === 'restar' ? '#991b1b' : 'var(--color-border)'}`,
          }}>
          − Restar
        </button>
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-text-secondary mb-1">Cantidad</label>
          <input type="number" min="1" value={cantidad} onChange={e => { setCantidad(e.target.value); setOk(false) }}
            placeholder="0"
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
        <div className="text-sm text-text-muted pb-2">
          Resultado: <strong className="text-text-primary">{cantidad ? preview : stockActual}</strong>
        </div>
      </div>

      {error && <p className="text-sm px-4 py-3 rounded-lg" style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}>{error}</p>}
      {ok    && <p className="text-sm px-4 py-3 rounded-lg" style={{ background: '#d1fae5', color: '#2d6a4f' }}>Stock actualizado correctamente.</p>}

      <button type="submit" disabled={pending}
        className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: 'var(--color-brand-green)' }}>
        {pending ? 'Aplicando...' : 'Aplicar ajuste'}
      </button>
    </form>
  )
}
