import { verifyAdmin } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import Link from 'next/link'
import type { Empresa } from '@/lib/types'

export const metadata = { title: 'Empresas — Admin Sabifin' }

const IND_LABEL: Record<string, string> = {
  textil: 'Textil', importador: 'Importador', repuestos: 'Repuestos', otro: 'Otro',
}

export default async function EmpresasPage() {
  await verifyAdmin()

  const snap = await adminDb.collection('empresas').orderBy('creadaEn', 'desc').get()
  const empresas = snap.docs.map(d => d.data() as Empresa)

  return (
    <div className="p-6 lg:p-8">

      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Empresas</h1>
          <p className="text-sm text-text-secondary mt-1">
            {empresas.length} {empresas.length === 1 ? 'empresa registrada' : 'empresas registradas'}
          </p>
        </div>
        <Link
          href="/admin/empresas/nueva"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: 'var(--color-brand-green)' }}
        >
          + Nueva empresa
        </Link>
      </div>

      {empresas.length === 0 ? (
        <div className="card text-center py-16 text-text-muted">
          <p className="text-4xl mb-3">🏢</p>
          <p className="font-medium">Todavía no hay empresas registradas.</p>
          <p className="text-sm mt-1">Hacé clic en "Nueva empresa" para empezar.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#f8f7f4', borderBottom: '1px solid var(--color-border-light)' }}>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Empresa</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Industria</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Estado</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Alta</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {empresas.map(e => (
                  <tr key={e.id} className="hover:bg-bg-page transition-colors">
                    <td className="px-5 py-4 font-semibold text-text-primary">{e.nombre}</td>
                    <td className="px-5 py-4 text-text-secondary">{IND_LABEL[e.industria] ?? e.industria}</td>
                    <td className="px-5 py-4">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          background: e.activa ? '#d1fae5' : '#fee2e2',
                          color: e.activa ? '#2d6a4f' : '#991b1b',
                        }}
                      >
                        {e.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-text-muted text-xs">
                      {new Date(e.creadaEn).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/empresas/${e.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: 'var(--color-green-100)', color: 'var(--color-brand-green)' }}
                      >
                        ✎ Gestionar
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
