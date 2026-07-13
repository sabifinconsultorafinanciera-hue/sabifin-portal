'use client'
import { useRouter } from 'next/navigation'
import { crearProducto } from '@/app/actions/productos'
import { useState } from 'react'

const UNIDADES = ['unidad', 'kg', 'm', 'm2', 'caja', 'rollo', 'par']

export default function NuevoProductoForm() {
  const router = useRouter()
  const [error, setError]   = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setPending(true)
    const res = await crearProducto(new FormData(e.currentTarget))
    setPending(false)
    if (res && !res.ok) setError(res.error ?? 'Error')
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Nombre *</label>
          <input name="nombre" required placeholder="Nombre del producto"
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">SKU *</label>
          <input name="sku" required placeholder="Código interno"
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Categoría</label>
          <input name="categoria" placeholder="Ej: Remeras, Repuestos, etc."
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Unidad de medida</label>
          <select name="unidad" className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }}>
            {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Stock actual</label>
          <input name="stockActual" type="number" min="0" defaultValue="0"
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Stock mínimo</label>
          <input name="stockMinimo" type="number" min="0" defaultValue="0"
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Precio de compra</label>
          <input name="precioCompra" type="number" min="0" step="any" defaultValue="0"
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Precio de venta</label>
          <input name="precioVenta" type="number" min="0" step="any" defaultValue="0"
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
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
          {pending ? 'Guardando...' : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}
