import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, TrendingUp, TrendingDown, Lock, Unlock } from 'lucide-react'
import { useCaixa } from '../../hooks/useCaixa'
import { getMesNome } from '../../lib/meses'
import { formatKz, formatData, bgTipo } from '../../lib/utils'
import { useAppStore } from '../../lib/store'
import { Button } from '../UI/Button'
import { Loading } from '../UI/Loading'
import { EmptyState } from '../UI/EmptyState'
import { Modal } from '../UI/Modal'
import { ConfirmDialog } from '../UI/ConfirmDialog'
import { StatCard } from '../UI/Card'
import { MesSelector } from '../Layout/MesSelector'
import { FormMovimentoCaixa } from './FormMovimentoCaixa'
import { PassagemCaixaModal } from './PassagemCaixaModal'

export function CaixaMesPage() {
  const { mes } = useParams()
  const mesNum = Number(mes)
  const navigate = useNavigate()
  const { anoActivo } = useAppStore()
  const { movimentos, passagem, loading, registarMovimento, eliminarMovimento, fecharMes, resumo } = useCaixa(mesNum)
  const [modalTipo, setModalTipo] = useState(null)
  const [modalPassagem, setModalPassagem] = useState(false)
  const [deletar, setDeletar] = useState(null)
  const [deletando, setDeletando] = useState(false)
  const [filtro, setFiltro] = useState('todos')

  if (loading) return <Loading />

  const movsFiltrados = filtro === 'todos' ? movimentos : movimentos.filter(m => m.tipo === filtro)
  const fechado = passagem?.fechado

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="page-title">Caixa — {getMesNome(mesNum)}</h1>
            {fechado
              ? <span className="badge-blue"><Lock size={11} /> Fechado</span>
              : <span className="badge-yellow"><Unlock size={11} /> Aberto</span>
            }
          </div>
          <p className="text-sm text-slate-500">{movimentos.length} movimentos</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!fechado && (
            <>
              <Button variant="success" onClick={() => setModalTipo('receita')}>
                <TrendingUp size={15} /> Receita
              </Button>
              <Button variant="danger" onClick={() => setModalTipo('despesa')}>
                <TrendingDown size={15} /> Despesa
              </Button>
              <Button variant="primary" onClick={() => setModalPassagem(true)}>
                <Lock size={15} /> Fechar Mês
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => navigate('/caixa')}>← Visão Geral</Button>
        </div>
      </div>

      {/* Mes selector */}
      <MesSelector base="caixa" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Saldo Anterior"  value={formatKz(resumo.saldo_anterior)} color="blue"  />
        <StatCard title="Total Receitas"  value={formatKz(resumo.receitas)}       color="green" />
        <StatCard title="Total Despesas"  value={formatKz(resumo.despesas)}       color="red"   />
        <StatCard
          title="Saldo do Mês"
          value={formatKz(resumo.saldo)}
          color={resumo.saldo >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Alerta mês fechado */}
      {fechado && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-blue-400 text-sm">
          <Lock size={15} />
          Este mês foi fechado. Saldo transferido para {getMesNome(mesNum + 1) || 'próximo ano'}.
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2">
        {['todos','receita','despesa'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filtro === f ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {f === 'todos' ? 'Todos' : f === 'receita' ? 'Receitas' : 'Despesas'}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="card">
        {movsFiltrados.length === 0 ? (
          <EmptyState
            title="Sem movimentos"
            description={`Nenhum registo de caixa em ${getMesNome(mesNum)}.`}
            action={!fechado && (
              <div className="flex gap-2">
                <Button onClick={() => setModalTipo('receita')} variant="success"><Plus size={15} /> Receita</Button>
                <Button onClick={() => setModalTipo('despesa')} variant="danger"><Plus size={15} /> Despesa</Button>
              </div>
            )}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/60">
                <tr>
                  <th className="table-header">Data</th>
                  <th className="table-header">Descrição</th>
                  <th className="table-header">Tipo</th>
                  <th className="table-header">Categoria</th>
                  <th className="table-header">Cliente</th>
                  <th className="table-header text-right">Valor</th>
                  <th className="table-header">Pagamento</th>
                  {!fechado && <th className="table-header w-10"></th>}
                </tr>
              </thead>
              <tbody>
                {movsFiltrados.map(m => (
                  <tr key={m.id} className="table-row">
                    <td className="table-cell text-slate-400">{formatData(m.data_movimento)}</td>
                    <td className="table-cell text-slate-200 font-medium max-w-[200px] truncate">{m.descricao}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${bgTipo(m.tipo)}`}>
                        {m.tipo === 'receita' ? '↑' : '↓'} {m.tipo}
                      </span>
                    </td>
                    <td className="table-cell text-slate-400 text-xs">{m.categorias?.nome || '—'}</td>
                    <td className="table-cell text-slate-400 text-xs">{m.clientes?.nome || '—'}</td>
                    <td className={`table-cell text-right font-semibold ${m.tipo === 'receita' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {m.tipo === 'receita' ? '+' : '−'}{formatKz(m.valor)}
                    </td>
                    <td className="table-cell text-slate-500 text-xs capitalize">{m.forma_pagamento || '—'}</td>
                    {!fechado && (
                      <td className="table-cell">
                        <button
                          onClick={() => setDeletar(m)}
                          className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modais */}
      {modalTipo && (
        <Modal open={!!modalTipo} onClose={() => setModalTipo(null)} title={modalTipo === 'receita' ? 'Registar Receita' : 'Registar Despesa'}>
          <FormMovimentoCaixa
            tipo={modalTipo}
            onSave={async (dados) => {
              const ok = await registarMovimento(dados)
              if (ok) setModalTipo(null)
            }}
            onCancel={() => setModalTipo(null)}
          />
        </Modal>
      )}

      <Modal open={modalPassagem} onClose={() => setModalPassagem(false)} title="Passagem de Caixa">
        <PassagemCaixaModal
          resumo={resumo}
          mes={mesNum}
          ano={anoActivo}
          onFechar={async (dados) => {
            const ok = await fecharMes(dados)
            if (ok) setModalPassagem(false)
          }}
          onCancel={() => setModalPassagem(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deletar}
        onClose={() => setDeletar(null)}
        title="Eliminar movimento"
        message={`Eliminar "${deletar?.descricao}"?`}
        loading={deletando}
        onConfirm={async () => {
          setDeletando(true)
          await eliminarMovimento(deletar.id)
          setDeletando(false)
          setDeletar(null)
        }}
      />
    </div>
  )
}
