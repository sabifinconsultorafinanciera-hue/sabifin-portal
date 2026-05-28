'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateClient, deleteClient } from '@/app/actions/admin'
import type { ClientConfig } from '@/lib/types'

interface Props { client: ClientConfig }

export default function EditarClienteForm({ client }: Props) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult]          = useState<{ ok: boolean; error?: string } | null>(null)
  const [deleting, setDeleting]      = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const router                       = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setResult(null)

    startTransition(async () => {
      const res = await updateClient(client.uid, formData)
      setResult(res)
    })
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    startTransition(async () => {
      const res = await deleteClient(client.uid)
      if (res.ok) {
        router.push('/admin/clientes')
      } else {
        setResult(res)
        setDeleting(false)
        setConfirmDelete(false)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Info solo lectura */}
      <div>
        <label className="label">Email</label>
        <div
          className="input-field text-text-muted"
          style={{ background: 'var(--color-bg-page)', cursor: 'default' }}
        >
          {client.email}
        </div>
      </div>

      <div>
        <label className="label">Nombre del cliente</label>
        <input
          name="clientName"
          type="text"
          className="input-field"
          defaultValue={client.clientName}
          required
        />
      </div>

      <hr style={{ borderColor: 'var(--color-border-light)' }} />

      <div>
        <label className="label">ID del Google Sheet</label>
        <input
          name="sheetId"
          type="text"
          className="input-field"
          defaultValue={client.sheetId}
          required
        />
      </div>

      <div>
        <label className="label">Nombre de la pestaña</label>
        <input
          name="sheetName"
          type="text"
          className="input-field"
          defaultValue={client.sheetName ?? ''}
          placeholder="Sheet1"
        />
      </div>

      {/* Feedback */}
      {result?.ok && (
        <div
          className="text-sm rounded-lg px-4 py-3"
          style={{ background: 'var(--color-success-bg)', color: '#1B4332' }}
        >
          ✓ Cliente actualizado correctamente.
        </div>
      )}
      {result?.error && (
        <div
          className="text-sm rounded-lg px-4 py-3"
          style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}
        >
          ✗ {result.error}
        </div>
      )}

      {/* Botones principales */}
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={isPending} style={{ flex: 1 }}>
          {isPending && !deleting ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <a
          href="/admin/clientes"
          className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-medium"
          style={{ border: '1.5px solid var(--color-border-medium)', color: 'var(--color-text-secondary)' }}
        >
          Volver
        </a>
      </div>

      {/* Zona de peligro */}
      <div
        className="rounded-lg p-4 mt-4"
        style={{ background: 'var(--color-error-bg)', border: '1px solid #f5c2c2' }}
      >
        <p className="text-sm font-semibold text-text-primary mb-2">Zona de peligro</p>
        <p className="text-xs text-text-muted mb-3">
          Esta acción elimina el acceso y los datos del cliente de forma permanente.
        </p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: confirmDelete ? 'var(--color-error)' : 'transparent',
            color: confirmDelete ? '#fff' : 'var(--color-error)',
            border: `1.5px solid var(--color-error)`,
          }}
        >
          {deleting
            ? 'Eliminando...'
            : confirmDelete
              ? '¿Confirmar eliminación?'
              : '✕ Eliminar cliente'}
        </button>
        {confirmDelete && !deleting && (
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="ml-2 text-xs text-text-muted underline"
          >
            Cancelar
          </button>
        )}
      </div>

    </form>
  )
}
