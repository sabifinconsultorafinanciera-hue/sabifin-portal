'use client'
import { actualizarRolUsuario, resetearPasswordUsuario } from '@/app/actions/admin'
import { useState, useTransition } from 'react'

export default function EditarUsuarioAcciones({
  uid, rol, empresaId,
}: {
  uid: string
  rol: 'vendedor' | 'gerente'
  empresaId: string
}) {
  const [rolActual, setRolActual]     = useState(rol)
  const [password, setPassword]       = useState('')
  const [showPass, setShowPass]       = useState(false)
  const [msg, setMsg]                 = useState('')
  const [err, setErr]                 = useState('')
  const [pendingRol, startRol]        = useTransition()
  const [pendingPass, startPass]      = useTransition()

  function resetFeedback() { setMsg(''); setErr('') }

  async function handleRol(nuevoRol: 'vendedor' | 'gerente') {
    resetFeedback()
    startRol(async () => {
      const res = await actualizarRolUsuario(uid, nuevoRol, empresaId)
      if (res.ok) { setRolActual(nuevoRol); setMsg('Rol actualizado.') }
      else setErr(res.error ?? 'Error')
    })
  }

  async function handlePass(e: React.FormEvent) {
    e.preventDefault()
    resetFeedback()
    startPass(async () => {
      const res = await resetearPasswordUsuario(uid, password)
      if (res.ok) { setMsg('Contraseña actualizada.'); setPassword(''); setShowPass(false) }
      else setErr(res.error ?? 'Error')
    })
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Rol */}
      <div className="flex items-center gap-2">
        <select
          value={rolActual}
          onChange={e => handleRol(e.target.value as 'vendedor' | 'gerente')}
          disabled={pendingRol}
          className="text-xs px-2 py-1 rounded border outline-none"
          style={{ border: '1px solid var(--color-border)' }}>
          <option value="vendedor">Vendedor</option>
          <option value="gerente">Gerente</option>
        </select>
        {pendingRol && <span className="text-xs text-text-muted">Guardando...</span>}
      </div>

      {/* Reset password */}
      {!showPass ? (
        <button
          onClick={() => { setShowPass(true); resetFeedback() }}
          className="text-xs text-text-muted hover:text-text-primary underline text-left w-fit">
          Cambiar contraseña
        </button>
      ) : (
        <form onSubmit={handlePass} className="flex gap-1 items-center">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Nueva contraseña"
            minLength={6}
            required
            className="text-xs px-2 py-1 rounded border outline-none w-32"
            style={{ border: '1px solid var(--color-border)' }} />
          <button type="submit" disabled={pendingPass}
            className="text-xs px-2 py-1 rounded font-medium text-white"
            style={{ background: 'var(--color-brand-green)' }}>
            OK
          </button>
          <button type="button" onClick={() => setShowPass(false)}
            className="text-xs text-text-muted hover:text-text-primary">
            ×
          </button>
        </form>
      )}

      {msg && <span className="text-xs" style={{ color: '#2d6a4f' }}>{msg}</span>}
      {err && <span className="text-xs" style={{ color: 'var(--color-error)' }}>{err}</span>}
    </div>
  )
}
