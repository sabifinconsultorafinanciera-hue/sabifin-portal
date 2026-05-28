import 'server-only'
import { google } from 'googleapis'
import type { SheetData } from '@/lib/types'

// ── Autenticación con Service Account ─────────────────────
function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key:  process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })

  return google.sheets({ version: 'v4', auth })
}

// ── Obtener nombre exacto del tab por GID o índice ────────
async function resolveSheetTitle(
  sheets: ReturnType<typeof getSheetsClient>,
  spreadsheetId: string,
  sheetName: string
): Promise<string> {
  // Obtener metadata del spreadsheet para encontrar el título exacto
  const meta = await sheets.spreadsheets.get({ spreadsheetId })
  const sheetsInfo = meta.data.sheets ?? []

  // Si sheetName es un número, buscar por gid
  if (/^\d+$/.test(sheetName)) {
    const gid = parseInt(sheetName)
    const found = sheetsInfo.find(s => s.properties?.sheetId === gid)
    if (found?.properties?.title) return found.properties.title
  }

  // Buscar coincidencia exacta (case-insensitive) por título
  const found = sheetsInfo.find(
    s => s.properties?.title?.toLowerCase() === sheetName.toLowerCase()
  )
  if (found?.properties?.title) return found.properties.title

  // Si no se encontró, usar el primer tab disponible
  const firstTitle = sheetsInfo[0]?.properties?.title
  if (firstTitle) {
    console.warn(`[Sheets] Tab "${sheetName}" no encontrado. Usando el primero: "${firstTitle}"`)
    return firstTitle
  }

  throw new Error(`No se encontró ningún tab en el spreadsheet`)
}

// ── Leer datos de un Google Sheet ─────────────────────────
export async function readSheet(sheetId: string, sheetName = 'Sheet1'): Promise<SheetData> {
  const sheets = getSheetsClient()

  // Resolver el título exacto del tab via metadata
  const exactTitle = await resolveSheetTitle(sheets, sheetId, sheetName)

  // Construir range con el título exacto entre comillas simples
  const range = `'${exactTitle.replace(/'/g, "\\'")}'!A:Z`

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  })

  const rawRows = response.data.values ?? []

  if (rawRows.length === 0) {
    return { headers: [], rows: [], lastUpdated: new Date().toISOString() }
  }

  const headers = rawRows[0].map(String)
  const rows = rawRows.slice(1).map(row =>
    Object.fromEntries(
      headers.map((header, i) => [header, row[i] ?? null])
    )
  )

  return {
    headers,
    rows,
    lastUpdated: new Date().toISOString(),
  }
}

// ── Escribir datos en un Google Sheet ─────────────────────
export async function writeSheetRow(
  sheetId: string,
  sheetName: string,
  values: (string | number | null)[]
): Promise<void> {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key:  process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })
  const exactTitle = await resolveSheetTitle(sheets, sheetId, sheetName)
  const range = `'${exactTitle}'!A:Z`

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  })
}
