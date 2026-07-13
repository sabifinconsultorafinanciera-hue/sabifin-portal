import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { readSheet } from '@/lib/sheets'
import {
  calcMonthlyData, calcKpis, calcTopCategories,
  formatMoney,
} from '@/lib/analytics'
import MonthlyChart from '@/components/MonthlyChart'
import type { ClientConfig, SheetData } from '@/lib/types'

// ── Metadata ───────────────────────────────────────────────
export const metadata = { title: 'Reportes — Sabifin' }

// ── Data fetching ──────────────────────────────────────────
async function getClientSheetData(userId: string): Promise<SheetData | null> {
  try {
    const clientDoc = await adminDb.collection('clients').doc(userId).get()
    if (!clientDoc.exists) return null
    const client = clientDoc.data() as ClientConfig
    return await readSheet(client.sheetId, client.sheetName ?? 'Sheet1')
  } catch (err) {
    console.error('[Reportes] Error cargando datos:', err)
    return null
  }
}

// ── Helpers ────────────────────────────────────────────────
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function saldoColor(n: number) {
  if (n > 0) return 'var(--color-success)'
  if (n < 0) return 'var(--color-error)'
  return 'var(--color-text-primary)'
}

// ── Página ─────────────────────────────────────────────────
export default async function ReportesPage() {
  const session   = await verifySession()
  const sheetData = await getClientSheetData(session.userId)

  if (!sheetData) {
    return (
      <div className="p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Reportes mensuales</h1>
        <div
          className="card text-center py-12 text-sm"
          style={{ color: 'var(--color-error)', background: 'var(--color-error-bg)' }}
        >
          No se pudo cargar la información. Contactá a Sabifin.
        </div>
      </div>
    )
  }

  const monthly    = calcMonthlyData(sheetData.rows, sheetData.headers)
  const kpis       = calcKpis(sheetData.rows, sheetData.headers)
  const categories = calcTopCategories(sheetData.rows, sheetData.headers, 6)

  const hasData = monthly.length > 0

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* ── Header ──────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Reportes mensuales</h1>
        <p className="text-sm text-text-secondary mt-1">
          Resumen financiero de {session.userName}
        </p>
      </div>

      {/* ── KPI cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">
            Ingresos totales
          </p>
          <p className="text-xl font-bold truncate" style={{ color: 'var(--color-success)' }}>
            {formatMoney(kpis.totalIngresos)}
          </p>
        </div>

        <div className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">
            Egresos totales
          </p>
          <p className="text-xl font-bold truncate" style={{ color: 'var(--color-error)' }}>
            {formatMoney(kpis.totalEgresos)}
          </p>
        </div>

        <div className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">
            Saldo neto
          </p>
          <p className="text-xl font-bold truncate" style={{ color: saldoColor(kpis.saldoNeto) }}>
            {formatMoney(kpis.saldoNeto)}
          </p>
        </div>

        <div className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">
            Último mes con datos
          </p>
          <p className="text-xl font-bold text-brand-green truncate">
            {kpis.mesActual !== '—' ? capitalize(kpis.mesActual) : '—'}
          </p>
          {kpis.mesActual !== '—' && (
            <p className="text-xs text-text-muted mt-1">
              Saldo: {formatMoney(kpis.saldoMes)}
            </p>
          )}
        </div>

      </div>

      {/* ── Gráfico de barras ────────────────────────────── */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border-light">
          <h2 className="font-semibold text-text-primary">Ingresos vs Egresos por mes</h2>
          <p className="text-xs text-text-muted mt-0.5">
            {hasData ? `${monthly.length} meses con movimientos` : 'Sin datos para mostrar'}
          </p>
        </div>
        <div className="p-5">
          {hasData ? (
            <MonthlyChart data={monthly} />
          ) : (
            <div className="text-center py-12 text-sm text-text-muted">
              No se encontraron columnas de tipo INGRESO/EGRESO en la hoja.
            </div>
          )}
        </div>
      </div>

      {/* ── Tabla mensual ────────────────────────────────── */}
      {hasData && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border-light">
            <h2 className="font-semibold text-text-primary">Detalle por mes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-bg-page)' }}>
                  {['Mes', 'Ingresos', 'Egresos', 'Saldo'].map(col => (
                    <th
                      key={col}
                      className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthly.map((row, i) => (
                  <tr
                    key={row.mes}
                    style={{
                      background: i % 2 === 0 ? '#fff' : 'var(--color-bg-page)',
                      borderTop: '1px solid var(--color-border-light)',
                    }}
                  >
                    <td className="px-5 py-3 font-medium text-text-primary">
                      {capitalize(row.mes)}
                    </td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--color-success)' }}>
                      {formatMoney(row.ingresos)}
                    </td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--color-error)' }}>
                      {formatMoney(row.egresos)}
                    </td>
                    <td className="px-5 py-3 font-bold" style={{ color: saldoColor(row.saldo) }}>
                      {formatMoney(row.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Top categorías ───────────────────────────────── */}
      {categories.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border-light">
            <h2 className="font-semibold text-text-primary">Principales categorías</h2>
            <p className="text-xs text-text-muted mt-0.5">Top 6 por monto acumulado</p>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map(cat => {
              const isIngreso = cat.tipo === 'INGRESO'
              return (
                <div
                  key={`${cat.tipo}-${cat.nombre}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg"
                  style={{ background: isIngreso ? 'var(--color-success-bg)' : 'var(--color-error-bg)' }}
                >
                  <span className="text-base flex-shrink-0">
                    {isIngreso ? '↑' : '↓'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{cat.nombre}</p>
                    <p className="text-xs text-text-muted">{cat.tipo}</p>
                  </div>
                  <p
                    className="text-sm font-bold flex-shrink-0"
                    style={{ color: isIngreso ? 'var(--color-success)' : 'var(--color-error)' }}
                  >
                    {formatMoney(cat.monto)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
