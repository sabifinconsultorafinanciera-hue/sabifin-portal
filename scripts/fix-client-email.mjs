// Actualiza el email del cliente de prueba en Firestore
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore }        from 'firebase-admin/firestore'
import { readFileSync }        from 'fs'
import { resolve, dirname }    from 'path'
import { fileURLToPath }       from 'url'

const __dir  = dirname(fileURLToPath(import.meta.url))
const envRaw = readFileSync(resolve(__dir, '../.env.local'), 'utf-8')

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

initializeApp({
  credential: cert({
    projectId:   env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey:  env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
})

const db  = getFirestore()
const UID = 'y6A2VDNN2JQLj4kon1s6fy1exo42'

async function main() {
  await db.collection('clients').doc(UID).update({
    email: '1997marcelodaniel@gmail.com',
  })
  console.log('✅ Email del cliente actualizado correctamente.')
  process.exit(0)
}

main().catch(err => { console.error('❌', err.message); process.exit(1) })
