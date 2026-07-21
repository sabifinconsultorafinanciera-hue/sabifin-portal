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

export async function actualizarProducto(
  productoId: string,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await verifyGerente()
    if (!session.empresaId) return { ok: false, error: 'Sin empresa.' }

    const nombre       = (formData.get('nombre') as string).trim()
    const sku          = (formData.get('sku') as string).trim()
    const categoria    = (formData.get('categoria') as string).trim()
    const stockMinimo  = Number(formData.get('stockMinimo'))
    const precioCompra = Number(formData.get('precioCompra'))
    const precioVenta  = Number(formData.get('precioVenta'))
    const unidad       = formData.get('unidad') as UnidadMedida

    if (!nombre || !sku) return { ok: false, error: 'Nombre y SKU son obligatorios.' }

    await adminDb
      .collection('empresas').doc(session.empresaId)
      .collection('productos').doc(productoId)
      .update({ nombre, sku, categoria, stockMinimo, precioCompra, precioVenta, unidad })

    revalidatePath('/dashboard/stock')
    revalidatePath(`/dashboard/stock/${productoId}`)
    return { ok: true }
  } catch (err) {
    console.error('[actualizarProducto]', err)
    return { ok: false, error: 'Error al actualizar el producto.' }
  }
}

export async function ajustarStock(
  productoId: string,
  cantidad: number,
  motivo: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await verifyGerente()
    if (!session.empresaId) return { ok: false, error: 'Sin empresa.' }

    const ref = adminDb
      .collection('empresas').doc(session.empresaId)
      .collection('productos').doc(productoId)

    const snap = await ref.get()
    if (!snap.exists) return { ok: false, error: 'Producto no encontrado.' }

    const stockActual = (snap.data()?.stockActual ?? 0) + cantidad
    if (stockActual < 0) return { ok: false, error: 'El stock no puede quedar negativo.' }

    await ref.update({ stockActual })
    revalidatePath('/dashboard/stock')
    revalidatePath('/dashboard')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Error al ajustar stock.' }
  }
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
