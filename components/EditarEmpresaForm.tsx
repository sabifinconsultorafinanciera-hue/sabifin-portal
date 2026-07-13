'use client'
import { actualizarEmpresa } from '@/app/actions/admin'
import type { Empresa } from '@/lib/types'
import { useState, useTransition } from 'react'

const INDUSTRIAS = [
  { val: 'textil',      label: 'Textil' },
  { val: 'importador',  label: 'Importador' },
  { val: 'repuestos',   label: 'Repuestos' },
  { val: 'otro',        label: 'Otro' },
]

export default function EditarEmpresaForm({ empresa }: { empresa: Empresa }) {
  const [ok, setOk]           = useState(false)
  const [error, setError]     = useState('')
  const [pending, start]      = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(''); setOk(false)
    start(async () => {
      const res = await actualizarEmpresa(empresa.id, new FormData(e.currentTarget as HTMLFormElement))
      if (res.ok) setOk(true)
      else setError(res.error ?? 'Error')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Nombre *</label>
          <input name="nombre" required defaultValue={empresa.nombre}
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Industria</label>
          <select name="industria" defaultValue={empresa.industria}
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: '1px solid var(--color-border)' }}>
            {INDUSTRIAS.map(i => <option key={i.val} value={i.val}>{i.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Estado</label>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="activa" value="true" defaultChecked={empresa.activa} />
            <span className="text-sm text-text-secondary">Activa</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="activa" value="false" defaultChecked={!empresa.activa} />
            <span className="text-sm text-text-secondary">Inactiva</span>
          </label>
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
          Empresa actualizada correctamente.
        </p>
      )}

      <button type="submit" disabled={pending}
        className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: 'var(--color-brand-green)' }}>
        {pending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
