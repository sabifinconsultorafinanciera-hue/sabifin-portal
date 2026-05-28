'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/actions/admin'

export default function NuevoClienteForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError]            = useState<string | null>(null)
  const [success, setSuccess]        = useState(false)
  const router                       = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)

    startTransition(async () => {
      const res = await createClient(formData)
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push('/admin/clientes'), 1500)
      } else {
        setError(res.error ?? 'Error desconocido.')
      }
    })
  }

  if (success) {
    return (
      <div
        className="text-center py-10 rounded-lg text-sm font-medium"
        style={{ background: 'var(--color-success-bg)', color: '#1B4332' }}
      >
        ✓ Cliente creado correctamente. Redirigiendo…
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <div>
        <label className="label">Nombre del cliente</label>
        <input name="clientName" type="text" className="input-field" placeholder="Ej: Empresa ABC" required />
      </div>

      <div>
        <label className="label">Email</label>
        <input name="email" type="email" className="input-field" placeholder="cliente@empresa.com" required />
      </div>

      <div>
        <label className="label">Contraseña inicial</label>
        <input name="password" type="password" className="input-field" placeholder="Mínimo 6 caracteres" minLength={6} required />
      </div>

      <hr style={{ borderColor: 'var(--color-border-light)' }} />

      <div>
        <label className="label">ID del Google Sheet</label>
        <input
          name="sheetId"
          type="text"
          className="input-field"
          placeholder="1ABC...XYZ (de la URL del Sheet)"
          required
        />
        <p className="text-xs text-text-muted mt-1">
          Es el código largo que aparece en la URL del Sheet.
        </p>
      </div>

      <div>
        <label className="label">Nombre de la pestaña</label>
        <input
          name="sheetName"
          type="text"
          className="input-field"
          placeholder="Ej: movimientos 2025"
        />
        <p className="text-xs text-text-muted mt-1">
          Dejalo vacío para usar la primera pestaña.
        </p>
      </div>

      {error && (
        <div
          className="text-sm rounded-lg px-4 py-3"
          style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}
        >
          ✗ {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={isPending} style={{ flex: 1 }}>
          {isPending ? 'Creando...' : 'Crear cliente'}
        </button>
        <a
          href="/admin/clientes"
          className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ border: '1.5px solid var(--color-border-medium)', color: 'var(--color-text-secondary)' }}
        >
          Cancelar
        </a>
      </div>

    </form>
  )
}
