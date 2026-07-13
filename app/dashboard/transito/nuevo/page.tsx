import { verifySession } from '@/lib/dal'
import NuevoTransitoForm from '@/components/NuevoTransitoForm'
import Link from 'next/link'

export const metadata = { title: 'Nuevo pedido en tránsito' }

export default async function NuevoTransitoPage() {
  await verifySession()
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/transito" className="text-text-muted hover:text-text-primary transition-colors text-lg">←</Link>
        <h1 className="text-2xl font-bold text-text-primary">Nuevo pedido</h1>
      </div>
      <div className="max-w-xl">
        <NuevoTransitoForm />
      </div>
    </div>
  )
}
