import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Package, AlertTriangle } from 'lucide-react'
import { useEstoque, useProdutos } from '../../hooks/useEstoque'
import { formatKz, formatNum } from '../../lib/utils'
import { Button } from '../UI/Button'
import { Loading } from '../UI/Loading'
import { Modal } from '../UI/Modal'
import { FormProduto } from './FormProduto'
import { MESES } from '../../lib/meses'
import { useNavigate as useNav } from 'react-router-dom'

export function EstoquePage() {
  const navigate = useNavigate()
  const { estoqueActual, loading } = useEstoque()
  const { salvarProduto } = useProdutos()
  const [busca, setBusca] = useState('')
  const [modalProduto, setModalProduto] = useState(false)

  if (loading) return <Loading />

  const filtrados = estoqueActual.filter(i =>
    i.nome.toLowerCase().includes(busca.toLowerCase())
  )
  const emAlerta = filtrados.filter(i => Number(i.quantidade_actual) <= Number(i.estoque_minimo))

  const mesActual = new Date().getMonth() + 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Estoque</h1>
          <p className="text-sm text-slate-500 mt-0.5">{estoqueActual.length} produtos · {emAlerta.length} em alerta</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(`/estoque/${mesActual}/entrada`)}>
            <Plus size={16} /> Entrada
          </Button>
          <Button variant="primary" onClick={() => setModalProduto(true)}>
            <Plus size={16} /> Produto
          </Button>
        </div>
      </div>

      {/* Meses atalho */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {MESES.map(m => (
          <button
            key={m.numero}
            onClick={() => navigate(`/estoque/${m.numero}`)}
            className={`card-hover text-center py-3 cursor-pointer ${
              m.numero === mesActual ? 'border-amber-500/40' : ''
            }`}
          >
            <p className={`text-sm font-semibold ${m.numero === mesActual ? 'text-amber-400' : 'text-slate-300'}`}>
              {m.abrev}
            </p>
            <p className="text-xs text-slate-500">{m.numero}</p>
          </button>
        ))}
      </div>

      {/* Alertas */}
      {emAlerta.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-400 text-sm">
          <AlertTriangle size={16} />
          <span>{emAlerta.length} produto(s) com estoque abaixo do mínimo</span>
        </div>
      )}

      {/* Tabela */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input-field pl-9"
              placeholder="Buscar produto…"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="table-header">Produto</th>
                <th className="table-header text-right">Quantidade</th>
                <th className="table-header text-right">Mínimo</th>
                <th className="table-header text-right">Preço Unit.</th>
                <th className="table-header text-right">Valor Total</th>
                <th className="table-header text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500">Nenhum produto encontrado.</td></tr>
              ) : filtrados.map(item => {
                const alerta = Number(item.quantidade_actual) <= Number(item.estoque_minimo)
                return (
                  <tr key={item.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-slate-500" />
                        <span className="font-medium text-slate-200">{item.nome}</span>
                      </div>
                    </td>
                    <td className="table-cell text-right">
                      <span className={`font-semibold ${alerta ? 'text-red-400' : 'text-emerald-400'}`}>
                        {formatNum(item.quantidade_actual)} {item.unidade}
                      </span>
                    </td>
                    <td className="table-cell text-right text-slate-400">{item.estoque_minimo} {item.unidade}</td>
                    <td className="table-cell text-right text-slate-300">{formatKz(item.preco_unitario)}</td>
                    <td className="table-cell text-right text-slate-300">
                      {formatKz(item.quantidade_actual * item.preco_unitario)}
                    </td>
                    <td className="table-cell text-center">
                      {alerta
                        ? <span className="badge-red"><AlertTriangle size={10} /> Baixo</span>
                        : <span className="badge-green">OK</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalProduto} onClose={() => setModalProduto(false)} title="Novo Produto">
        <FormProduto
          onSave={async (dados) => {
            const ok = await salvarProduto(dados)
            if (ok) setModalProduto(false)
          }}
          onCancel={() => setModalProduto(false)}
        />
      </Modal>
    </div>
  )
}
