'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { getSession } from '@/lib/session'
import type { Industria } from '@/lib/types'

async function requireAdmin() {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  if (!session.isAdmin)  redirect('/dashboard')
  return session
}

// ══════════════════════════════════════════════
// CLIENTES LEGACY (Google Sheets portal)
// ══════════════════════════════════════════════

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

    const userRecord = await adminAuth.createUser({ email, password, displayName: clientName })
    await adminDb.collection('clients').doc(userRecord.uid).set({
      uid: userRecord.uid, email, clientName,
      sheetId, sheetName: sheetName || 'Sheet1',
    })
    return { ok: true }
  } catch (err: unknown) {
    console.error('[Admin] createClient error:', err)
    const code = (err as { code?: string }).code
    if (code === 'auth/email-already-exists') return { ok: false, error: 'Ya existe un usuario con ese email.' }
    return { ok: false, error: 'No se pudo crear el cliente.' }
  }
}

export async function updateClient(
  uid: string,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin()
    const clientName = (formData.get('clientName') as string).trim()
    const sheetId    = (formData.get('sheetId')    as string).trim()
    const sheetName  = (formData.get('sheetName')  as string).trim()
    await adminDb.collection('clients').doc(uid).update({ clientName, sheetId, sheetName: sheetName || 'Sheet1' })
    return { ok: true }
  } catch (err) {
    console.error('[Admin] updateClient error:', err)
    return { ok: false, error: 'No se pudo actualizar el cliente.' }
  }
}

export async function deleteClient(uid: string): Promise<{ ok: boolean; error?: string }> {
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

// ══════════════════════════════════════════════
// EMPRESAS (ERP multi-tenant)
// ══════════════════════════════════════════════

export async function crearEmpresa(
  formData: FormData,
): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    await requireAdmin()
    const nombre    = (formData.get('nombre')    as string).trim()
    const industria = (formData.get('industria') as Industria)

    if (!nombre) return { ok: false, error: 'El nombre es obligatorio.' }

    const ref = adminDb.collection('empresas').doc()
    await ref.set({
      id:        ref.id,
      nombre,
      industria,
      activa:    true,
      creadaEn:  new Date().toISOString(),
    })
    revalidatePath('/admin/empresas')
    return { ok: true, id: ref.id }
  } catch (err) {
    console.error('[Admin] crearEmpresa error:', err)
    return { ok: false, error: 'No se pudo crear la empresa.' }
  }
}

export async function actualizarEmpresa(
  empresaId: string,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin()
    const nombre    = (formData.get('nombre')    as string).trim()
    const industria = (formData.get('industria') as Industria)
    const activa    = formData.get('activa') === 'true'

    await adminDb.collection('empresas').doc(empresaId).update({ nombre, industria, activa })
    revalidatePath('/admin/empresas')
    return { ok: true }
  } catch (err) {
    console.error('[Admin] actualizarEmpresa error:', err)
    return { ok: false, error: 'No se pudo actualizar la empresa.' }
  }
}

// ══════════════════════════════════════════════
// USUARIOS (dentro de una empresa)
// ══════════════════════════════════════════════

export async function crearUsuario(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin()
    const email     = (formData.get('email')     as string).trim()
    const password  = (formData.get('password')  as string).trim()
    const nombre    = (formData.get('nombre')    as string).trim()
    const rol       = formData.get('rol') as 'vendedor' | 'gerente'
    const empresaId = (formData.get('empresaId') as string).trim()

    if (!email || !password || !nombre || !empresaId) {
      return { ok: false, error: 'Todos los campos son obligatorios.' }
    }
    if (password.length < 6) return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' }

    const userRecord = await adminAuth.createUser({ email, password, displayName: nombre })

    await adminDb.collection('usuarios').doc(userRecord.uid).set({
      uid:       userRecord.uid,
      email,
      nombre,
      rol,
      empresaId,
      activo:    true,
      creadoEn:  new Date().toISOString(),
    })

    revalidatePath(`/admin/empresas/${empresaId}`)
    return { ok: true }
  } catch (err: unknown) {
    console.error('[Admin] crearUsuario error:', err)
    const code = (err as { code?: string }).code
    if (code === 'auth/email-already-exists') return { ok: false, error: 'Ya existe un usuario con ese email.' }
    return { ok: false, error: 'No se pudo crear el usuario.' }
  }
}

export async function toggleUsuarioActivo(
  uid: string,
  activo: boolean,
  empresaId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin()
    await adminDb.collection('usuarios').doc(uid).update({ activo })
    await adminAuth.updateUser(uid, { disabled: !activo })
    revalidatePath(`/admin/empresas/${empresaId}`)
    return { ok: true }
  } catch (err) {
    console.error('[Admin] toggleUsuarioActivo error:', err)
    return { ok: false, error: 'No se pudo actualizar el usuario.' }
  }
}

export async function actualizarRolUsuario(
  uid: string,
  rol: 'vendedor' | 'gerente',
  empresaId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin()
    await adminDb.collection('usuarios').doc(uid).update({ rol })
    revalidatePath(`/admin/empresas/${empresaId}`)
    return { ok: true }
  } catch (err) {
    console.error('[Admin] actualizarRolUsuario error:', err)
    return { ok: false, error: 'No se pudo cambiar el rol.' }
  }
}

export async function resetearPasswordUsuario(
  uid: string,
  nuevaPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin()
    if (nuevaPassword.length < 6) return { ok: false, error: 'Mínimo 6 caracteres.' }
    await adminAuth.updateUser(uid, { password: nuevaPassword })
    return { ok: true }
  } catch (err) {
    console.error('[Admin] resetearPasswordUsuario error:', err)
    return { ok: false, error: 'No se pudo cambiar la contraseña.' }
  }
}
