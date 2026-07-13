'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { adminDb } from '@/lib/firebase/admin'
import { verifyGerente } from '@/lib/dal'
import type { UnidadMedida } from '@/lib/types'

export async function crearProducto(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await verifyGerente()
    if (!session.empresaId) return { ok: false, error: 'Sin empresa.' }

    const nombre       = (formData.get('nombre') as string).trim()
    const sku          = (formData.get('sku') as string).trim()
    const categoria    = (formData.get('categoria') as string).trim()
    const stockActual  = Number(formData.get('stockActual'))
    const stockMinimo  = Number(formData.get('stockMinimo'))
    const precioCompra = Number(formData.get('precioCompra'))
    const precioVenta  = Number(formData.get('precioVenta'))
    const unidad       = formData.get('unidad') as UnidadMedida

    if (!nombre || !sku) return { ok: false, error: 'Nombre y SKU son obligatorios.' }

    const ref = adminDb.collection('empresas').doc(session.empresaId).collection('productos').doc()
    await ref.set({
      id: ref.id, nombre, sku, categoria, stockActual, stockMinimo,
      precioCompra, precioVenta, unidad, activo: true,
      creadoEn: new Date().toISOString(),
    })

    revalidatePath('/dashboard/stock')
  } catch (err) {
    console.error('[crearProducto]', err)
    return { ok: false, error: 'Error al guardar el producto.' }
  }
  redirect('/dashboard/stock')
}

export async function actualizarStock(
  productoId: string,
  stockActual: number
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await verifyGerente()
    if (!session.empresaId) return { ok: false, error: 'Sin empresa.' }

    await adminDb
      .collection('empresas').doc(session.empresaId)
      .collection('productos').doc(productoId)
      .update({ stockActual })

    revalidatePath('/dashboard/stock')
    revalidatePath('/dashboard')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Error al actualizar stock.' }
  }
}
