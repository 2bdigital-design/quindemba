import { useNavigate } from 'react-router-dom'
import { Wallet, TrendingUp, TrendingDown, Lock } from 'lucide-react'
import { useCaixa } from '../../hooks/useCaixa'
import { useAppStore } from '../../lib/store'
import { formatKz } from '../../lib/utils'
import { getMesNome, MESES } from '../../lib/meses'
import { Loading } from '../UI/Loading'
import { GraficoAnual } from '../Dashboard/GraficoAnual'

export function CaixaPage() {
  const navigate = useNavigate()
  const { anoActivo } = useAppStore()
  const { resumoAnual, loading } = useCaixa()
  const mesActual = new Date().getMonth() + 1

  if (loading) return <Loading />

  const totalReceitas = resumoAnual.reduce((s, r) => s + Number(r.total_receitas || 0), 0)
  const totalDespesas = resumoAnual.reduce((s, r) => s + Number(r.total_despesas || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Caixa — {anoActivo}</h1>
        <p className="text-sm text-slate-500">Fluxo de caixa anual</p>
      </div>

      {/* Totais do ano */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card border-emerald-500/20">
          <p className="text-sm text-slate-400 flex items-center gap-1.5"><TrendingUp size={14} className="text-emerald-400" /> Receitas</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{formatKz(totalReceitas)}</p>
        </div>
        <div className="card border-red-500/20">
          <p className="text-sm text-slate-400 flex items-center gap-1.5"><TrendingDown size={14} className="text-red-400" /> Despesas</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{formatKz(totalDespesas)}</p>
        </div>
        <div className="card border-amber-500/20">
          <p className="text-sm text-slate-400 flex items-center gap-1.5"><Wallet size={14} className="text-amber-400" /> Saldo</p>
          <p className={`text-2xl font-bold mt-1 ${totalReceitas - totalDespesas >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatKz(totalReceitas - totalDespesas)}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="card">
        <h3 className="section-title mb-5">Receitas vs Despesas</h3>
        <GraficoAnual dados={resumoAnual} />
      </div>

      {/* Grid de meses */}
      <div>
        <h3 className="section-title mb-3">Meses do Ano</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {MESES.map(m => {
            const d = resumoAnual.find(r => r.mes === m.numero) || {}
            const saldo = Number(d.saldo || 0)
            const isActual = m.numero === mesActual
            return (
              <button
                key={m.numero}
                onClick={() => navigate(`/caixa/${m.numero}`)}
                className={`card-hover text-left group ${isActual ? 'border-amber-500/40' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm font-semibold ${isActual ? 'text-amber-400' : 'text-slate-300'}`}>
                    {m.nome}
                  </p>
                  {d.fechado && <Lock size={11} className="text-blue-400" />}
                </div>
                <p className={`text-base font-bold ${saldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatKz(saldo)}
                </p>
                <div className="flex gap-3 mt-2 text-xs text-slate-500">
                  <span className="text-emerald-400/70">+{formatKz(d.total_receitas || 0)}</span>
                  <span className="text-red-400/70">−{formatKz(d.total_despesas || 0)}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
