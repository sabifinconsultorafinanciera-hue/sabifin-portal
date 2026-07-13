import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import Link from 'next/link'
import EstadoTransitoSelector from '@/components/EstadoTransitoSelector'
import type { Transito } from '@/lib/types'

export const metadata = { title: 'En tránsito' }

const TIPO_LABEL: Record<string, string> = {
  fabricacion: 'Fabricación',
  importacion: 'Importación',
  compra:      'Compra',
}
const TIPO_COLOR: Record<string, string> = {
  fabricacion: '#2d6a4f',
  importacion: '#1a3a8f',
  compra:      '#7a5c00',
}
const ESTADO_LABEL: Record<string, string> = {
  en_produccion:   'En producción',
  listo_embarque:  'Listo p/ embarque',
  en_transito:     'En tránsito',
  en_aduana:       'En aduana',
  en_deposito:     'En depósito',
  recibido:        'Recibido',
}
const ESTADO_COLOR: Record<string, string> = {
  en_produccion:  '#b5893a',
  listo_embarque: '#2d6a4f',
  en_transito:    '#1a3a8f',
  en_aduana:      '#c0392b',
  en_deposito:    '#7a5c00',
  recibido:       '#52b788',
}

export default async function TransitoPage() {
  const session = await verifySession()
  if (!session.empresaId) return null

  const snap = await adminDb
    .collection('empresas').doc(session.empresaId)
    .collection('transito')
    .orderBy('creadoEn', 'desc')
    .get()

  const todos     = snap.docs.map(d => d.data() as Transito)
  const activos   = todos.filter(t => t.estado !== 'recibido')
  const recibidos = todos.filter(t => t.estado === 'recibido').slice(0, 10)

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">En tránsito</h1>
          <p className="text-sm text-text-secondary mt-1">{activos.length} pedidos activos</p>
        </div>
        <Link href="/dashboard/transito/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'var(--color-brand-green)' }}>
          + Nuevo pedido
        </Link>
      </div>

      {/* Activos */}
      {activos.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-3xl mb-3">⇢</p>
          <p className="font-semibold text-text-primary">Sin pedidos activos</p>
          <p className="text-sm text-text-muted mt-1">
            <Link href="/dashboard/transito/nuevo" style={{ color: 'var(--color-brand-green)' }}>
              Registrar un pedido →
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activos.map(t => (
            <div key={t.id} className="card space-y-4">
              {/* Header de la card */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{ background: `${TIPO_COLOR[t.tipo]}18`, color: TIPO_COLOR[t.tipo] }}>
                      {TIPO_LABEL[t.tipo]}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: `${ESTADO_COLOR[t.estado]}18`, color: ESTADO_COLOR[t.estado] }}>
                      {ESTADO_LABEL[t.estado]}
                    </span>
                  </div>
                  <p className="font-semibold text-text-primary mt-1.5">{t.proveedor}</p>
                  {t.descripcion && (
                    <p className="text-sm text-text-secondary mt-0.5">{t.descripcion}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-text-muted">Estimado</p>
                  <p className="text-sm font-medium text-text-primary">{t.fechaEstimada}</p>
                </div>
              </div>

              {/* Items */}
              {t.items.length > 0 && (
                <div className="space-y-1">
                  {t.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-text-secondary">{item.productoNombre}</span>
                      <span className="font-medium text-text-primary">{item.cantidad} {item.unidad}</span>
                    </div>
                  ))}
                </div>
              )}

              {t.notas && (
                <p className="text-xs text-text-muted italic border-t border-border-light pt-3">{t.notas}</p>
              )}

              {/* Cambiar estado */}
              <div className="border-t border-border-light pt-3">
                <EstadoTransitoSelector
                  transitoId={t.id}
                  estadoActual={t.estado}
                  tipo={t.tipo}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Historial recibidos */}
      {recibidos.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
            Últimos recibidos
          </h2>
          <div className="card p-0 overflow-hidden">
            <div className="divide-y divide-border-light">
              {recibidos.map(t => (
                <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{t.proveedor}</p>
                    <p className="text-xs text-text-muted">{TIPO_LABEL[t.tipo]} · {t.fechaEstimada}</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: '#52b78820', color: '#52b788' }}>
                    Recibido
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
