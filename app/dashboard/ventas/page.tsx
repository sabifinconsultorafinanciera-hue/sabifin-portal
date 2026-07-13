import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import Link from 'next/link'
import type { Venta } from '@/lib/types'

export const metadata = { title: 'Ventas' }

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

const ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente', confirmada: 'Confirmada', entregada: 'Entregada', cancelada: 'Cancelada',
}
const ESTADO_COLOR: Record<string, string> = {
  pendiente: '#b5893a', confirmada: '#2d6a4f', entregada: '#52b788', cancelada: '#c0392b',
}

export default async function VentasPage() {
  const session = await verifySession()
  if (!session.empresaId) return null

  const snap = await adminDb
    .collection('empresas').doc(session.empresaId)
    .collection('ventas')
    .orderBy('fecha', 'desc')
    .limit(100)
    .get()

  const ventas = snap.docs.map(d => d.data() as Venta)

  const mesActual    = new Date().toISOString().slice(0, 7)
  const ventasMes    = ventas.filter(v => v.fecha.startsWith(mesActual) && v.estado !== 'cancelada')
  const totalMes     = ventasMes.reduce((s, v) => s + v.total, 0)
  const pendientes   = ventas.filter(v => v.estado === 'pendiente').length

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Ventas</h1>
          <p className="text-sm text-text-secondary mt-1">{ventas.length} registros · últimas 100</p>
        </div>
        <Link href="/dashboard/ventas/nueva"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'var(--color-brand-green)' }}>
          + Nueva venta
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Ventas del mes</p>
          <p className="text-lg font-bold truncate" style={{ color: 'var(--color-success)' }}>{formatMoney(totalMes)}</p>
          <p className="text-xs text-text-muted mt-1">{ventasMes.length} operaciones</p>
        </div>
        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Pendientes de entrega</p>
          <p className="text-2xl font-bold" style={{ color: pendientes > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
            {pendientes}
          </p>
        </div>
        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Ticket promedio</p>
          <p className="text-lg font-bold truncate text-text-primary">
            {ventasMes.length > 0 ? formatMoney(totalMes / ventasMes.length) : '—'}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f8f7f4', borderBottom: '1px solid var(--color-border-light)' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Vendedor</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Total</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {ventas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-text-muted">
                    No hay ventas registradas todavía.{' '}
                    <Link href="/dashboard/ventas/nueva" style={{ color: 'var(--color-brand-green)' }}>
                      Cargar la primera →
                    </Link>
                  </td>
                </tr>
              ) : ventas.map(v => (
                <tr key={v.id}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8f7f4'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                  <td className="px-5 py-3 text-text-muted">{v.fecha}</td>
                  <td className="px-4 py-3 font-medium text-text-primary">{v.clienteNombre}</td>
                  <td className="px-4 py-3 text-text-secondary">{v.vendedorNombre}</td>
                  <td className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--color-success)' }}>
                    {formatMoney(v.total)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: `${ESTADO_COLOR[v.estado]}20`, color: ESTADO_COLOR[v.estado] }}>
                      {ESTADO_LABEL[v.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/dashboard/ventas/${v.id}`} className="text-xs font-medium"
                      style={{ color: 'var(--color-brand-green)' }}>
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
