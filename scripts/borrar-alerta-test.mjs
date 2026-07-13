import { readFileSync } from 'fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const env = readFileSync('.env.local', 'utf8')
const get = (key) => {
  const match = env.match(new RegExp(`^${key}="([\\s\\S]*?)"`, 'm'))
    ?? env.match(new RegExp(`^${key}=(.+)$`, 'm'))
  return match?.[1]?.replace(/\\n/g, '\n') ?? ''
}

initializeApp({ credential: cert({ projectId: get('FIREBASE_PROJECT_ID'), clientEmail: get('FIREBASE_CLIENT_EMAIL'), privateKey: get('FIREBASE_PRIVATE_KEY') }) })
const db = getFirestore()

const alertsSnap = await db.collection('clients').doc('y6A2VDNN2JQLj4kon1s6fy1exo42').collection('alerts').get()
for (const doc of alertsSnap.docs) {
  await doc.ref.delete()
  console.log('Borrada alerta:', doc.id)
}
console.log('Listo')
process.exit(0)
