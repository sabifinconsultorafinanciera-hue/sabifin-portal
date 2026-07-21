import { verifyAdmin } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Empresa, Usuario } from '@/lib/types'
import EditarEmpresaForm from '@/components/EditarEmpresaForm'
import NuevoUsuarioForm from '@/components/NuevoUsuarioForm'
import ToggleUsuario from '@/components/ToggleUsuario'
import EditarUsuarioAcciones from '@/components/EditarUsuarioAcciones'

export const metadata = { title: 'Gestionar empresa — Admin Sabifin' }

export default async function EmpresaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await verifyAdmin()

  const [empSnap, usersSnap] = await Promise.all([
    adminDb.collection('empresas').doc(id).get(),
    adminDb.collection('usuarios').where('empresaId', '==', id).get(),
  ])

  if (!empSnap.exists) notFound()
  const empresa = empSnap.data() as Empresa
  const usuarios = usersSnap.docs.map(d => d.data() as Usuario)

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-3xl">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/empresas" className="text-text-muted hover:text-text-primary transition-colors text-lg">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{empresa.nombre}</h1>
          <p className="text-sm text-text-muted mt-0.5">Gestión de empresa y usuarios</p>
        </div>
      </div>

      {/* Datos empresa */}
      <div className="card">
        <h2 className="font-semibold text-text-primary mb-4">Datos de la empresa</h2>
        <EditarEmpresaForm empresa={empresa} />
      </div>

      {/* Usuarios */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
          <h2 className="font-semibold text-text-primary">
            Usuarios ({usuarios.length})
          </h2>
        </div>

        {usuarios.length === 0 ? (
          <div className="px-5 py-8 text-center text-text-muted">
            <p className="text-sm">Esta empresa no tiene usuarios todavía.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#f8f7f4', borderBottom: '1px solid var(--color-border-light)' }}>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Nombre</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Rol / Contraseña</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Activo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {usuarios.map(u => (
                  <tr key={u.uid}>
                    <td className="px-5 py-3 font-medium text-text-primary">{u.nombre}</td>
                    <td className="px-5 py-3 text-text-secondary">{u.email}</td>
                    <td className="px-5 py-3">
                      <EditarUsuarioAcciones uid={u.uid} rol={u.rol} empresaId={id} />
                    </td>
                    <td className="px-5 py-3">
                      <ToggleUsuario uid={u.uid} activo={u.activo} empresaId={id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Nuevo usuario */}
      <div className="card">
        <h2 className="font-semibold text-text-primary mb-4">Agregar usuario</h2>
        <NuevoUsuarioForm empresaId={id} />
      </div>

    </div>
  )
}
