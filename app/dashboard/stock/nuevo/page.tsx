import { verifyGerente } from '@/lib/dal'
import Link from 'next/link'
import NuevoProductoForm from '@/components/NuevoProductoForm'

export const metadata = { title: 'Nuevo producto' }

export default async function NuevoProductoPage() {
  await verifyGerente()
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/stock" className="text-text-muted hover:text-text-primary transition-colors text-lg">←</Link>
        <h1 className="text-2xl font-bold text-text-primary">Nuevo producto</h1>
      </div>
      <div className="max-w-lg">
        <NuevoProductoForm />
      </div>
    </div>
  )
}
