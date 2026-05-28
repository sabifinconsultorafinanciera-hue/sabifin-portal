import { verifyAdmin } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import EditarClienteForm from '@/components/EditarClienteForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ClientConfig } from '@/lib/types'

export const metadata = { title: 'Editar cliente — Admin Sabifin' }

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ uid: string }>
}) {
  await verifyAdmin()

  const { uid } = await params
  const doc = await adminDb.collection('clients').doc(uid).get()

  if (!doc.exists) notFound()

  const client = doc.data() as ClientConfig

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <Link
            href="/admin/clientes"
            className="mt-1 text-text-muted hover:text-text-primary transition-colors text-lg leading-none"
            title="Volver a clientes"
          >
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{client.clientName}</h1>
            <p className="text-sm text-text-secondary mt-1">{client.email}</p>
          </div>
        </div>
        <Link
          href={`/admin/clientes/${client.uid}/preview`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--color-green-100)', color: 'var(--color-brand-green)' }}
        >
          ◇ Ver como cliente
        </Link>
      </div>

      <div className="max-w-lg">
        <div className="card">
          <EditarClienteForm client={client} />
        </div>
      </div>

    </div>
  )
}
