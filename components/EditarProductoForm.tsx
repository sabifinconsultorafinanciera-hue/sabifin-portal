'use client'
import { actualizarProducto } from '@/app/actions/productos'
import type { Producto } from '@/lib/types'
import { useState, useTransition } from 'react'

const UNIDADES = ['unidad', 'kg', 'm', 'm2', 'caja', 'rollo', 'par']

export default function EditarProductoForm({ productoId, producto }: { productoId: string; producto: Producto }) {
  const [ok, setOk]       = useState(false)
  const [error, setError] = useState('')
  const [pending, start]  = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(''); setOk(false)
    start(async () => {
      const res = await actualizarProducto(productoId, new FormData(e.currentTarget as HTMLFormElement))
      if (res.ok) setOk(true)
      else setError(res.error ?? 'Error')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Nombre *</label>
          <input name="nombre" required defaultValue={producto.nombre}
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">SKU *</label>
          <input name="sku" required defaultValue={producto.sku}
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Categoría</label>
          <input name="categoria" defaultValue={producto.categoria}
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Unidad</label>
          <select name="unidad" defaultValue={producto.unidad}
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }}>
            {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Stock mínimo</label>
          <input name="stockMinimo" type="number" min="0" defaultValue={producto.stockMinimo}
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Precio compra</label>
          <input name="precioCompra" type="number" min="0" step="any" defaultValue={producto.precioCompra}
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Precio venta</label>
          <input name="precioVenta" type="number" min="0" step="any" defaultValue={producto.precioVenta}
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
      </div>

      {error && <p className="text-sm px-4 py-3 rounded-lg" style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}>{error}</p>}
      {ok    && <p className="text-sm px-4 py-3 rounded-lg" style={{ background: '#d1fae5', color: '#2d6a4f' }}>Producto actualizado.</p>}

      <button type="submit" disabled={pending}
        className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: 'var(--color-brand-green)' }}>
        {pending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
