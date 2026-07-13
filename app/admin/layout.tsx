import { verifyAdmin } from '@/lib/dal'
import AdminShell from '@/components/AdminShell'

export const metadata = { title: 'Admin — Sabifin' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyAdmin()

  return (
    <AdminShell adminName={session.userName}>
      {children}
    </AdminShell>
  )
}
