'use server'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { createSession, deleteSession } from '@/lib/session'
import type { Usuario } from '@/lib/types'

export async function loginWithIdToken(idToken: string): Promise<{ error?: string }> {
  let redirectTo = '/dashboard'

  try {
    const decoded = await adminAuth.verifyIdToken(idToken)
    const uid     = decoded.uid

    // 1 — Verificar si es admin de Sabifin (custom claim)
    if (decoded.sabifin_admin === true) {
      await createSession({
        userId:    uid,
        email:     decoded.email ?? '',
        userName:  'Admin Sabifin',
        empresaId: null,
        rol:       'admin_sabifin',
        isAdmin:   true,
        expiresAt: new Date(),
      })
      redirectTo = '/admin'
    } else {
      // 2 — Verificar si es usuario de una empresa
      const usuarioDoc = await adminDb.collection('usuarios').doc(uid).get()
      if (!usuarioDoc.exists) {
        return { error: 'Tu cuenta no está activada. Contactá a Sabifin.' }
      }

      const usuario = usuarioDoc.data() as Usuario
      if (!usuario.activo) {
        return { error: 'Tu cuenta está desactivada. Contactá a Sabifin.' }
      }

      await createSession({
        userId:    uid,
        email:     decoded.email ?? '',
        userName:  usuario.nombre,
        empresaId: usuario.empresaId,
        rol:       usuario.rol,
        isAdmin:   false,
        expiresAt: new Date(),
      })
    }
  } catch (err) {
    console.error('loginWithIdToken error:', err)
    return { error: 'Error de autenticación. Verificá tus credenciales.' }
  }

  redirect(redirectTo)
}

export async function logout(): Promise<void> {
  await deleteSession()
  redirect('/login')
}
