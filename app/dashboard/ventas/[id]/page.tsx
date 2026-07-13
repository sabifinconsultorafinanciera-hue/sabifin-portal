import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Venta, EstadoVenta } from '@/lib/types'
import EstadoVentaSelector from '@/components/EstadoVentaSelector'

export const metadata = { title: 'Detalle de venta' }

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

const ESTADO_LABEL: Record<EstadoVenta, string> = {
  pendiente:  'Pendiente',
  confirmada: 'Confirmada',
  entregada:  'Entregada',
  cancelada:  'Cancelada',
}

const ESTADO_COLOR: Record<EstadoVenta, string> = {
  pendiente:  '#b45309',
  confirmada: '#1d6fa4',
  entregada:  '#2d6a4f',
  cancelada:  '#991b1b',
}

const ESTADO_BG: Record<EstadoVenta, string> = {
  pendiente:  '#fef3c7',
  confirmada: '#dbeafe',
  entregada:  '#d1fae5',
  cancelada:  '#fee2e2',
}

export default async function VentaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await verifySession()
  if (!session.empresaId) return null

  const snap = await adminDb
    .collection('empresas').doc(session.empresaId)
    .collection('ventas').doc(id)
    .get()

  if (!snap.exists) notFound()
  const venta = snap.data() as Venta

  return (
    <div className="p-6 lg:p-8 max-w-2xl">

      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/ventas" className="text-text-muted hover:text-text-primary transition-colors text-lg">←</Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-text-primary truncate">
            {venta.clienteNombre}
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            {new Date(venta.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
            {' · '}Vendedor: {venta.vendedorNombre}
          </p>
        </div>
        <span
          className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ background: ESTADO_BG[venta.estado], color: ESTADO_COLOR[venta.estado] }}
        >
          {ESTADO_LABEL[venta.estado]}
        </span>
      </div>

      {/* Items */}
      <div className="card p-0 overflow-hidden mb-4">
        <div className="px-5 py-3 border-b border-border-light">
          <h2 className="font-semibold text-text-primary text-sm">Productos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f8f7f4', borderBottom: '1px solid var(--color-border-light)' }}>
                <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted">Producto</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-text-muted">Cant.</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-text-muted">P. Unit.</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-text-muted">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {venta.items.map((item, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 font-medium text-text-primary">{item.productoNombre}</td>
                  <td className="px-4 py-3 text-right text-text-secondary">{item.cantidad}</td>
                  <td className="px-4 py-3 text-right text-text-secondary">{formatMoney(item.precioUnitario)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-text-primary">{formatMoney(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--color-border)' }}>
                <td colSpan={3} className="px-4 py-3 text-right font-semibold text-text-secondary">Total</td>
                <td className="px-4 py-3 text-right text-xl font-bold" style={{ color: 'var(--color-brand-green)' }}>
                  {formatMoney(venta.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Notas */}
      {venta.notas && (
        <div className="card mb-4">
          <h2 className="font-semibold text-text-primary text-sm mb-2">Notas</h2>
          <p className="text-sm text-text-secondary">{venta.notas}</p>
        </div>
      )}

      {/* Cambiar estado */}
      {session.rol !== 'vendedor' && (
        <div className="card">
          <h2 className="font-semibold text-text-primary text-sm mb-3">Cambiar estado</h2>
          <EstadoVentaSelector ventaId={venta.id} estadoActual={venta.estado} />
        </div>
      )}

    </div>
  )
}
