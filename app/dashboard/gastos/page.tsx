import { verifyGerente } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import Link from 'next/link'
import EliminarGasto from '@/components/EliminarGasto'
import type { Gasto, CategoriaGasto } from '@/lib/types'

export const metadata = { title: 'Gastos' }

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

const CAT_LABEL: Record<CategoriaGasto, string> = {
  sueldos: 'Sueldos', alquiler: 'Alquiler', servicios: 'Servicios',
  logistica: 'Logística', marketing: 'Marketing', impuestos: 'Impuestos',
  compras: 'Compras', otros: 'Otros',
}
const CAT_COLOR: Record<CategoriaGasto, string> = {
  sueldos: '#1a3a8f', alquiler: '#7a5c00', servicios: '#2d6a4f',
  logistica: '#b5893a', marketing: '#8b3a8f', impuestos: '#c0392b',
  compras: '#3a6a8f', otros: '#6b6b63',
}

export default async function GastosPage() {
  const session = await verifyGerente()
  if (!session.empresaId) return null

  const snap = await adminDb
    .collection('empresas').doc(session.empresaId)
    .collection('gastos')
    .orderBy('fecha', 'desc')
    .limit(100)
    .get()

  const gastos = snap.docs.map(d => d.data() as Gasto)

  const mesActual   = new Date().toISOString().slice(0, 7)
  const gastosMes   = gastos.filter(g => g.fecha.startsWith(mesActual))
  const totalMes    = gastosMes.reduce((s, g) => s + g.monto, 0)

  // Agrupado por categoría
  const porCategoria = gastosMes.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] ?? 0) + g.monto
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Gastos</h1>
          <p className="text-sm text-text-secondary mt-1">{gastos.length} registros · últimos 100</p>
        </div>
        <Link href="/dashboard/gastos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'var(--color-brand-green)' }}>
          + Registrar gasto
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* KPI mes */}
        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Total del mes</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-error)' }}>{formatMoney(totalMes)}</p>
          <p className="text-xs text-text-muted mt-1">{gastosMes.length} gastos</p>
        </div>

        {/* Por categoría */}
        <div className="card lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-3">Por categoría (este mes)</p>
          {Object.keys(porCategoria).length === 0 ? (
            <p className="text-sm text-text-muted">Sin gastos este mes</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(porCategoria)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, monto]) => {
                  const pct = Math.round((monto / totalMes) * 100)
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: CAT_COLOR[cat as CategoriaGasto] ?? '#6b6b63' }}>
                          {CAT_LABEL[cat as CategoriaGasto] ?? cat}
                        </span>
                        <span className="font-medium text-text-primary">{formatMoney(monto)}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#e8e3d0' }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: CAT_COLOR[cat as CategoriaGasto] ?? '#6b6b63' }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f8f7f4', borderBottom: '1px solid var(--color-border-light)' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Categoría</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Descripción</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted hidden sm:table-cell">Registrado por</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Monto</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {gastos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-text-muted">
                    No hay gastos registrados.{' '}
                    <Link href="/dashboard/gastos/nuevo" style={{ color: 'var(--color-brand-green)' }}>
                      Registrar el primero →
                    </Link>
                  </td>
                </tr>
              ) : gastos.map(g => (
                <tr key={g.id}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8f7f4'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                  <td className="px-5 py-3 text-text-muted">{g.fecha}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded"
                      style={{ background: `${CAT_COLOR[g.categoria]}18`, color: CAT_COLOR[g.categoria] }}>
                      {CAT_LABEL[g.categoria]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-primary">{g.descripcion}</td>
                  <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">{g.registradoPor}</td>
                  <td className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--color-error)' }}>
                    {formatMoney(g.monto)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <EliminarGasto gastoId={g.id} />
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
