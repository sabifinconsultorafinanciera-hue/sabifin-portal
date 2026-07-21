import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import NuevaVentaForm from '@/components/NuevaVentaForm'
import Link from 'next/link'
import type { Producto } from '@/lib/types'

export const metadata = { title: 'Nueva venta' }

export default async function NuevaVentaPage() {
  const session = await verifySession()
  if (!session.empresaId) return null

  const snap = await adminDb
    .collection('empresas').doc(session.empresaId)
    .collection('productos')
    .where('activo', '==', true)
    .get()

  const productos = snap.docs
    .map(d => d.data() as Producto)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/ventas" className="text-text-muted hover:text-text-primary transition-colors text-lg">←</Link>
        <h1 className="text-2xl font-bold text-text-primary">Nueva venta</h1>
      </div>
      <div className="max-w-2xl">
        <NuevaVentaForm productos={productos} />
      </div>
    </div>
  )
}
