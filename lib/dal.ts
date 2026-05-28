import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import type { SessionPayload } from '@/lib/types'

// ── Verify session — redirige a /login si no autenticado ───
export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession()

  if (!session?.userId) {
    redirect('/login')
  }

  return session
})

// ── Verify admin — redirige si no es admin ────────────────
export const verifyAdmin = cache(async (): Promise<SessionPayload> => {
  const session = await getSession()

  if (!session?.userId) redirect('/login')
  if (!session.isAdmin) redirect('/dashboard')

  return session
})

// ── Get current user (sin redirigir) ──────────────────────
export const getCurrentUser = cache(async (): Promise<SessionPayload | null> => {
  return getSession()
})
