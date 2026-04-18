import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, Lock, Unlock,
  TrendingUp, TrendingDown, Wallet, Plus, Printer
} from 'lucide-react'
import { useRelatorioDiario } from '../../hooks/useRelatorioDiario'
import { useSectores, ICONE_SECTOR } from '../../hooks/useSectores'
import { useCaixa } from '../../hooks/useCaixa'
import { formatKz, formatData, hojeISO } from '../../lib/utils'
import { Button } from '../UI/Button'
import { Loading } from '../UI/Loading'
import { Modal } from '../UI/Modal'
import { StatCard } from '../UI/Card'
import { PassagemDiariaModal } from './PassagemDiariaModal'
import { FormMovimentoCaixaSector } from './FormMovimentoCaixaSector'
import { gerarRelatorioDiarioPDF } from './RelatorioDiarioPDF'

function navegarData(data, dias) {
  const d = new Date(data + 'T00:00:00')
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

export function RelatorioDiarioPage() {
  const [data, setData] = useState(hojeISO())
  const [modalSector, setModalSector] = useState(null)   // sector para registar movimento
  const [modalPassagem, setModalPassagem] = useState(null) // sector para fechar caixa
  const [tipoMovimento, setTipoMovimento] = useState('receita')

  const { sectores, loading: loadSect } = useSectores()
  const { movimentos, resumo, passagens, loading, fecharCaixaSector, totalDia, recarregar } = useRelatorioDiario(data)
  const { registarMovimento } = useCaixa()

  if (loading || loadSect) return <Loading />

  const hoje = hojeISO()
  const isHoje = data === hoje

  function getResumSector(sectorId) {
    return resumo.find(r => r.sector_id === sectorId) || { total_receitas: 0, total_despesas: 0, saldo: 0 }
  }

  function getPassagemSector(sectorId) {
    return passagens.find(p => p.sector_id === sectorId)
  }

  function getMovsSector(sectorId) {
    return movimentos.filter(m => m.sector_id === sectorId)
  }

  function abrirMovimento(sector, tipo) {
    setModalSector(sector)
    setTipoMovimento(tipo)
  }

  async function guardarMovimento(dados) {
    // Adicionar sector, data e ano/mes ao movimento
    const d = new Date(data + 'T00:00:00')
    const payload = {
      ...dados,
      sector_id: modalSector.id,
      data_movimento: data,
      ano: d.getFullYear(),
      mes: d.getMonth() + 1,
    }
    const ok = await registarMovimento(payload)
    if (ok) { setModalSector(null); recarregar() }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Relatório Diário</h1>
          <p className="text-sm text-slate-500">
            {isHoje ? 'Hoje · ' : ''}{formatData(data)} · {sectores.length} sectores
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary"
            onClick={() => gerarRelatorioDiarioPDF(data, sectores, resumo, movimentos, passagens, totalDia)}>
            <Printer size={15} /> PDF
          </Button>
          <input
            type="date"
            value={data}
            max={hoje}
            onChange={e => setData(e.target.value)}
            className="input-field text-sm px-3 py-2 w-auto"
          />
        </div>
      </div>

      {/* Navegação de data */}
      <div className="flex items-center gap-3">
        <button onClick={() => setData(d => navegarData(d, -1))}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <div className="flex gap-2">
          {[-2,-1,0].map(offset => {
            const d = navegarData(hoje, offset)
            return (
              <button key={d} onClick={() => setData(d)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  data === d ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}>
                {offset === 0 ? 'Hoje' : offset === -1 ? 'Ontem' : formatData(d)}
              </button>
            )
          })}
        </div>
        <button onClick={() => setData(d => navegarData(d, 1))}
          disabled={data >= hoje}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors disabled:opacity-30">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Totais globais do dia */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Receitas" value={formatKz(totalDia.receitas)} color="green" icon={TrendingUp} />
        <StatCard title="Total Despesas" value={formatKz(totalDia.despesas)} color="red" icon={TrendingDown} />
        <StatCard title="Saldo do Dia" value={formatKz(totalDia.saldo)}
          color={totalDia.saldo >= 0 ? 'green' : 'red'} icon={Wallet} />
      </div>

      {/* Cards por sector */}
      <div className="grid lg:grid-cols-3 gap-5">
        {sectores.map(sector => {
          const res = getResumSector(sector.id)
          const passagem = getPassagemSector(sector.id)
          const movsSect = getMovsSector(sector.id)
          const fechado = passagem?.fechado
          const icone = ICONE_SECTOR[sector.nome] || '📦'

          return (
            <div key={sector.id} className="card border-slate-700 flex flex-col gap-4">
              {/* Header do sector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{icone}</span>
                  <div>
                    <p className="font-bold text-slate-100" style={{ color: sector.cor }}>
                      {sector.nome.toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-500">{movsSect.length} movimentos</p>
                  </div>
                </div>
                {fechado
                  ? <span className="badge-blue"><Lock size={11} /> Fechado</span>
                  : <span className="badge-yellow"><Unlock size={11} /> Aberto</span>
                }
              </div>

              {/* Resumo financeiro */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Receitas</span>
                  <span className="text-emerald-400 font-semibold">{formatKz(res.total_receitas)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Despesas</span>
                  <span className="text-red-400 font-semibold">{formatKz(res.total_despesas)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-slate-700 pt-1.5 mt-1">
                  <span className="font-semibold text-slate-300">Saldo</span>
                  <span className={`font-bold ${Number(res.saldo) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatKz(res.saldo)}
                  </span>
                </div>
              </div>

              {/* Últimos movimentos */}
              {movsSect.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {movsSect.slice(0, 6).map(m => (
                    <div key={m.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-slate-900/40">
                      <span className="text-slate-400 truncate max-w-[120px]">{m.descricao}</span>
                      <span className={`font-semibold ${m.tipo === 'receita' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {m.tipo === 'receita' ? '+' : '-'}{formatKz(m.valor)}
                      </span>
                    </div>
                  ))}
                  {movsSect.length > 6 && (
                    <p className="text-xs text-slate-500 text-center">+{movsSect.length - 6} mais</p>
                  )}
                </div>
              )}

              {/* Acções */}
              {!fechado && (
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => abrirMovimento(sector, 'receita')}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1">
                    <Plus size={12} /> Receita
                  </button>
                  <button
                    onClick={() => abrirMovimento(sector, 'despesa')}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1">
                    <Plus size={12} /> Despesa
                  </button>
                  <button
                    onClick={() => setModalPassagem(sector)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1">
                    <Lock size={12} /> Fechar
                  </button>
                </div>
              )}

              {/* Info passagem se fechado */}
              {fechado && passagem && (
                <div className="px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs text-slate-400">
                  Fechado às {new Date(passagem.data_fecho).toLocaleTimeString('pt-AO', { hour:'2-digit', minute:'2-digit' })}
                  {passagem.responsavel && ` · ${passagem.responsavel}`}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal registo de movimento */}
      {modalSector && (
        <Modal open={!!modalSector} onClose={() => setModalSector(null)}
          title={`${ICONE_SECTOR[modalSector?.nome]} ${modalSector?.nome} — ${tipoMovimento === 'receita' ? 'Receita' : 'Despesa'}`}>
          <FormMovimentoCaixaSector
            tipo={tipoMovimento}
            sector={modalSector}
            dataMovimento={data}
            onSave={guardarMovimento}
            onCancel={() => setModalSector(null)}
          />
        </Modal>
      )}

      {/* Modal passagem de caixa */}
      {modalPassagem && (
        <Modal open={!!modalPassagem} onClose={() => setModalPassagem(null)}
          title={`Fechar Caixa — ${modalPassagem?.nome}`}>
          <PassagemDiariaModal
            sector={modalPassagem}
            data={data}
            resumo={getResumSector(modalPassagem?.id)}
            passagemAnterior={null}
            onFechar={async (dados) => {
              const ok = await fecharCaixaSector(modalPassagem.id, dados)
              if (ok) setModalPassagem(null)
            }}
            onCancel={() => setModalPassagem(null)}
          />
        </Modal>
      )}
    </div>
  )
}
