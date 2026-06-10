import 'server-only'
import { parseMonto } from '@/lib/analytics'
import type { SheetData, AlertConfig } from '@/lib/types'

// Suma todos los valores numéricos de una columna específica
function columnSum(data: SheetData, column: string): number {
  return data.rows.reduce((acc, row) => acc + parseMonto(row[column] ?? null), 0)
}

export interface AlertCheckResult {
  triggered:    boolean
  currentValue: number
}

export function checkAlert(
  alert: AlertConfig & { lastValue?: number },
  data:  SheetData,
): AlertCheckResult {
  const currentValue = columnSum(data, alert.column)
  const threshold    = alert.threshold ?? 0

  let triggered = false

  switch (alert.condition) {
    case 'greater_than':
      triggered = currentValue > threshold
      break
    case 'less_than':
      triggered = currentValue < threshold
      break
    case 'equals':
      triggered = currentValue === threshold
      break
    case 'changed':
      triggered = alert.lastValue !== undefined && currentValue !== alert.lastValue
      break
  }

  return { triggered, currentValue }
}
