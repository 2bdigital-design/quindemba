import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, ArrowDownCircle, ArrowUpCircle, BarChart2 } from 'lucide-react'
import { useEstoque } from '../../hooks/useEstoque'
import { getMesNome } from '../../lib/meses'
import { formatKz, formatData, bgTipo } from '../../lib/utils'
import { Button } from '../UI/Button'
import { Loading } from '../UI/Loading'
import { EmptyState } from '../UI/EmptyState'
import { Modal } from '../UI/Modal'
import { ConfirmDialog } from '../UI/ConfirmDialog'
import { StatCard } from '../UI/Card'
import { MesSelector } from '../Layout/MesSelector'
import { FormMovimentoEstoque } from './FormMovimentoEstoque'

export function EstoqueMesPage() {
  const { mes } = useParams()
  const mesNum = Number(mes)
  const navigate = useNavigate()
  const { movimentos, produtos, loading, registarMovimento, eliminarMovimento, resumo } = useEstoque(mesNum)
  const [modalTipo, setModalTipo] = useState(null) // 'entrada' | 'saida'
  const [deletar, setDeletar] = useState(null)
  const [deletando, setDeletando] = useState(false)
  const [filtro, setFiltro] = useState('todos') // 'todos' | 'entrada' | 'saida'

  if (loading) return <Loading />

  const movendos = filtro === 'todos' ? movimentos : movimentos.filter(m => m.tipo === filtro)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Estoque — {getMesNome(mesNum)}</h1>
          <p className="text-sm text-slate-500">{movimentos.length} movimentos</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={() => navigate('/estoque')}>← Visão Geral</Button>
          <Button variant="success" onClick={() => setModalTipo('entrada')}>
            <ArrowDownCircle size={15} /> Entrada
          </Button>
          <Button variant="danger" onClick={() => setModalTipo('saida')}>
            <ArrowUpCircle size={15} /> Saída
          </Button>
        </div>
      </div>

      {/* Mes selector */}
      <MesSelector base="estoque" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Valor Entradas" value={formatKz(resumo.entradas)} color="green" />
        <StatCard title="Valor Saídas"   value={formatKz(resumo.saidas)}   color="red" />
        <StatCard title="Qtd. Entradas"  value={resumo.qEntradas}          color="blue" />
        <StatCard title="Qtd. Saídas"    value={resumo.qSaidas}            color="amber" />
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {['todos','entrada','saida'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filtro === f ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {f === 'todos' ? 'Todos' : f === 'entrada' ? 'Entradas' : 'Saídas'}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="card">
        {movendos.length === 0 ? (
          <EmptyState
            title="Sem movimentos"
            description={`Nenhum movimento de estoque em ${getMesNome(mesNum)}.`}
            action={<Button onClick={() => setModalTipo('entrada')} variant="primary"><Plus size={15} /> Registar Entrada</Button>}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/60">
                <tr>
                  <th className="table-header">Data</th>
                  <th className="table-header">Produto</th>
                  <th className="table-header">Tipo</th>
                  <th className="table-header text-right">Qtd.</th>
                  <th className="table-header text-right">Preço Unit.</th>
                  <th className="table-header text-right">Total</th>
                  <th className="table-header">Fornecedor / Doc.</th>
                  <th className="table-header w-10"></th>
                </tr>
              </thead>
              <tbody>
                {movendos.map(m => (
                  <tr key={m.id} className="table-row">
                    <td className="table-cell text-slate-400">{formatData(m.data_movimento)}</td>
                    <td className="table-cell font-medium text-slate-200">{m.produtos?.nome || '—'}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${bgTipo(m.tipo)}`}>
                        {m.tipo === 'entrada' ? '↓' : '↑'} {m.tipo}
                      </span>
                    </td>
                    <td className="table-cell text-right">{m.quantidade} {m.produtos?.unidade || ''}</td>
                    <td className="table-cell text-right text-slate-400">{formatKz(m.preco_unitario)}</td>
                    <td className="table-cell text-right font-semibold text-slate-200">{formatKz(m.valor_total)}</td>
                    <td className="table-cell text-slate-400 text-xs">{m.fornecedor || m.documento || '—'}</td>
                    <td className="table-cell">
                      <button
                        onClick={() => setDeletar(m)}
                        className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal entrada/saída */}
      {modalTipo && (
        <Modal open={!!modalTipo} onClose={() => setModalTipo(null)} title={modalTipo === 'entrada' ? 'Entrada de Estoque' : 'Saída de Estoque'}>
          <FormMovimentoEstoque
            tipo={modalTipo}
            produtos={produtos}
            onSave={async (dados) => {
              const ok = await registarMovimento(dados)
              if (ok) setModalTipo(null)
            }}
            onCancel={() => setModalTipo(null)}
          />
        </Modal>
      )}

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deletar}
        onClose={() => setDeletar(null)}
        title="Eliminar movimento"
        message={`Eliminar o movimento de ${deletar?.tipo} de "${deletar?.produtos?.nome}"?`}
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
