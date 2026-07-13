import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import Link from 'next/link'
import type { Venta, Gasto, Producto, Transito } from '@/lib/types'

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

function getMesActual() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

async function getDashboardData(empresaId: string) {
  const mesActual = getMesActual()
  const today     = new Date().toISOString().slice(0, 10)

  const [ventasSnap, gastosSnap, productosSnap, transitoSnap] = await Promise.all([
    adminDb.collection('empresas').doc(empresaId).collection('ventas')
      .where('estado', '!=', 'cancelada').get(),
    adminDb.collection('empresas').doc(empresaId).collection('gastos').get(),
    adminDb.collection('empresas').doc(empresaId).collection('productos')
      .where('activo', '==', true).get(),
    adminDb.collection('empresas').doc(empresaId).collection('transito')
      .where('estado', '!=', 'recibido').get(),
  ])

  const ventas    = ventasSnap.docs.map(d => d.data() as Venta)
  const gastos    = gastosSnap.docs.map(d => d.data() as Gasto)
  const productos = productosSnap.docs.map(d => d.data() as Producto)

  const ventasMes      = ventas.filter(v => v.fecha.startsWith(mesActual))
  const ventasHoy      = ventas.filter(v => v.fecha === today)
  const gastosMes      = gastos.filter(g => g.fecha.startsWith(mesActual))
  const totalVentasMes = ventasMes.reduce((s, v) => s + v.total, 0)
  const totalGastosMes = gastosMes.reduce((s, g) => s + g.monto, 0)

  return {
    ventasHoy:      ventasHoy.reduce((s, v) => s + v.total, 0),
    ventasMes:      totalVentasMes,
    cantVentasMes:  ventasMes.length,
    gastosMes:      totalGastosMes,
    margenMes:      totalVentasMes - totalGastosMes,
    stockCritico:   productos.filter(p => p.stockActual > 0 && p.stockActual <= p.stockMinimo).length,
    sinStock:       productos.filter(p => p.stockActual <= 0).length,
    transitoActivo: transitoSnap.size,
    ultimasVentas:  ventas.sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5),
    stockBajo:      productos
      .filter(p => p.stockActual <= p.stockMinimo)
      .sort((a, b) => a.stockActual - b.stockActual)
      .slice(0, 5),
  }
}

const ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente', confirmada: 'Confirmada', entregada: 'Entregada', cancelada: 'Cancelada',
}
const ESTADO_COLOR: Record<string, string> = {
  pendiente: '#b5893a', confirmada: '#2d6a4f', entregada: '#52b788', cancelada: '#c0392b',
}

export default async function DashboardPage() {
  const session   = await verifySession()
  const isGerente = session.rol !== 'vendedor'

  if (!session.empresaId) {
    return (
      <div className="p-8 text-center text-sm" style={{ color: 'var(--color-error)' }}>
        Tu cuenta no tiene una empresa asignada. Contactá a Sabifin.
      </div>
    )
  }

  const d = await getDashboardData(session.empresaId)

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Buen día, {session.userName.split(' ')[0]}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link href="/dashboard/ventas/nueva"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'var(--color-brand-green)' }}>
          + Nueva venta
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Ventas hoy</p>
          <p className="text-lg font-bold truncate" style={{ color: 'var(--color-success)' }}>
            {formatMoney(d.ventasHoy)}
          </p>
        </div>
        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Ventas del mes</p>
          <p className="text-lg font-bold truncate" style={{ color: 'var(--color-success)' }}>
            {formatMoney(d.ventasMes)}
          </p>
          <p className="text-xs text-text-muted mt-1">{d.cantVentasMes} operaciones</p>
        </div>
        {isGerente ? (
          <div className="card min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Gastos del mes</p>
            <p className="text-lg font-bold truncate" style={{ color: 'var(--color-error)' }}>
              {formatMoney(d.gastosMes)}
            </p>
          </div>
        ) : (
          <div className="card min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Stock crítico</p>
            <p className="text-2xl font-bold" style={{ color: d.stockCritico > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
              {d.stockCritico}
            </p>
            <p className="text-xs text-text-muted mt-1">productos bajo mínimo</p>
          </div>
        )}
        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">En tránsito</p>
          <p className="text-2xl font-bold text-brand-green">{d.transitoActivo}</p>
          <p className="text-xs text-text-muted mt-1">pedidos activos</p>
        </div>
      </div>

      {/* Margen — solo gerente */}
      {isGerente && (
        <div className="card" style={{ borderLeft: `4px solid ${d.margenMes >= 0 ? 'var(--color-success)' : 'var(--color-error)'}` }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Margen del mes</p>
              <p className="text-2xl font-bold mt-1" style={{ color: d.margenMes >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                {formatMoney(d.margenMes)}
              </p>
            </div>
            <Link href="/dashboard/balance" className="text-xs font-medium px-3 py-1.5 rounded-lg shrink-0"
              style={{ background: 'var(--color-green-100)', color: 'var(--color-brand-green)' }}>
              Ver balance →
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Últimas ventas */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">Últimas ventas</h2>
            <Link href="/dashboard/ventas" className="text-xs font-medium" style={{ color: 'var(--color-brand-green)' }}>
              Ver todas →
            </Link>
          </div>
          <div className="divide-y divide-border-light">
            {d.ultimasVentas.length === 0 ? (
              <p className="px-5 py-10 text-sm text-center text-text-muted">Sin ventas registradas todavía</p>
            ) : d.ultimasVentas.map(v => (
              <div key={v.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{v.clienteNombre}</p>
                  <p className="text-xs text-text-muted">{v.fecha} · {v.vendedorNombre}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-success)' }}>{formatMoney(v.total)}</p>
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded"
                    style={{ background: `${ESTADO_COLOR[v.estado]}20`, color: ESTADO_COLOR[v.estado] }}>
                    {ESTADO_LABEL[v.estado]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock bajo */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">Stock bajo</h2>
            <Link href="/dashboard/stock" className="text-xs font-medium" style={{ color: 'var(--color-brand-green)' }}>
              Ver stock →
            </Link>
          </div>
          <div className="divide-y divide-border-light">
            {d.stockBajo.length === 0 ? (
              <p className="px-5 py-10 text-sm text-center text-text-muted">
                Todo el stock en nivel normal ✓
              </p>
            ) : d.stockBajo.map(p => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{p.nombre}</p>
                  <p className="text-xs text-text-muted">{p.sku} · mín: {p.stockMinimo} {p.unidad}</p>
                </div>
                <span className="text-sm font-bold shrink-0"
                  style={{ color: p.stockActual <= 0 ? 'var(--color-error)' : 'var(--color-warning)' }}>
                  {p.stockActual} {p.unidad}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
