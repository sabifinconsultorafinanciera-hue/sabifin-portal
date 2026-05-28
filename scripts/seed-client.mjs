// ============================================================
// SABIFIN — Script para registrar un cliente en Firestore
// Uso: node scripts/seed-client.mjs
// ============================================================

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore }        from 'firebase-admin/firestore'
import { readFileSync }        from 'fs'
import { resolve, dirname }    from 'path'
import { fileURLToPath }       from 'url'

// Leer .env.local manualmente
const __dir  = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dir, '../.env.local')
const envRaw  = readFileSync(envPath, 'utf-8')

const env = {}
for (const line of envRaw.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const idx = trimmed.indexOf('=')
  if (idx === -1) continue
  const key = trimmed.slice(0, idx).trim()
  let val    = trimmed.slice(idx + 1).trim()
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
  env[key] = val
}

// Inicializar Firebase Admin
initializeApp({
  credential: cert({
    projectId:   env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey:  env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
})

const db = getFirestore()

// ── Datos del cliente a registrar ─────────────────────────
const CLIENT = {
  uid:        'y6A2VDNN2JQLj4kon1s6fy1exo42',
  email:      'tu-email-de-prueba',          // referencia interna
  clientName: 'Sabifin (prueba)',
  sheetId:    '1JSfX_A4A1fE0tzDdpQJj-XeOVCDQTeazoahYrpRmai0',
  sheetName:  'movimientos 2025',
}

// ── Crear documento en Firestore ───────────────────────────
async function main() {
  try {
    await db.collection('clients').doc(CLIENT.uid).set(CLIENT)
    console.log('✅ Cliente registrado en Firestore:')
    console.log(`   UID:        ${CLIENT.uid}`)
    console.log(`   Nombre:     ${CLIENT.clientName}`)
    console.log(`   Sheet ID:   ${CLIENT.sheetId}`)
    console.log(`   Pestaña:    ${CLIENT.sheetName}`)
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
  process.exit(0)
}

main()
