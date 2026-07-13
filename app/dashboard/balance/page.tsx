import { verifyGerente } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import BalanceChart from '@/components/BalanceChart'
import type { Venta, Gasto, CategoriaGasto } from '@/lib/types'

export const metadata = { title: 'Balance' }

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

const MES_LABEL = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const CAT_LABEL: Record<CategoriaGasto, string> = {
  sueldos: 'Sueldos', alquiler: 'Alquiler', servicios: 'Servicios',
  logistica: 'Logística', marketing: 'Marketing', impuestos: 'Impuestos',
  compras: 'Compras', otros: 'Otros',
}

export default async function BalancePage() {
  const session = await verifyGerente()
  if (!session.empresaId) return null

  const year = new Date().getFullYear()

  const [ventasSnap, gastosSnap] = await Promise.all([
    adminDb.collection('empresas').doc(session.empresaId).collection('ventas')
      .where('estado', '!=', 'cancelada').get(),
    adminDb.collection('empresas').doc(session.empresaId).collection('gastos').get(),
  ])

  const ventas = ventasSnap.docs.map(d => d.data() as Venta).filter(v => v.fecha.startsWith(String(year)))
  const gastos = gastosSnap.docs.map(d => d.data() as Gasto).filter(g => g.fecha.startsWith(String(year)))

  // Resumen por mes
  const meses = Array.from({ length: 12 }, (_, i) => {
    const mes   = String(year) + '-' + String(i + 1).padStart(2, '0')
    const vMes  = ventas.filter(v => v.fecha.startsWith(mes)).reduce((s, v) => s + v.total, 0)
    const gMes  = gastos.filter(g => g.fecha.startsWith(mes)).reduce((s, g) => s + g.monto, 0)
    return { mes: MES_LABEL[i], ventas: vMes, gastos: gMes, margen: vMes - gMes }
  })

  const totalVentas = ventas.reduce((s, v) => s + v.total, 0)
  const totalGastos = gastos.reduce((s, g) => s + g.monto, 0)
  const margenAnual = totalVentas - totalGastos

  // Gastos por categoría (año)
  const porCat = gastos.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] ?? 0) + g.monto
    return acc
  }, {} as Record<string, number>)

  const mesActual = new Date().getMonth()
  const mesActualData = meses[mesActual]

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Balance {year}</h1>
        <p className="text-sm text-text-secondary mt-1">Resumen financiero anual</p>
      </div>

      {/* KPIs anuales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Ventas totales</p>
          <p className="text-lg font-bold truncate" style={{ color: 'var(--color-success)' }}>{formatMoney(totalVentas)}</p>
        </div>
        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Gastos totales</p>
          <p className="text-lg font-bold truncate" style={{ color: 'var(--color-error)' }}>{formatMoney(totalGastos)}</p>
        </div>
        <div className="card min-w-0" style={{ borderLeft: `4px solid ${margenAnual >= 0 ? 'var(--color-success)' : 'var(--color-error)'}` }}>
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Margen anual</p>
          <p className="text-lg font-bold truncate" style={{ color: margenAnual >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
            {formatMoney(margenAnual)}
          </p>
        </div>
        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Margen este mes</p>
          <p className="text-lg font-bold truncate" style={{ color: mesActualData.margen >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
            {formatMoney(mesActualData.margen)}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border-light">
          <h2 className="font-semibold text-text-primary">Ventas vs Gastos — {year}</h2>
        </div>
        <div className="p-5">
          <BalanceChart data={meses} />
        </div>
      </div>

      {/* Tabla mensual + gastos por categoría */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Tabla mensual */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border-light">
            <h2 className="font-semibold text-text-primary">Resumen mensual</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#f8f7f4', borderBottom: '1px solid var(--color-border-light)' }}>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted">Mes</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-text-muted">Ventas</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-text-muted">Gastos</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-text-muted">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {meses.filter(m => m.ventas > 0 || m.gastos > 0).map(m => (
                  <tr key={m.mes}>
                    <td className="px-4 py-2 font-medium text-text-primary">{m.mes}</td>
                    <td className="px-4 py-2 text-right" style={{ color: 'var(--color-success)' }}>{formatMoney(m.ventas)}</td>
                    <td className="px-4 py-2 text-right" style={{ color: 'var(--color-error)' }}>{formatMoney(m.gastos)}</td>
                    <td className="px-4 py-2 text-right font-semibold"
                      style={{ color: m.margen >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {formatMoney(m.margen)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gastos por categoría */}
        <div className="card">
          <h2 className="font-semibold text-text-primary mb-4">Gastos por categoría</h2>
          {Object.keys(porCat).length === 0 ? (
            <p className="text-sm text-text-muted">Sin datos</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(porCat).sort((a, b) => b[1] - a[1]).map(([cat, monto]) => {
                const pct = Math.round((monto / totalGastos) * 100)
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-secondary">{CAT_LABEL[cat as CategoriaGasto] ?? cat}</span>
                      <span className="font-medium text-text-primary">{formatMoney(monto)} <span className="text-xs text-text-muted">({pct}%)</span></span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: '#e8e3d0' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--color-error)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
