'use server'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { createSession, deleteSession } from '@/lib/session'
import type { ClientConfig } from '@/lib/types'

// ── Login con Firebase ID Token ────────────────────────────
export async function loginWithIdToken(idToken: string): Promise<{ error?: string }> {
  try {
    const decoded = await adminAuth.verifyIdToken(idToken)
    const uid     = decoded.uid

    // 1 — Verificar si es admin de Sabifin
    const adminDoc = await adminDb.collection('admins').doc(uid).get()
    if (adminDoc.exists) {
      await createSession({
        userId:     uid,
        email:      decoded.email ?? '',
        clientName: adminDoc.data()?.name ?? 'Admin Sabifin',
        isAdmin:    true,
        expiresAt:  new Date(),
      })
      redirect('/admin')
    }

    // 2 — Verificar si es cliente registrado
    const clientDoc = await adminDb.collection('clients').doc(uid).get()
    if (!clientDoc.exists) {
      return { error: 'Tu cuenta no está activada. Contactá a Sabifin.' }
    }

    const clientData = clientDoc.data() as ClientConfig
    await createSession({
      userId:     uid,
      email:      decoded.email ?? '',
      clientName: clientData.clientName,
      isAdmin:    false,
      expiresAt:  new Date(),
    })
  } catch (err) {
    console.error('loginWithIdToken error:', err)
    return { error: 'Error de autenticación. Verificá tus credenciales.' }
  }

  redirect('/dashboard')
}

// ── Logout ─────────────────────────────────────────────────
export async function logout(): Promise<void> {
  await deleteSession()
  redirect('/login')
}
