import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { readSheet } from '@/lib/sheets'
import { checkAlert } from '@/lib/alertEngine'
import { sendAlertEmail } from '@/lib/email'
import type { ClientConfig, AlertConfig } from '@/lib/types'

// Horas mínimas entre dos emails de la misma alerta (anti-spam)
const COOLDOWN_HOURS = 24

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const log: { clientId: string; checked: number; sent: number; errors: string[] }[] = []

  const clientsSnap = await adminDb.collection('clients').get()

  for (const clientDoc of clientsSnap.docs) {
    const client = clientDoc.data() as ClientConfig
    const entry  = { clientId: client.uid, checked: 0, sent: 0, errors: [] as string[] }

    let sheetData
    try {
      sheetData = await readSheet(client.sheetId, client.sheetName ?? 'Sheet1')
    } catch (err) {
      entry.errors.push(`sheet: ${String(err)}`)
      log.push(entry)
      continue
    }

    const alertsSnap = await adminDb
      .collection('clients').doc(client.uid)
      .collection('alerts')
      .where('active', '==', true)
      .get()

    entry.checked = alertsSnap.size

    for (const alertDoc of alertsSnap.docs) {
      const alert = alertDoc.data() as AlertConfig & {
        lastSentAt?: string
        lastValue?:  number
      }

      // Respetar cooldown
      if (alert.lastSentAt) {
        const msSince = Date.now() - new Date(alert.lastSentAt).getTime()
        if (msSince < COOLDOWN_HOURS * 3_600_000) continue
      }

      const { triggered, currentValue } = checkAlert(alert, sheetData)

      if (triggered) {
        try {
          await sendAlertEmail({
            to:           alert.email,
            clientName:   client.clientName,
            column:       alert.column,
            condition:    alert.condition,
            threshold:    alert.threshold,
            currentValue,
          })
          await alertDoc.ref.update({
            lastSentAt: new Date().toISOString(),
            lastValue:  currentValue,
          })
          entry.sent++
        } catch (err) {
          entry.errors.push(`email ${alert.id}: ${String(err)}`)
        }
      } else {
        // Actualizar lastValue siempre (necesario para condición 'changed')
        await alertDoc.ref.update({ lastValue: currentValue })
      }
    }

    log.push(entry)
  }

  console.log('[CronAlertas] Resultado:', JSON.stringify(log))
  return NextResponse.json({ ok: true, log })
}
