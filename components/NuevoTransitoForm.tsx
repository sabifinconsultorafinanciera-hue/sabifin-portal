'use client'
import { useState } from 'react'
import { crearTransito } from '@/app/actions/transito'

const UNIDADES = ['unidad', 'kg', 'm', 'm2', 'caja', 'rollo', 'par']

export default function NuevoTransitoForm() {
  const [items, setItems] = useState([{ nombre: '', cantidad: 1, unidad: 'unidad' }])
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  function addItem() {
    setItems(p => [...p, { nombre: '', cantidad: 1, unidad: 'unidad' }])
  }
  function removeItem(i: number) {
    setItems(p => p.filter((_, idx) => idx !== i))
  }
  function updateItem(i: number, field: string, val: string | number) {
    setItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setPending(true)
    const formData = new FormData(e.currentTarget)
    // Agregar items manualmente
    items.forEach(item => {
      formData.append('itemNombre', item.nombre)
      formData.append('itemCantidad', String(item.cantidad))
      formData.append('itemUnidad', item.unidad)
    })
    const res = await crearTransito(formData)
    setPending(false)
    if (res && !res.ok) setError(res.error ?? 'Error')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <div className="card space-y-4">
        <h2 className="font-semibold text-text-primary">Tipo de pedido</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: 'fabricacion', label: 'Fabricación', desc: 'Ropa, textil a medida' },
            { val: 'importacion', label: 'Importación', desc: 'Mercadería del exterior' },
            { val: 'compra',      label: 'Compra',      desc: 'Proveedor local' },
          ].map(opt => (
            <label key={opt.val} className="relative cursor-pointer">
              <input type="radio" name="tipo" value={opt.val} required className="sr-only peer" defaultChecked={opt.val === 'compra'} />
              <div className="p-3 rounded-lg border-2 text-center transition-all peer-checked:border-brand-green"
                style={{ borderColor: 'var(--color-border)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-brand-green)'}
                onMouseLeave={e => {}}>
                <p className="text-sm font-semibold text-text-primary">{opt.label}</p>
                <p className="text-xs text-text-muted mt-0.5">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-text-primary">Datos del pedido</h2>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Proveedor *</label>
          <input name="proveedor" required placeholder="Nombre del proveedor / fábrica"
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Descripción</label>
          <input name="descripcion" placeholder="Descripción del pedido (opcional)"
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Fecha estimada de llegada *</label>
          <input name="fechaEstimada" type="date" required
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Notas</label>
          <textarea name="notas" rows={2} placeholder="Condiciones, observaciones..."
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-text-primary">Productos</h2>
          <button type="button" onClick={addItem}
            className="text-sm font-medium px-3 py-1 rounded-lg"
            style={{ background: 'var(--color-green-100)', color: 'var(--color-brand-green)' }}>
            + Agregar
          </button>
        </div>
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
            <input value={item.nombre} onChange={e => updateItem(i, 'nombre', e.target.value)}
              placeholder="Producto" required
              className="flex-1 min-w-0 px-2 py-1.5 rounded text-sm border"
              style={{ border: '1px solid var(--color-border)' }} />
            <input type="number" min="1" value={item.cantidad}
              onChange={e => updateItem(i, 'cantidad', Number(e.target.value))}
              className="w-20 px-2 py-1.5 rounded text-sm border text-center"
              style={{ border: '1px solid var(--color-border)' }} />
            <select value={item.unidad} onChange={e => updateItem(i, 'unidad', e.target.value)}
              className="w-24 px-2 py-1.5 rounded text-sm border"
              style={{ border: '1px solid var(--color-border)' }}>
              {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            {items.length > 1 && (
              <button type="button" onClick={() => removeItem(i)}
                className="text-text-muted hover:text-error text-lg shrink-0">×</button>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm px-4 py-3 rounded-lg" style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}>
          {error}
        </p>
      )}

      <button type="submit" disabled={pending}
        className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: 'var(--color-brand-green)' }}>
        {pending ? 'Guardando...' : 'Registrar pedido'}
      </button>
    </form>
  )
}
