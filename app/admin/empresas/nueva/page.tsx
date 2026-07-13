import { verifyAdmin } from '@/lib/dal'
import Link from 'next/link'
import NuevaEmpresaForm from '@/components/NuevaEmpresaForm'

export const metadata = { title: 'Nueva empresa — Admin Sabifin' }

export default async function NuevaEmpresaPage() {
  await verifyAdmin()
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/empresas" className="text-text-muted hover:text-text-primary transition-colors text-lg">←</Link>
        <h1 className="text-2xl font-bold text-text-primary">Nueva empresa</h1>
      </div>
      <div className="max-w-lg">
        <NuevaEmpresaForm />
      </div>
    </div>
  )
}
