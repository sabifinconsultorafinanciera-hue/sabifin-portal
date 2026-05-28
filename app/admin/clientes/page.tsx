import { verifyAdmin } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import Link from 'next/link'
import type { ClientConfig } from '@/lib/types'

export const metadata = { title: 'Clientes — Admin Sabifin' }

async function getAllClients(): Promise<ClientConfig[]> {
  const snap = await adminDb.collection('clients').get()
  return snap.docs.map(d => d.data() as ClientConfig)
}

export default async function ClientesPage() {
  await verifyAdmin()
  const clients = await getAllClients()

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Clientes</h1>
          <p className="text-sm text-text-secondary mt-1">
            {clients.length} {clients.length === 1 ? 'cliente registrado' : 'clientes registrados'}
          </p>
        </div>
        <Link
          href="/admin/clientes/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--color-brand-green)', color: '#fff' }}
        >
          + Nuevo cliente
        </Link>
      </div>

      {/* Lista */}
      {clients.length === 0 ? (
        <div className="card text-center py-16 text-text-muted">
          <p className="text-4xl mb-3">◈</p>
          <p className="font-medium">Todavía no hay clientes registrados.</p>
          <p className="text-sm mt-1">Hacé clic en "Nuevo cliente" para agregar el primero.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-bg-page)' }}>
                  {['Cliente', 'Email', 'Sheet / Pestaña', 'Acciones'].map(col => (
                    <th
                      key={col}
                      className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((client, i) => (
                  <tr
                    key={client.uid}
                    style={{
                      background: i % 2 === 0 ? '#fff' : 'var(--color-bg-page)',
                      borderTop: '1px solid var(--color-border-light)',
                    }}
                  >
                    <td className="px-5 py-4 font-semibold text-text-primary">
                      {client.clientName}
                    </td>
                    <td className="px-5 py-4 text-text-secondary">
                      {client.email}
                    </td>
                    <td className="px-5 py-4 text-text-muted font-mono text-xs">
                      <span className="truncate block max-w-xs" title={client.sheetId}>
                        {client.sheetId.slice(0, 20)}…
                      </span>
                      <span className="text-text-muted mt-0.5 block non-mono text-xs" style={{ fontFamily: 'inherit' }}>
                        {client.sheetName ?? 'Sheet1'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/clientes/${client.uid}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          background: 'var(--color-green-100)',
                          color: 'var(--color-brand-green)',
                        }}
                      >
                        ✎ Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
