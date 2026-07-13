import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import type { SessionPayload } from '@/lib/types'

// ── Sesión válida (cualquier usuario logueado) ─────────────
export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  return session
})

// ── Solo admins Sabifin ────────────────────────────────────
export const verifyAdmin = cache(async (): Promise<SessionPayload> => {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  if (!session.isAdmin) redirect('/dashboard')
  return session
})

// ── Solo gerentes (o admins) ──────────────────────────────
export const verifyGerente = cache(async (): Promise<SessionPayload> => {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  if (session.rol === 'vendedor') redirect('/dashboard')
  return session
})

// ── Sin redirigir (para layouts que necesitan el user) ────
export const getCurrentUser = cache(async (): Promise<SessionPayload | null> => {
  return getSession()
})
