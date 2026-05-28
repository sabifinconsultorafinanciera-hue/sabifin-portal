import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { readSheet } from '@/lib/sheets'
import type { ClientConfig } from '@/lib/types'

export async function GET() {
  try {
    const session = await verifySession()

    // Datos del cliente
    const clientDoc = await adminDb.collection('clients').doc(session.userId).get()
    const client    = clientDoc.data() as ClientConfig

    // Headers del Sheet
    const sheet   = await readSheet(client.sheetId, client.sheetName ?? 'Sheet1')
    const headers = sheet.headers

    // Alertas del cliente
    const alertsSnap = await adminDb
      .collection('clients').doc(session.userId)
      .collection('alerts')
      .orderBy('createdAt', 'desc')
      .get()

    const alerts = alertsSnap.docs.map(d => d.data())

    return NextResponse.json({
      alerts,
      headers,
      email: session.email,
    })
  } catch (err) {
    console.error('[API Alertas] Error:', err)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
