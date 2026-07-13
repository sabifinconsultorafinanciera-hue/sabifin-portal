import { verifyGerente } from '@/lib/dal'
import Link from 'next/link'
import NuevoGastoForm from '@/components/NuevoGastoForm'

export const metadata = { title: 'Registrar gasto' }

export default async function NuevoGastoPage() {
  await verifyGerente()
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/gastos" className="text-text-muted hover:text-text-primary transition-colors text-lg">←</Link>
        <h1 className="text-2xl font-bold text-text-primary">Registrar gasto</h1>
      </div>
      <div className="max-w-lg">
        <NuevoGastoForm />
      </div>
    </div>
  )
}
