import { verifyGerente } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Producto } from '@/lib/types'
import EditarProductoForm from '@/components/EditarProductoForm'
import AjustarStockForm from '@/components/AjustarStockForm'

export const metadata = { title: 'Editar producto' }

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await verifyGerente()
  if (!session.empresaId) return null

  const snap = await adminDb
    .collection('empresas').doc(session.empresaId)
    .collection('productos').doc(id)
    .get()

  if (!snap.exists) notFound()
  const producto = snap.data() as Producto

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-2xl">

      <div className="flex items-center gap-4">
        <Link href="/dashboard/stock" className="text-text-muted hover:text-text-primary transition-colors text-lg">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{producto.nombre}</h1>
          <p className="text-sm text-text-muted mt-0.5">SKU: {producto.sku} · Stock actual: <strong>{producto.stockActual} {producto.unidad}</strong></p>
        </div>
      </div>

      {/* Ajuste de stock */}
      <div className="card">
        <h2 className="font-semibold text-text-primary mb-4">Ajuste de stock</h2>
        <AjustarStockForm productoId={id} stockActual={producto.stockActual} />
      </div>

      {/* Editar datos */}
      <div className="card">
        <h2 className="font-semibold text-text-primary mb-4">Datos del producto</h2>
        <EditarProductoForm productoId={id} producto={producto} />
      </div>

    </div>
  )
}
