import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import Link from 'next/link'
import type { Producto } from '@/lib/types'

export const metadata = { title: 'Stock' }

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

export default async function StockPage() {
  const session = await verifySession()
  if (!session.empresaId) return null

  const snap = await adminDb
    .collection('empresas').doc(session.empresaId)
    .collection('productos')
    .orderBy('nombre')
    .get()

  const productos = snap.docs.map(d => d.data() as Producto)
  const activos   = productos.filter(p => p.activo)

  const totalSku    = activos.length
  const sinStock    = activos.filter(p => p.stockActual <= 0).length
  const critico     = activos.filter(p => p.stockActual > 0 && p.stockActual <= p.stockMinimo).length
  const valorStock  = activos.reduce((s, p) => s + p.stockActual * p.precioCompra, 0)

  function estadoStock(p: Producto) {
    if (p.stockActual <= 0)                      return { label: 'Sin stock',  color: '#c0392b' }
    if (p.stockActual <= p.stockMinimo)           return { label: 'Crítico',   color: '#b5893a' }
    return                                               { label: 'Normal',    color: '#2d6a4f' }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Stock</h1>
          <p className="text-sm text-text-secondary mt-1">{totalSku} productos activos</p>
        </div>
        {session.rol !== 'vendedor' && (
          <Link href="/dashboard/stock/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'var(--color-brand-green)' }}>
            + Nuevo producto
          </Link>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Total productos</p>
          <p className="text-2xl font-bold text-brand-green">{totalSku}</p>
        </div>
        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Sin stock</p>
          <p className="text-2xl font-bold" style={{ color: sinStock > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>{sinStock}</p>
        </div>
        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Stock crítico</p>
          <p className="text-2xl font-bold" style={{ color: critico > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>{critico}</p>
        </div>
        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Valor en stock</p>
          <p className="text-lg font-bold truncate text-text-primary">{formatMoney(valorStock)}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-bg-subtle, #f8f7f4)', borderBottom: '1px solid var(--color-border-light)' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Producto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Categoría</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Stock</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Mínimo</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">P. Venta</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Estado</th>
                {session.rol !== 'vendedor' && (
                  <th className="px-4 py-3"></th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {activos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-text-muted">
                    No hay productos registrados todavía.{' '}
                    {session.rol !== 'vendedor' && (
                      <Link href="/dashboard/stock/nuevo" style={{ color: 'var(--color-brand-green)' }}>
                        Agregar el primero →
                      </Link>
                    )}
                  </td>
                </tr>
              ) : activos.map(p => {
                const estado = estadoStock(p)
                return (
                  <tr key={p.id} style={{ transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8f7f4'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                    <td className="px-5 py-3 font-medium text-text-primary">{p.nombre}</td>
                    <td className="px-4 py-3 text-text-muted font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3 text-text-secondary">{p.categoria}</td>
                    <td className="px-4 py-3 text-right font-semibold" style={{ color: estado.color }}>
                      {p.stockActual} <span className="text-xs font-normal text-text-muted">{p.unidad}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-text-muted">
                      {p.stockMinimo} <span className="text-xs">{p.unidad}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-text-primary">{formatMoney(p.precioVenta)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: `${estado.color}18`, color: estado.color }}>
                        {estado.label}
                      </span>
                    </td>
                    {session.rol !== 'vendedor' && (
                      <td className="px-4 py-3 text-right">
                        <Link href={`/dashboard/stock/${p.id}`} className="text-xs font-medium"
                          style={{ color: 'var(--color-brand-green)' }}>
                          Editar
                        </Link>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
