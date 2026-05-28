'use server'
import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { revalidatePath } from 'next/cache'

// ── Crear alerta ───────────────────────────────────────────
export async function createAlerta(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session   = await verifySession()
    const column    = (formData.get('column')    as string).trim()
    const condition = (formData.get('condition') as string).trim()
    const threshold = formData.get('threshold') ? Number(formData.get('threshold')) : null
    const email     = (formData.get('email')     as string).trim()

    if (!column || !condition || !email) {
      return { ok: false, error: 'Completá todos los campos requeridos.' }
    }

    const ref = adminDb
      .collection('clients').doc(session.userId)
      .collection('alerts').doc()

    await ref.set({
      id:        ref.id,
      clientId:  session.userId,
      column,
      condition,
      threshold,
      email,
      active:    true,
      createdAt: new Date().toISOString(),
    })

    revalidatePath('/dashboard/alertas')
    return { ok: true }
  } catch (err) {
    console.error('[Alertas] createAlerta error:', err)
    return { ok: false, error: 'No se pudo crear la alerta.' }
  }
}

// ── Activar / desactivar alerta ────────────────────────────
export async function toggleAlerta(
  alertId: string,
  active: boolean,
): Promise<void> {
  const session = await verifySession()
  await adminDb
    .collection('clients').doc(session.userId)
    .collection('alerts').doc(alertId)
    .update({ active })
  revalidatePath('/dashboard/alertas')
}

// ── Eliminar alerta ────────────────────────────────────────
export async function deleteAlerta(alertId: string): Promise<void> {
  const session = await verifySession()
  await adminDb
    .collection('clients').doc(session.userId)
    .collection('alerts').doc(alertId)
    .delete()
  revalidatePath('/dashboard/alertas')
}
