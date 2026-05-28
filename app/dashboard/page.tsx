import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { readSheet } from '@/lib/sheets'
import { calcKpis, formatMoney } from '@/lib/analytics'
import DataTable from '@/components/DataTable'
import Link from 'next/link'
import type { ClientConfig, SheetData } from '@/lib/types'

// ── Data fetching ──────────────────────────────────────────
async function getClientSheetData(userId: string): Promise<SheetData | null> {
  try {
    const clientDoc = await adminDb.collection('clients').doc(userId).get()
    if (!clientDoc.exists) return null
    const client = clientDoc.data() as ClientConfig
    return await readSheet(client.sheetId, client.sheetName ?? 'Sheet1')
  } catch (err) {
    console.error('[Sheets] Error cargando datos:', err)
    return null
  }
}

// ── Página ─────────────────────────────────────────────────
export default async function DashboardPage() {
  const session   = await verifySession()
  const sheetData = await getClientSheetData(session.userId)
  const kpis      = sheetData
    ? calcKpis(sheetData.rows, sheetData.headers)
    : null

  return (
    <div className="p-6 lg:p-8">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Bienvenido, {session.clientName}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Aquí puedes ver y gestionar tu información financiera.
          </p>
        </div>
        <Link
          href="/dashboard/reportes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: 'var(--color-green-100)',
            color: 'var(--color-brand-green)',
          }}
        >
          ▤ Ver reportes
        </Link>
      </div>

      {/* ── KPI Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">
            Ingresos totales
          </p>
          <p className="text-base font-bold truncate" style={{ color: 'var(--color-success)' }}>
            {kpis ? formatMoney(kpis.totalIngresos) : '—'}
          </p>
        </div>

        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">
            Egresos totales
          </p>
          <p className="text-base font-bold truncate" style={{ color: 'var(--color-error)' }}>
            {kpis ? formatMoney(kpis.totalEgresos) : '—'}
          </p>
        </div>

        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">
            Saldo neto
          </p>
          <p
            className="text-base font-bold truncate"
            style={{
              color: kpis
                ? kpis.saldoNeto >= 0
                  ? 'var(--color-success)'
                  : 'var(--color-error)'
                : 'var(--color-text-primary)',
            }}
          >
            {kpis ? formatMoney(kpis.saldoNeto) : '—'}
          </p>
        </div>

        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">
            Registros
          </p>
          <p className="text-2xl font-bold text-brand-green">
            {kpis ? kpis.totalRegistros.toLocaleString('es-AR') : '—'}
          </p>
        </div>

      </div>

      {/* ── Tabla de datos ──────────────────────────────── */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-text-primary">Datos de tu Sheet</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Sincronizado en tiempo real desde Google Sheets
            </p>
          </div>
          <a
            href="/dashboard"
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{
              background: 'var(--color-green-100)',
              color: 'var(--color-brand-green)',
            }}
          >
            ↺ Actualizar
          </a>
        </div>

        <div className="p-5">
          {sheetData && sheetData.rows.length > 0 ? (
            <DataTable data={sheetData} />
          ) : sheetData && sheetData.rows.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-3xl mb-3">📋</p>
              <p className="font-semibold text-text-primary">Tu hoja todavía no tiene registros</p>
              <p className="text-sm text-text-muted mt-1">
                Usá <span className="font-medium">"Ingresar datos"</span> para agregar el primero.
              </p>
            </div>
          ) : (
            <div
              className="text-center py-12 rounded-lg text-sm"
              style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}
            >
              No se pudo cargar la información. Contactá a Sabifin.
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
