'use client'
import { crearUsuario } from '@/app/actions/admin'
import { useState } from 'react'

export default function NuevoUsuarioForm({ empresaId }: { empresaId: string }) {
  const [error, setError]     = useState('')
  const [ok, setOk]           = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(''); setOk(false)
    setPending(true)
    const fd = new FormData(e.currentTarget)
    fd.set('empresaId', empresaId)
    const res = await crearUsuario(fd)
    setPending(false)
    if (res.ok) {
      setOk(true)
      ;(e.currentTarget as HTMLFormElement).reset()
    } else {
      setError(res.error ?? 'Error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Nombre *</label>
          <input name="nombre" required placeholder="Nombre completo"
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Email *</label>
          <input name="email" type="email" required placeholder="usuario@empresa.com"
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Contraseña *</label>
          <input name="password" type="password" required placeholder="Mínimo 6 caracteres"
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Rol *</label>
          <select name="rol"
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }}>
            <option value="vendedor">Vendedor</option>
            <option value="gerente">Gerente</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="text-sm px-4 py-3 rounded-lg"
          style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
      {ok && (
        <p className="text-sm px-4 py-3 rounded-lg"
          style={{ background: '#d1fae5', color: '#2d6a4f' }}>
          Usuario creado exitosamente.
        </p>
      )}

      <button type="submit" disabled={pending}
        className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: 'var(--color-brand-green)' }}>
        {pending ? 'Creando...' : 'Crear usuario'}
      </button>
    </form>
  )
}
