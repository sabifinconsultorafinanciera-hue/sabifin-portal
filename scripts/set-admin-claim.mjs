/**
 * set-admin-claim.mjs — Marca un usuario como admin de Sabifin
 * Uso: node scripts/set-admin-claim.mjs <uid>
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const envContent = readFileSync(resolve(__dir, '../.env.local'), 'utf8')

function parseEnv(content) {
  const vars = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let value = trimmed.slice(eqIdx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    vars[key] = value
  }
  return vars
}

const env = parseEnv(envContent)
const uid = process.argv[2]

if (!uid) {
  console.error('❌ Uso: node scripts/set-admin-claim.mjs <uid>')
  process.exit(1)
}

const { initializeApp, cert, getApps } = await import('firebase-admin/app')
const { getAuth } = await import('firebase-admin/auth')

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey:  env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const auth = getAuth()
await auth.setCustomUserClaims(uid, { sabifin_admin: true })
console.log(`✅ Custom claim "sabifin_admin: true" asignado al usuario ${uid}`)
process.exit(0)
