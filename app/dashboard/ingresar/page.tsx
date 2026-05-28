import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { readSheet } from '@/lib/sheets'
import IngresarForm from '@/components/IngresarForm'
import type { ClientConfig } from '@/lib/types'

export const metadata = { title: 'Ingresar datos — Sabifin' }

// ── Obtener solo los headers del Sheet ────────────────────
async function getHeaders(userId: string): Promise<string[] | null> {
  try {
    const clientDoc = await adminDb.collection('clients').doc(userId).get()
    if (!clientDoc.exists) return null
    const client = clientDoc.data() as ClientConfig
    const sheet  = await readSheet(client.sheetId, client.sheetName ?? 'Sheet1')
    return sheet.headers.length > 0 ? sheet.headers : null
  } catch (err) {
    console.error('[Ingresar] Error cargando headers:', err)
    return null
  }
}

// ── Página ─────────────────────────────────────────────────
export default async function IngresarPage() {
  const session = await verifySession()
  const headers = await getHeaders(session.userId)

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Ingresar datos</h1>
        <p className="text-sm text-text-secondary mt-1">
          Completá el formulario para agregar un nuevo registro a tu hoja de Google Sheets.
        </p>
      </div>

      {/* Formulario */}
      <div className="max-w-lg">
        <div className="card">
          {headers ? (
            <IngresarForm headers={headers} />
          ) : (
            <div
              className="text-center py-8 text-sm rounded-lg"
              style={{ color: 'var(--color-error)', background: 'var(--color-error-bg)' }}
            >
              No se pudo cargar el formulario. Contactá a Sabifin.
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
