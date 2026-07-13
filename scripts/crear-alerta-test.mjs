import { readFileSync } from 'fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Leer .env.local manualmente
const env = readFileSync('.env.local', 'utf8')
const get = (key) => {
  const match = env.match(new RegExp(`^${key}="([\\s\\S]*?)"`, 'm'))
    ?? env.match(new RegExp(`^${key}=(.+)$`, 'm'))
  return match?.[1]?.replace(/\\n/g, '\n') ?? ''
}

initializeApp({
  credential: cert({
    projectId:   get('FIREBASE_PROJECT_ID'),
    clientEmail: get('FIREBASE_CLIENT_EMAIL'),
    privateKey:  get('FIREBASE_PRIVATE_KEY'),
  }),
})

const db  = getFirestore()
const ref = db.collection('clients')
             .doc('y6A2VDNN2JQLj4kon1s6fy1exo42')
             .collection('alerts')
             .doc()

await ref.set({
  id:        ref.id,
  clientId:  'y6A2VDNN2JQLj4kon1s6fy1exo42',
  column:    'Monto',
  condition: 'greater_than',
  threshold: 0,
  email:     'sabifinconsultorafinanciera@gmail.com',
  active:    true,
  createdAt: new Date().toISOString(),
})

console.log('Alerta de prueba creada. ID:', ref.id)
process.exit(0)
