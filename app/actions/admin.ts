'use server'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { getSession } from '@/lib/session'

// ── Guard: solo admins ─────────────────────────────────────
async function requireAdmin() {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  if (!session.isAdmin)  redirect('/dashboard')
  return session
}

// ── Crear cliente ──────────────────────────────────────────
export async function createClient(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin()

    const email      = (formData.get('email')      as string).trim()
    const password   = (formData.get('password')   as string).trim()
    const clientName = (formData.get('clientName') as string).trim()
    const sheetId    = (formData.get('sheetId')    as string).trim()
    const sheetName  = (formData.get('sheetName')  as string).trim()

    // Crear usuario en Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: clientName,
    })

    // Crear documento en Firestore
    await adminDb.collection('clients').doc(userRecord.uid).set({
      uid:        userRecord.uid,
      email,
      clientName,
      sheetId,
      sheetName:  sheetName || 'Sheet1',
    })

    return { ok: true }
  } catch (err: unknown) {
    console.error('[Admin] createClient error:', err)
    const code = (err as { code?: string }).code
    if (code === 'auth/email-already-exists') {
      return { ok: false, error: 'Ya existe un usuario con ese email.' }
    }
    return { ok: false, error: 'No se pudo crear el cliente.' }
  }
}

// ── Actualizar cliente ─────────────────────────────────────
export async function updateClient(
  uid: string,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin()

    const clientName = (formData.get('clientName') as string).trim()
    const sheetId    = (formData.get('sheetId')    as string).trim()
    const sheetName  = (formData.get('sheetName')  as string).trim()

    await adminDb.collection('clients').doc(uid).update({
      clientName,
      sheetId,
      sheetName: sheetName || 'Sheet1',
    })

    return { ok: true }
  } catch (err) {
    console.error('[Admin] updateClient error:', err)
    return { ok: false, error: 'No se pudo actualizar el cliente.' }
  }
}

// ── Eliminar cliente ───────────────────────────────────────
export async function deleteClient(
  uid: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin()

    await adminDb.collection('clients').doc(uid).delete()
    await adminAuth.deleteUser(uid)

    return { ok: true }
  } catch (err) {
    console.error('[Admin] deleteClient error:', err)
    return { ok: false, error: 'No se pudo eliminar el cliente.' }
  }
}
