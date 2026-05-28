'use client'
import type { SheetData } from '@/lib/types'

interface DataTableProps {
  data: SheetData
}

export default function DataTable({ data }: DataTableProps) {
  if (data.headers.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted text-sm">
        No hay datos disponibles en este momento.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border-light">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--color-brand-green)' }}>
            {data.headers.map(header => (
              <th
                key={header}
                className="text-left px-4 py-3 font-semibold"
                style={{ color: 'var(--color-text-on-brand)' }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr
              key={i}
              className="border-t border-border-light transition-colors"
              style={{
                background: i % 2 === 0 ? '#FFFFFF' : '#FAFAF8',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-hover)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? '#FFFFFF' : '#FAFAF8'
              }}
            >
              {data.headers.map(header => (
                <td
                  key={header}
                  className="px-4 py-3"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {row[header] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer con timestamp */}
      <div
        className="px-4 py-2 text-xs border-t border-border-light"
        style={{
          color: 'var(--color-text-muted)',
          background: '#FAFAF8',
        }}
      >
        {data.rows.length} registros · Actualizado {new Date(data.lastUpdated).toLocaleString('es-MX')}
      </div>
    </div>
  )
}
