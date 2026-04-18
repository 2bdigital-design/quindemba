import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { MESES } from '../../lib/meses'
import { formatKz } from '../../lib/utils'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl text-sm">
      <p className="font-semibold text-slate-200 mb-2">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-medium">{formatKz(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

export function GraficoAnual({ dados }) {
  const chartData = MESES.map(m => {
    const d = dados.find(x => x.mes === m.numero) || {}
    return {
      mes: m.abrev,
      Receitas: Number(d.total_receitas || 0),
      Despesas: Number(d.total_despesas || 0),
      Saldo: Number(d.saldo || 0),
    }
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
          tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: '16px', fontSize: '13px', color: '#94a3b8' }}
        />
        <Area type="monotone" dataKey="Receitas" stroke="#10b981" strokeWidth={2} fill="url(#colorReceitas)" />
        <Area type="monotone" dataKey="Despesas" stroke="#ef4444" strokeWidth={2} fill="url(#colorDespesas)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
