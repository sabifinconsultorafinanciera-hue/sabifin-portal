import { verifySession } from '@/lib/dal'
import DashboardShell from '@/components/DashboardShell'

export const metadata = {
  title: 'Dashboard — Sabifin',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifySession()

  return (
    <DashboardShell clientName={session.clientName} email={session.email}>
      {children}
    </DashboardShell>
  )
}
