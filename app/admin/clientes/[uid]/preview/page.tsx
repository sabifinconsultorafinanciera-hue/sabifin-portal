import { verifyAdmin } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { readSheet } from '@/lib/sheets'
import { calcKpis, calcMonthlyData, formatMoney } from '@/lib/analytics'
import MonthlyChart from '@/components/MonthlyChart'
import DataTable from '@/components/DataTable'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ClientConfig } from '@/lib/types'

export default async function PreviewClientePage({
  params,
}: {
  params: Promise<{ uid: string }>
}) {
  await verifyAdmin()
  const { uid } = await params

  const doc = await adminDb.collection('clients').doc(uid).get()
  if (!doc.exists) notFound()

  const client = doc.data() as ClientConfig

  let sheetData = null
  try {
    sheetData = await readSheet(client.sheetId, client.sheetName ?? 'Sheet1')
  } catch { /* se muestra error abajo */ }

  const kpis    = sheetData ? calcKpis(sheetData.rows, sheetData.headers) : null
  const monthly = sheetData ? calcMonthlyData(sheetData.rows, sheetData.headers) : []

  function saldoColor(n: number) {
    return n > 0 ? 'var(--color-success)' : n < 0 ? 'var(--color-error)' : 'var(--color-text-primary)'
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* Banner admin */}
      <div
        className="rounded-xl px-4 py-3 flex items-center gap-3 text-sm"
        style={{ background: 'var(--color-warning-bg)', border: '1px solid #e8c97a' }}
      >
        <span style={{ color: 'var(--color-warning)' }}>◎</span>
        <span style={{ color: '#7a5c00' }}>
          <strong>Vista previa como:</strong> {client.clientName} · {client.email}
        </span>
        <Link
          href={`/admin/clientes/${uid}`}
          className="ml-auto text-xs font-medium underline"
          style={{ color: '#7a5c00' }}
        >
          ← Volver a edición
        </Link>
      </div>

      {/* KPI cards */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Ingresos totales</p>
            <p className="text-base font-bold truncate" style={{ color: 'var(--color-success)' }}>{formatMoney(kpis.totalIngresos)}</p>
          </div>
          <div className="card min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Egresos totales</p>
            <p className="text-base font-bold truncate" style={{ color: 'var(--color-error)' }}>{formatMoney(kpis.totalEgresos)}</p>
          </div>
          <div className="card min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Saldo neto</p>
            <p className="text-base font-bold truncate" style={{ color: saldoColor(kpis.saldoNeto) }}>{formatMoney(kpis.saldoNeto)}</p>
          </div>
          <div className="card min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Registros</p>
            <p className="text-2xl font-bold text-brand-green">{kpis.totalRegistros.toLocaleString('es-AR')}</p>
          </div>
        </div>
      )}

      {/* Gráfico */}
      {monthly.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border-light">
            <h2 className="font-semibold text-text-primary">Ingresos vs Egresos por mes</h2>
          </div>
          <div className="p-5">
            <MonthlyChart data={monthly} />
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border-light">
          <h2 className="font-semibold text-text-primary">Datos del Sheet</h2>
          <p className="text-xs text-text-muted mt-0.5">{client.sheetName ?? 'Sheet1'}</p>
        </div>
        <div className="p-5">
          {sheetData ? (
            <DataTable data={sheetData} />
          ) : (
            <div className="text-center py-8 text-sm" style={{ color: 'var(--color-error)' }}>
              No se pudo cargar el Sheet de este cliente.
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
