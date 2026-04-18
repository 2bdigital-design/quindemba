import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, Wallet, Package,
  FileText, ArrowRight, Users
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../lib/store'
import { formatKz, formatNum } from '../../lib/utils'
import { StatCard } from '../UI/Card'
import { Loading } from '../UI/Loading'
import { GraficoAnual } from './GraficoAnual'
import { AlertasEstoque } from './AlertasEstoque'
import { BotaoNovoAno } from './BotaoNovoAno'
import { MESES, getMesNome } from '../../lib/meses'

export function DashboardPage() {
  const { anoActivo } = useAppStore()
  const navigate = useNavigate()
  const mesActual = new Date().getMonth() + 1
  const [loading, setLoading] = useState(true)
  const [dados, setDados] = useState({
    resumoAnual: [],
    estoqueActual: [],
    totalClientes: 0,
    totalFacturas: 0,
    ultimosMovimentos: [],
  })

  useEffect(() => {
    carregar()
  }, [anoActivo])

  async function carregar() {
    setLoading(true)
    const [resumo, estoque, clientes, facturas, movimentos] = await Promise.all([
      supabase.from('v_resumo_caixa_mensal').select('*').eq('ano', anoActivo).order('mes'),
      supabase.from('v_estoque_actual').select('*'),
      supabase.from('clientes').select('id', { count: 'exact', head: true }),
      supabase.from('facturas').select('id', { count: 'exact', head: true }).eq('ano', anoActivo),
      supabase.from('movimentos_caixa')
        .select('*, clientes(nome)')
        .eq('ano', anoActivo)
        .order('data_movimento', { ascending: false })
        .limit(5),
    ])
    setDados({
      resumoAnual: resumo.data || [],
      estoqueActual: estoque.data || [],
      totalClientes: clientes.count || 0,
      totalFacturas: facturas.count || 0,
      ultimosMovimentos: movimentos.data || [],
    })
    setLoading(false)
  }

  if (loading) return <Loading text="A carregar dashboard…" size="lg" />

  const mesDados = dados.resumoAnual.find(r => r.mes === mesActual) || {}
  const totalReceitas = dados.resumoAnual.reduce((s, r) => s + Number(r.total_receitas || 0), 0)
  const totalDespesas = dados.resumoAnual.reduce((s, r) => s + Number(r.total_despesas || 0), 0)
  const saldoAno = totalReceitas - totalDespesas
  const totalItensEstoque = dados.estoqueActual.reduce((s, i) => s + Number(i.quantidade_actual || 0), 0)

  const atalhos = [
    { label: 'Entradas de Estoque', desc: getMesNome(mesActual), path: `/estoque/${mesActual}/entrada`, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Registar Receita',    desc: getMesNome(mesActual), path: `/caixa/${mesActual}/receita`,  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Registar Despesa',    desc: getMesNome(mesActual), path: `/caixa/${mesActual}/despesa`,  color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
    { label: 'Nova Factura',         desc: 'Emitir documento',   path: '/facturas/nova',               color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
  ]

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {anoActivo} · Mês actual: {getMesNome(mesActual)}
          </p>
        </div>
        <BotaoNovoAno />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Receitas do Ano"
          value={formatKz(totalReceitas)}
          icon={TrendingUp}
          color="green"
          subtitle={`${getMesNome(mesActual)}: ${formatKz(mesDados.total_receitas || 0)}`}
        />
        <StatCard
          title="Despesas do Ano"
          value={formatKz(totalDespesas)}
          icon={TrendingDown}
          color="red"
          subtitle={`${getMesNome(mesActual)}: ${formatKz(mesDados.total_despesas || 0)}`}
        />
        <StatCard
          title="Saldo do Ano"
          value={formatKz(saldoAno)}
          icon={Wallet}
          color={saldoAno >= 0 ? 'green' : 'red'}
          subtitle={`Saldo ${getMesNome(mesActual)}: ${formatKz(mesDados.saldo || 0)}`}
        />
        <StatCard
          title="Itens em Estoque"
          value={formatNum(totalItensEstoque)}
          icon={Package}
          color="blue"
          subtitle={`${dados.estoqueActual.length} produtos · ${dados.totalClientes} clientes`}
        />
      </div>

      {/* Gráfico + Alertas */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card">
          <h3 className="section-title mb-5">Receitas vs Despesas — {anoActivo}</h3>
          <GraficoAnual dados={dados.resumoAnual} />
        </div>
        <div className="space-y-4">
          <AlertasEstoque itens={dados.estoqueActual} />
          {/* Stats rápidos */}
          <div className="card space-y-3">
            <h3 className="section-title">Resumo Rápido</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 flex items-center gap-2"><FileText size={14} />Facturas {anoActivo}</span>
                <span className="font-semibold text-slate-200">{dados.totalFacturas}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Users size={14} />Clientes</span>
                <span className="font-semibold text-slate-200">{dados.totalClientes}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Package size={14} />Produtos</span>
                <span className="font-semibold text-slate-200">{dados.estoqueActual.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Atalhos rápidos */}
      <div>
        <h3 className="section-title mb-3">Atalhos Rápidos — {getMesNome(mesActual)}</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {atalhos.map(a => (
            <button
              key={a.path}
              onClick={() => navigate(a.path)}
              className={`card border ${a.bg} text-left hover:scale-[1.02] transition-transform`}
            >
              <p className={`font-semibold text-sm ${a.color}`}>{a.label}</p>
              <p className="text-xs text-slate-500 mt-1">{a.desc}</p>
              <ArrowRight size={14} className={`mt-3 ${a.color}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Últimos movimentos */}
      {dados.ultimosMovimentos.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Últimos Movimentos de Caixa</h3>
            <button
              onClick={() => navigate(`/caixa/${mesActual}`)}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              Ver todos <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {dados.ultimosMovimentos.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-700/50">
                <div>
                  <p className="text-sm text-slate-300">{m.descricao}</p>
                  <p className="text-xs text-slate-500">{m.clientes?.nome || '—'} · {m.data_movimento}</p>
                </div>
                <span className={`font-semibold text-sm ${m.tipo === 'receita' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {m.tipo === 'receita' ? '+' : '-'}{formatKz(m.valor)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
