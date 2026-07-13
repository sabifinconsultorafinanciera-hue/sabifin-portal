'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearVenta } from '@/app/actions/ventas'
import type { Producto, ItemVenta } from '@/lib/types'

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

interface Props { productos: Producto[] }

export default function NuevaVentaForm({ productos }: Props) {
  const router = useRouter()
  const today  = new Date().toISOString().slice(0, 10)

  const [cliente, setCliente] = useState('')
  const [fecha, setFecha]     = useState(today)
  const [notas, setNotas]     = useState('')
  const [items, setItems]     = useState<ItemVenta[]>([])
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const total = items.reduce((s, i) => s + i.subtotal, 0)

  function addItem() {
    if (productos.length === 0) return
    const p = productos[0]
    setItems(prev => [...prev, {
      productoId:     p.id,
      productoNombre: p.nombre,
      cantidad:       1,
      precioUnitario: p.precioVenta,
      subtotal:       p.precioVenta,
    }])
  }

  function updateItem(idx: number, field: keyof ItemVenta, value: string | number) {
    setItems(prev => {
      const next = [...prev]
      const item = { ...next[idx], [field]: value }

      if (field === 'productoId') {
        const prod = productos.find(p => p.id === value)
        if (prod) {
          item.productoNombre = prod.nombre
          item.precioUnitario = prod.precioVenta
          item.subtotal       = prod.precioVenta * item.cantidad
        }
      }
      if (field === 'cantidad')       item.subtotal = Number(value) * item.precioUnitario
      if (field === 'precioUnitario') item.subtotal = item.cantidad * Number(value)

      next[idx] = item
      return next
    })
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!cliente.trim())  return setError('Ingresá el nombre del cliente.')
    if (items.length === 0) return setError('Agregá al menos un producto.')

    setLoading(true)
    const res = await crearVenta({ clienteNombre: cliente, fecha, items, notas })
    setLoading(false)

    if (res.ok) {
      router.push('/dashboard/ventas')
    } else {
      setError(res.error ?? 'Error al guardar.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Datos básicos */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-text-primary">Datos de la venta</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Cliente *</label>
            <input
              type="text" value={cliente} onChange={e => setCliente(e.target.value)}
              placeholder="Nombre del cliente"
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none transition-all"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg-input, #fff)' }}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Fecha *</label>
            <input
              type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg-input, #fff)' }}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Notas</label>
          <textarea
            value={notas} onChange={e => setNotas(e.target.value)}
            rows={2} placeholder="Observaciones, condiciones de pago..."
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
            style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg-input, #fff)' }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-text-primary">Productos</h2>
          <button type="button" onClick={addItem}
            className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: 'var(--color-green-100)', color: 'var(--color-brand-green)' }}
            disabled={productos.length === 0}>
            + Agregar producto
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-center py-6 text-text-muted">
            {productos.length === 0
              ? 'No hay productos en stock. Primero cargá productos.'
              : 'Hacé clic en "+ Agregar producto" para empezar.'}
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-start flex-wrap sm:flex-nowrap"
                style={{ padding: '12px', background: '#f8f7f4', borderRadius: 8 }}>

                {/* Producto */}
                <select
                  value={item.productoId}
                  onChange={e => updateItem(idx, 'productoId', e.target.value)}
                  className="flex-1 min-w-0 px-2 py-1.5 rounded text-sm border"
                  style={{ border: '1px solid var(--color-border)', background: '#fff' }}>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (stock: {p.stockActual} {p.unidad})
                    </option>
                  ))}
                </select>

                {/* Cantidad */}
                <input
                  type="number" min="1" value={item.cantidad}
                  onChange={e => updateItem(idx, 'cantidad', Number(e.target.value))}
                  className="w-20 px-2 py-1.5 rounded text-sm border text-center"
                  style={{ border: '1px solid var(--color-border)', background: '#fff' }}
                  placeholder="Cant."
                />

                {/* Precio */}
                <input
                  type="number" min="0" value={item.precioUnitario}
                  onChange={e => updateItem(idx, 'precioUnitario', Number(e.target.value))}
                  className="w-28 px-2 py-1.5 rounded text-sm border text-right"
                  style={{ border: '1px solid var(--color-border)', background: '#fff' }}
                  placeholder="Precio"
                />

                {/* Subtotal */}
                <div className="w-28 text-right text-sm font-semibold pt-1.5 shrink-0"
                  style={{ color: 'var(--color-success)' }}>
                  {formatMoney(item.subtotal)}
                </div>

                <button type="button" onClick={() => removeItem(idx)}
                  className="shrink-0 text-text-muted hover:text-error transition-colors pt-1.5 text-base"
                  style={{ lineHeight: 1 }}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="flex justify-end pt-2 border-t border-border-light">
            <div className="text-right">
              <p className="text-xs text-text-muted uppercase tracking-wide">Total</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>{formatMoney(total)}</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm px-4 py-3 rounded-lg" style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}>
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()}
          className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary border transition-colors"
          style={{ border: '1px solid var(--color-border)' }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ background: 'var(--color-brand-green)' }}>
          {loading ? 'Guardando...' : 'Registrar venta'}
        </button>
      </div>
    </form>
  )
}
