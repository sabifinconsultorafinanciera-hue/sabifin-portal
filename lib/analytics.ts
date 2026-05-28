import type { SheetRow } from '@/lib/types'

// ── Tipos ──────────────────────────────────────────────────
export interface MonthSummary {
  mes:      string
  ingresos: number
  egresos:  number
  saldo:    number
}

export interface KpiSummary {
  totalIngresos:  number
  totalEgresos:   number
  saldoNeto:      number
  totalRegistros: number
  mesActual:      string
  ingresosMes:    number
  egresosMes:     number
  saldoMes:       number
}

export interface CategoryBreakdown {
  nombre: string
  monto:  number
  tipo:   'INGRESO' | 'EGRESO'
}

// ── Parsear monto desde string ─────────────────────────────
// Soporta: "$24.000", "24000", "24.000,50", "$1.234.567"
export function parseMonto(raw: string | number | null): number {
  if (raw === null || raw === undefined || raw === '') return 0
  if (typeof raw === 'number') return raw

  const cleaned = String(raw)
    .replace(/\$/g, '')     // quitar $
    .replace(/\s/g, '')     // quitar espacios
    .trim()

  // Detectar formato: si tiene coma decimal → 1.234,56 → 1234.56
  if (/,\d{1,2}$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) || 0
  }

  // Formato con puntos como miles: 24.000 → 24000
  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/\./g, '')) || 0
  }

  return parseFloat(cleaned.replace(/[^\d.-]/g, '')) || 0
}

// ── Detectar columnas clave automáticamente ────────────────
export function detectColumns(headers: string[]) {
  const find = (terms: string[]) =>
    headers.find(h => terms.some(t => h.toLowerCase().includes(t))) ?? ''

  return {
    movimiento: find(['movimiento', 'tipo', 'type']),
    monto:      find(['monto', 'amount', 'valor', 'importe', 'total']),
    mes:        find(['mes', 'month']),
    fecha:      find(['fecha', 'date']),
    motivo:     find(['motivo', 'categoría', 'categoria', 'concepto', 'razon']),
    sucursal:   find(['sucursal', 'local', 'branch', 'sede']),
  }
}

// ── Resumen por mes ────────────────────────────────────────
export function calcMonthlyData(rows: SheetRow[], headers: string[]): MonthSummary[] {
  const cols = detectColumns(headers)
  const byMes: Record<string, MonthSummary> = {}

  // Orden de meses en español
  const mesOrder = ['enero','febrero','marzo','abril','mayo','junio',
                    'julio','agosto','septiembre','octubre','noviembre','diciembre']

  for (const row of rows) {
    const movCol  = cols.movimiento ? String(row[cols.movimiento] ?? '').toUpperCase() : ''
    const mesRaw  = cols.mes ? String(row[cols.mes] ?? '') : ''
    const monto   = parseMonto(cols.monto ? row[cols.monto] : null)

    if (!mesRaw || monto === 0) continue

    const mes = mesRaw.trim()
    if (!byMes[mes]) byMes[mes] = { mes, ingresos: 0, egresos: 0, saldo: 0 }

    if (movCol.includes('INGRESO') || movCol.includes('ENTRADA') || movCol.includes('IN')) {
      byMes[mes].ingresos += monto
    } else if (movCol.includes('EGRESO') || movCol.includes('SALIDA') || movCol.includes('OUT') || movCol.includes('GASTO')) {
      byMes[mes].egresos += monto
    }
  }

  // Calcular saldo y ordenar por mes
  return Object.values(byMes)
    .map(m => ({ ...m, saldo: m.ingresos - m.egresos }))
    .sort((a, b) => {
      const ai = mesOrder.indexOf(a.mes.toLowerCase())
      const bi = mesOrder.indexOf(b.mes.toLowerCase())
      if (ai !== -1 && bi !== -1) return ai - bi
      return a.mes.localeCompare(b.mes)
    })
}

// ── KPIs globales y del mes actual ────────────────────────
export function calcKpis(rows: SheetRow[], headers: string[]): KpiSummary {
  const cols    = detectColumns(headers)
  const monthly = calcMonthlyData(rows, headers)

  const totalIngresos = monthly.reduce((s, m) => s + m.ingresos, 0)
  const totalEgresos  = monthly.reduce((s, m) => s + m.egresos,  0)

  // Último mes con datos
  const last = monthly[monthly.length - 1]

  return {
    totalIngresos,
    totalEgresos,
    saldoNeto:      totalIngresos - totalEgresos,
    totalRegistros: rows.length,
    mesActual:      last?.mes ?? '—',
    ingresosMes:    last?.ingresos ?? 0,
    egresosMes:     last?.egresos  ?? 0,
    saldoMes:       last?.saldo    ?? 0,
  }
}

// ── Top categorías ─────────────────────────────────────────
export function calcTopCategories(
  rows: SheetRow[],
  headers: string[],
  limit = 5
): CategoryBreakdown[] {
  const cols = detectColumns(headers)
  const byMotivo: Record<string, CategoryBreakdown> = {}

  for (const row of rows) {
    const movCol  = cols.movimiento ? String(row[cols.movimiento] ?? '').toUpperCase() : ''
    const motivo  = cols.motivo ? String(row[cols.motivo] ?? 'Sin categoría').trim() : 'Sin categoría'
    const monto   = parseMonto(cols.monto ? row[cols.monto] : null)

    if (!motivo || monto === 0) continue

    const tipo: 'INGRESO' | 'EGRESO' =
      movCol.includes('INGRESO') || movCol.includes('ENTRADA') ? 'INGRESO' : 'EGRESO'

    const key = `${tipo}::${motivo}`
    if (!byMotivo[key]) byMotivo[key] = { nombre: motivo, monto: 0, tipo }
    byMotivo[key].monto += monto
  }

  return Object.values(byMotivo)
    .sort((a, b) => b.monto - a.monto)
    .slice(0, limit)
}

// ── Formatear número como moneda ───────────────────────────
export function formatMoney(n: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n)
}
