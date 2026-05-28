import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { SessionPayload } from '@/lib/types'

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)
const SESSION_DURATION_DAYS = 7

// ── Encrypt ────────────────────────────────────────────────
export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .sign(encodedKey)
}

// ── Decrypt ────────────────────────────────────────────────
export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ['HS256'] })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

// ── Create session cookie ──────────────────────────────────
export async function createSession(payload: SessionPayload): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000)
  payload.expiresAt = expiresAt

  const token = await encrypt(payload)
  const cookieStore = await cookies()

  cookieStore.set('sabifin-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

// ── Delete session cookie ──────────────────────────────────
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('sabifin-session')
}

// ── Get current session ────────────────────────────────────
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('sabifin-session')?.value
  return decrypt(token)
}
