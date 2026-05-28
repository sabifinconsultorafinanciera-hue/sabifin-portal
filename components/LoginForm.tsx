'use client'
import { useState, useTransition } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { loginWithIdToken } from '@/app/actions/auth'

export default function LoginForm() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        // 1. Autenticar con Firebase Auth (cliente)
        const credential = await signInWithEmailAndPassword(auth, email, password)

        // 2. Obtener ID token y enviarlo al servidor
        const idToken = await credential.user.getIdToken()
        const result  = await loginWithIdToken(idToken)

        if (result?.error) {
          setError(result.error)
        }
        // Si no hay error, loginWithIdToken redirige a /dashboard
      } catch (err: unknown) {
        const firebaseError = err as { code?: string }
        if (firebaseError.code === 'auth/invalid-credential' ||
            firebaseError.code === 'auth/wrong-password' ||
            firebaseError.code === 'auth/user-not-found') {
          setError('Email o contraseña incorrectos.')
        } else if (firebaseError.code === 'auth/too-many-requests') {
          setError('Demasiados intentos. Espera un momento e intenta de nuevo.')
        } else {
          setError('Error al iniciar sesión. Intenta de nuevo.')
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Email */}
      <div>
        <label htmlFor="email" className="label">Correo electrónico</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          className="input-field"
          placeholder="tu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={isPending}
        />
      </div>

      {/* Contraseña */}
      <div>
        <label htmlFor="password" className="label">Contraseña</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          className="input-field"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={isPending}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-lg px-3 py-2 text-sm"
          style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Botón */}
      <button
        type="submit"
        className="btn-primary mt-1"
        disabled={isPending}
      >
        {isPending ? 'Ingresando...' : 'Ingresar'}
      </button>

    </form>
  )
}
