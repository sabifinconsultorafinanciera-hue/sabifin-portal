'use client'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'

interface MesData { mes: string; ventas: number; gastos: number; margen: number }

function fmtY(v: number) {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (Math.abs(v) >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`
  return `$${v}`
}

function fmtTooltip(v: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(v)
}

export default function BalanceChart({ data }: { data: MesData[] }) {
  const conDatos = data.filter(d => d.ventas > 0 || d.gastos > 0)
  if (conDatos.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-text-muted">
        Sin datos para mostrar
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8e3d0" vertical={false} />
        <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#9e9e8e' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={fmtY} tick={{ fontSize: 11, fill: '#9e9e8e' }} axisLine={false} tickLine={false} width={52} />
        <Tooltip
          formatter={(v, name) => [fmtTooltip(v as number), name === 'ventas' ? 'Ventas' : 'Gastos']}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e8e3d0' }}
          cursor={{ fill: 'rgba(27,67,50,0.05)' }}
        />
        <Legend formatter={v => v === 'ventas' ? 'Ventas' : 'Gastos'} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="ventas" fill="#2d6a4f" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar dataKey="gastos" fill="#c0392b" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}
