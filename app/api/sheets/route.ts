import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { adminDb } from '@/lib/firebase/admin'
import { readSheet } from '@/lib/sheets'
import type { ClientConfig } from '@/lib/types'

export async function GET() {
  // 1. Verificar sesión
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // 2. Obtener config del cliente (sheetId) desde Firestore
    const clientDoc = await adminDb.collection('clients').doc(session.userId).get()

    if (!clientDoc.exists) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const clientData = clientDoc.data() as ClientConfig

    // 3. Leer datos del Google Sheet del cliente
    const sheetData = await readSheet(clientData.sheetId, clientData.sheetName ?? 'Sheet1')

    return NextResponse.json(sheetData)
  } catch (err) {
    console.error('Error fetching sheet data:', err)
    return NextResponse.json({ error: 'Error al cargar los datos' }, { status: 500 })
  }
}
