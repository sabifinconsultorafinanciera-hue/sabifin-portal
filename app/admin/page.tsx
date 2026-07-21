import { verifyAdmin } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import Link from 'next/link'
import type { Empresa, Usuario } from '@/lib/types'

export const metadata = { title: 'Panel Admin — Sabifin' }

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

export default async function AdminDashboardPage() {
  await verifyAdmin()

  const [empresasSnap, usuariosSnap] = await Promise.all([
    adminDb.collection('empresas').get(),
    adminDb.collection('usuarios').get(),
  ])

  const empresas = empresasSnap.docs.map(d => d.data() as Empresa)
  const usuarios = usuariosSnap.docs.map(d => d.data() as Usuario)

  const activas  = empresas.filter(e => e.activa).length
  const inactivas = empresas.length - activas
  const totalUsuarios = usuarios.length
  const activos  = usuarios.filter(u => u.activo).length

  // Per-empresa stats: user count
  const usersByEmpresa = new Map<string, number>()
  for (const u of usuarios) {
    usersByEmpresa.set(u.empresaId, (usersByEmpresa.get(u.empresaId) ?? 0) + 1)
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Panel de Administración</h1>
        <p className="text-sm text-text-secondary mt-1">Resumen global de Sabifin</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Empresas activas</p>
          <p className="text-3xl font-bold text-brand-green">{activas}</p>
        </div>
        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Empresas inactivas</p>
          <p className="text-3xl font-bold text-text-muted">{inactivas}</p>
        </div>
        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Usuarios totales</p>
          <p className="text-3xl font-bold text-text-primary">{totalUsuarios}</p>
        </div>
        <div className="card min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Usuarios activos</p>
          <p className="text-3xl font-bold text-brand-green">{activos}</p>
        </div>
      </div>

      {/* Lista empresas */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
          <h2 className="font-semibold text-text-primary">Empresas ({empresas.length})</h2>
          <Link href="/admin/empresas"
            className="text-sm font-medium"
            style={{ color: 'var(--color-brand-green)' }}>
            Gestionar →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f8f7f4', borderBottom: '1px solid var(--color-border-light)' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Empresa</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Industria</th>
                <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Usuarios</th>
                <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Estado</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {empresas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-text-muted">
                    No hay empresas registradas.
                  </td>
                </tr>
              ) : empresas.map(e => (
                <tr key={e.id}>
                  <td className="px-5 py-3 font-medium text-text-primary">{e.nombre}</td>
                  <td className="px-5 py-3 text-text-secondary capitalize">{e.industria ?? '—'}</td>
                  <td className="px-5 py-3 text-center text-text-secondary">{usersByEmpresa.get(e.id) ?? 0}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: e.activa ? '#d1fae5' : '#f3f4f6',
                        color: e.activa ? '#2d6a4f' : '#6b7280',
                      }}>
                      {e.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/empresas/${e.id}`}
                      className="text-xs font-medium"
                      style={{ color: 'var(--color-brand-green)' }}>
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
