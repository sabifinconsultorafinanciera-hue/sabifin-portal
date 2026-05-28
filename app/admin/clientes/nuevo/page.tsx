import { verifyAdmin } from '@/lib/dal'
import NuevoClienteForm from '@/components/NuevoClienteForm'

export const metadata = { title: 'Nuevo cliente — Admin Sabifin' }

export default async function NuevoClientePage() {
  await verifyAdmin()

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Nuevo cliente</h1>
        <p className="text-sm text-text-secondary mt-1">
          Creá el acceso y configurá el Sheet del nuevo cliente.
        </p>
      </div>

      <div className="max-w-lg">
        <div className="card">
          <NuevoClienteForm />
        </div>
      </div>
    </div>
  )
}
