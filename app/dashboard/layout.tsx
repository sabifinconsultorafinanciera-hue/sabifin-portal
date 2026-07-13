import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import DashboardShell from '@/components/DashboardShell'
import type { Empresa } from '@/lib/types'

export const metadata = { title: 'Dashboard — Sabifin' }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession()

  let empresaNombre = 'Sabifin'
  if (session.empresaId) {
    const doc = await adminDb.collection('empresas').doc(session.empresaId).get()
    if (doc.exists) empresaNombre = (doc.data() as Empresa).nombre
  }

  return (
    <DashboardShell
      userName={session.userName}
      email={session.email}
      rol={session.rol}
      empresa={empresaNombre}
    >
      {children}
    </DashboardShell>
  )
}
