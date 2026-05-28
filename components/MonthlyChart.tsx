'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { MonthSummary } from '@/lib/analytics'
import { formatMoney } from '@/lib/analytics'

// ── Helpers ────────────────────────────────────────────────
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function fmtY(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000)     return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

// ── Tooltip personalizado ──────────────────────────────────
interface TooltipEntry { name: string; value: number; color: string }
interface TooltipProps {
  active?:  boolean
  payload?: TooltipEntry[]
  label?:   string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E8E3DB',
        borderRadius: 10,
        boxShadow: '0 4px 12px rgba(27,67,50,0.12)',
        padding: '10px 14px',
        minWidth: 170,
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>
        {capitalize(label ?? '')}
      </p>
      {payload.map(entry => (
        <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
          <span style={{ color: '#4A4A4A' }}>{entry.name}:</span>
          <span style={{ fontWeight: 600, color: '#1A1A1A', marginLeft: 'auto' }}>
            {formatMoney(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Componente principal ───────────────────────────────────
interface Props { data: MonthSummary[] }

export default function MonthlyChart({ data }: Props) {
  const displayData = data.map(d => ({ ...d, mes: capitalize(d.mes) }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={displayData} margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E3DB" vertical={false} />
        <XAxis
          dataKey="mes"
          tick={{ fontSize: 11, fill: '#888880' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={fmtY}
          tick={{ fontSize: 11, fill: '#888880' }}
          axisLine={false}
          tickLine={false}
          width={58}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(27,67,50,0.05)' }} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 12, color: '#4A4A4A' }}
        />
        <Bar dataKey="ingresos" name="Ingresos" fill="#52B788" radius={[4, 4, 0, 0]} maxBarSize={44} />
        <Bar dataKey="egresos"  name="Egresos"  fill="#1B4332" radius={[4, 4, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ResponsiveContainer>
  )
}
