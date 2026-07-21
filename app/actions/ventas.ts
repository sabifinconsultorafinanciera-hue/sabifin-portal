'use server'
import { revalidatePath } from 'next/cache'
import { adminDb } from '@/lib/firebase/admin'
import { verifySession } from '@/lib/dal'
import type { ItemVenta } from '@/lib/types'

export async function crearVenta(data: {
  clienteNombre: string
  fecha:         string
  items:         ItemVenta[]
  notas:         string
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    const session = await verifySession()
    if (!session.empresaId) return { ok: false, error: 'Sin empresa asignada.' }

    const total = data.items.reduce((s, i) => s + i.subtotal, 0)
    if (total <= 0 || data.items.length === 0) return { ok: false, error: 'La venta debe tener al menos un producto.' }

    const ref = adminDb.collection('empresas').doc(session.empresaId).collection('ventas').doc()

    await ref.set({
      id:             ref.id,
      fecha:          data.fecha,
      clienteNombre:  data.clienteNombre.trim(),
      items:          data.items,
      total,
      vendedorId:     session.userId,
      vendedorNombre: session.userName,
      estado:         'pendiente',
      notas:          data.notas.trim(),
      creadaEn:       new Date().toISOString(),
    })

    // Descontar stock de cada item
    for (const item of data.items) {
      if (!item.productoId) continue
      const prodRef = adminDb
        .collection('empresas').doc(session.empresaId)
        .collection('productos').doc(item.productoId)
      const snap = await prodRef.get()
      const stockActual = (snap.data()?.stockActual ?? 0) - item.cantidad
      await prodRef.update({ stockActual: Math.max(0, stockActual) })
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/ventas')
    revalidatePath('/dashboard/stock')
    return { ok: true, id: ref.id }
  } catch (err) {
    console.error('[crearVenta]', err)
    return { ok: false, error: 'Error al guardar la venta.' }
  }
}

export async function actualizarEstadoVenta(
  ventaId: string,
  estado: 'pendiente' | 'confirmada' | 'entregada' | 'cancelada'
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await verifySession()
    if (!session.empresaId) return { ok: false, error: 'Sin empresa.' }

    await adminDb
      .collection('empresas').doc(session.empresaId)
      .collection('ventas').doc(ventaId)
      .update({ estado })

    revalidatePath('/dashboard/ventas')
    revalidatePath('/dashboard')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Error al actualizar.' }
  }
}
