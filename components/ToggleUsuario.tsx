'use client'
import { useTransition } from 'react'
import { toggleUsuarioActivo } from '@/app/actions/admin'

export default function ToggleUsuario({
  uid,
  activo,
  empresaId,
}: {
  uid: string
  activo: boolean
  empresaId: string
}) {
  const [pending, start] = useTransition()

  function toggle() {
    start(async () => {
      await toggleUsuarioActivo(uid, !activo, empresaId)
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-60"
      style={{
        background: activo ? '#d1fae5' : '#fee2e2',
        color: activo ? '#2d6a4f' : '#991b1b',
        border: `1px solid ${activo ? '#6ee7b7' : '#fca5a5'}`,
      }}
    >
      {pending ? '...' : activo ? 'Activo' : 'Inactivo'}
    </button>
  )
}
