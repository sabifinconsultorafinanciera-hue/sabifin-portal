'use server'
import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { writeSheetRow } from '@/lib/sheets'
import type { ClientConfig } from '@/lib/types'

export async function ingresarFila(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await verifySession()

    const clientDoc = await adminDb.collection('clients').doc(session.userId).get()
    if (!clientDoc.exists) return { ok: false, error: 'Cliente no encontrado.' }

    const client   = clientDoc.data() as ClientConfig
    const rawHeaders = formData.get('__headers') as string ?? ''
    const headers  = rawHeaders.split('|').filter(Boolean)

    // Construir array de valores en el mismo orden que los headers
    const values = headers.map(h => {
      const val = formData.get(h)
      return val !== null ? String(val) : ''
    })

    await writeSheetRow(client.sheetId, client.sheetName ?? 'Sheet1', values)
    return { ok: true }
  } catch (err) {
    console.error('[Ingresar] Error:', err)
    return { ok: false, error: 'No se pudo guardar. Intentá de nuevo.' }
  }
}
