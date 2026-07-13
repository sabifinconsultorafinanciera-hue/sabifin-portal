'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { adminDb } from '@/lib/firebase/admin'
import { verifyGerente } from '@/lib/dal'
import type { CategoriaGasto } from '@/lib/types'

export async function crearGasto(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await verifyGerente()
    if (!session.empresaId) return { ok: false, error: 'Sin empresa.' }

    const fecha       = formData.get('fecha') as string
    const categoria   = formData.get('categoria') as CategoriaGasto
    const descripcion = (formData.get('descripcion') as string).trim()
    const monto       = Number(formData.get('monto'))

    if (!fecha || !categoria || !descripcion || monto <= 0) {
      return { ok: false, error: 'Completá todos los campos.' }
    }

    const ref = adminDb.collection('empresas').doc(session.empresaId).collection('gastos').doc()
    await ref.set({
      id: ref.id, fecha, categoria, descripcion, monto,
      registradoPor: session.userName,
      creadoEn:      new Date().toISOString(),
    })

    revalidatePath('/dashboard/gastos')
    revalidatePath('/dashboard/balance')
    revalidatePath('/dashboard')
  } catch (err) {
    console.error('[crearGasto]', err)
    return { ok: false, error: 'Error al guardar.' }
  }
  redirect('/dashboard/gastos')
}

export async function eliminarGasto(gastoId: string): Promise<void> {
  const session = await verifyGerente()
  if (!session.empresaId) return
  await adminDb
    .collection('empresas').doc(session.empresaId)
    .collection('gastos').doc(gastoId)
    .delete()
  revalidatePath('/dashboard/gastos')
  revalidatePath('/dashboard/balance')
}
