'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { adminDb } from '@/lib/firebase/admin'
import { verifySession, verifyGerente } from '@/lib/dal'
import type { TipoTransito, EstadoTransito, UnidadMedida } from '@/lib/types'

export async function crearTransito(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await verifySession()
    if (!session.empresaId) return { ok: false, error: 'Sin empresa.' }

    const tipo          = formData.get('tipo') as TipoTransito
    const proveedor     = (formData.get('proveedor') as string).trim()
    const descripcion   = (formData.get('descripcion') as string).trim()
    const fechaEstimada = formData.get('fechaEstimada') as string
    const notas         = (formData.get('notas') as string ?? '').trim()

    const nombresRaw    = formData.getAll('itemNombre') as string[]
    const cantidadesRaw = formData.getAll('itemCantidad') as string[]
    const unidadesRaw   = formData.getAll('itemUnidad') as string[]

    const items = nombresRaw
      .map((nombre, i) => ({
        productoNombre: nombre.trim(),
        cantidad:       Number(cantidadesRaw[i]) || 0,
        unidad:         (unidadesRaw[i] as UnidadMedida) || 'unidad',
      }))
      .filter(i => i.productoNombre && i.cantidad > 0)

    if (!proveedor || !tipo) return { ok: false, error: 'Completá todos los campos.' }

    const estadoInicial: Record<TipoTransito, EstadoTransito> = {
      fabricacion: 'en_produccion',
      importacion: 'en_transito',
      compra:      'en_transito',
    }

    const ref = adminDb.collection('empresas').doc(session.empresaId).collection('transito').doc()
    await ref.set({
      id: ref.id, tipo, proveedor, descripcion, items,
      estado:        estadoInicial[tipo],
      fechaEstimada, notas,
      creadoEn:      new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    })

    revalidatePath('/dashboard/transito')
    revalidatePath('/dashboard')
  } catch (err) {
    console.error('[crearTransito]', err)
    return { ok: false, error: 'Error al guardar.' }
  }
  redirect('/dashboard/transito')
}

export async function actualizarEstadoTransito(
  transitoId: string,
  estado: EstadoTransito
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await verifySession()
    if (!session.empresaId) return { ok: false, error: 'Sin empresa.' }

    const empresaRef  = adminDb.collection('empresas').doc(session.empresaId)
    const transitoRef = empresaRef.collection('transito').doc(transitoId)

    if (estado === 'recibido') {
      const transitoSnap = await transitoRef.get()
      if (transitoSnap.exists) {
        const items = (transitoSnap.data()!.items ?? []) as Array<{ productoNombre: string; cantidad: number }>
        const productosSnap = await empresaRef.collection('productos').get()
        const byName = new Map(productosSnap.docs.map(d => [
          (d.data().nombre as string).toLowerCase(), d
        ]))
        const batch = adminDb.batch()
        for (const item of items) {
          const match = byName.get(item.productoNombre.toLowerCase())
          if (match) {
            const nuevo = (match.data().stockActual ?? 0) + item.cantidad
            batch.update(match.ref, { stockActual: nuevo })
          }
        }
        await batch.commit()
        revalidatePath('/dashboard/stock')
      }
    }

    await transitoRef.update({ estado, actualizadoEn: new Date().toISOString() })

    revalidatePath('/dashboard/transito')
    revalidatePath('/dashboard')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Error al actualizar.' }
  }
}
