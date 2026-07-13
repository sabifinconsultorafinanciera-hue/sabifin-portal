'use client'
import { useRouter } from 'next/navigation'
import { crearEmpresa } from '@/app/actions/admin'
import { useState } from 'react'

const INDUSTRIAS = [
  { val: 'textil',      label: 'Textil' },
  { val: 'importador',  label: 'Importador' },
  { val: 'repuestos',   label: 'Repuestos' },
  { val: 'otro',        label: 'Otro' },
]

export default function NuevaEmpresaForm() {
  const router = useRouter()
  const [error, setError]     = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setPending(true)
    const res = await crearEmpresa(new FormData(e.currentTarget))
    setPending(false)
    if (!res.ok) { setError(res.error ?? 'Error'); return }
    router.push(`/admin/empresas/${res.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Nombre de la empresa *</label>
        <input name="nombre" required placeholder="Ej: Textiles Del Sur SA"
          className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
          style={{ border: '1px solid var(--color-border)' }} />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Industria</label>
        <select name="industria" className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
          style={{ border: '1px solid var(--color-border)' }}>
          {INDUSTRIAS.map(i => <option key={i.val} value={i.val}>{i.label}</option>)}
        </select>
      </div>

      {error && (
        <p className="text-sm px-4 py-3 rounded-lg"
          style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}>
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.back()}
          className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary border"
          style={{ border: '1px solid var(--color-border)' }}>
          Cancelar
        </button>
        <button type="submit" disabled={pending}
          className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: 'var(--color-brand-green)' }}>
          {pending ? 'Creando...' : 'Crear empresa'}
        </button>
      </div>
    </form>
  )
}
