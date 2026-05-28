// ============================================================
// SABIFIN — Tipos TypeScript globales
// ============================================================

export interface SessionPayload {
  userId:     string
  email:      string
  clientName: string
  isAdmin:    boolean
  expiresAt:  Date
}

export interface ClientConfig {
  uid: string
  email: string
  clientName: string
  sheetId: string          // ID del Google Sheet asignado al cliente
  sheetName?: string       // Nombre de la pestaña (default: primera hoja)
}

export interface SheetRow {
  [key: string]: string | number | null
}

export interface SheetData {
  headers: string[]
  rows: SheetRow[]
  lastUpdated: string
}

export interface KpiCard {
  label: string
  value: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
}

export type AlertType = 'info' | 'success' | 'warning' | 'error'

export interface AlertConfig {
  id: string
  clientId: string
  column: string
  condition: 'greater_than' | 'less_than' | 'equals' | 'changed'
  threshold?: number
  email: string
  active: boolean
}
