import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Download, CheckCircle, Clock, XCircle, Eye } from 'lucide-react'
import { useFacturas } from '../../hooks/useFacturas'
import { useAppStore } from '../../lib/store'
import { formatKz, formatData } from '../../lib/utils'
import { Button } from '../UI/Button'
import { Loading } from '../UI/Loading'
import { EmptyState } from '../UI/EmptyState'
import { Modal } from '../UI/Modal'
import { gerarFacturaPDF } from './FacturaPDF'

const ESTADO_BADGE = {
  pendente:   { label: 'Pendente',   class: 'badge-yellow', icon: Clock },
  pago:       { label: 'Pago',       class: 'badge-green',  icon: CheckCircle },
  cancelado:  { label: 'Cancelado',  class: 'badge-red',    icon: XCircle },
}

export function FacturasPage() {
  const navigate = useNavigate()
  const { anoActivo } = useAppStore()
  const { facturas, loading, actualizarEstado } = useFacturas()
  const [busca, setBusca] = useState('')
  const [estado, setEstado] = useState('todos')
  const [previewFactura, setPreviewFactura] = useState(null)

  if (loading) return <Loading />

  const filtradas = facturas.filter(f => {
    const matchBusca = f.numero_factura.toLowerCase().includes(busca.toLowerCase()) ||
      f.clientes?.nome?.toLowerCase().includes(busca.toLowerCase())
    const matchEstado = estado === 'todos' || f.estado === estado
    return matchBusca && matchEstado
  })

  const totalFacturado = filtradas.reduce((s, f) => s + Number(f.total || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Facturação — {anoActivo}</h1>
          <p className="text-sm text-slate-500">{facturas.length} facturas · Total: {formatKz(totalFacturado)}</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/facturas/nova')}>
          <Plus size={16} /> Nova Factura
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input-field pl-9" placeholder="Buscar factura ou cliente…"
            value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {['todos','pendente','pago','cancelado'].map(e => (
            <button key={e} onClick={() => setEstado(e)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                estado === e ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}>
              {e === 'todos' ? 'Todos' : ESTADO_BADGE[e]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="card">
        {filtradas.length === 0 ? (
          <EmptyState
            title="Sem facturas"
            description="Nenhuma factura encontrada."
            action={<Button onClick={() => navigate('/facturas/nova')} variant="primary"><Plus size={15} /> Nova Factura</Button>}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/60">
                <tr>
                  <th className="table-header">Nº Factura</th>
                  <th className="table-header">Cliente</th>
                  <th className="table-header">Data</th>
                  <th className="table-header text-right">Total</th>
                  <th className="table-header text-center">Estado</th>
                  <th className="table-header text-center">Acções</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(f => {
                  const badge = ESTADO_BADGE[f.estado] || ESTADO_BADGE.pendente
                  const BadgeIcon = badge.icon
                  return (
                    <tr key={f.id} className="table-row">
                      <td className="table-cell font-mono font-semibold text-amber-400">{f.numero_factura}</td>
                      <td className="table-cell text-slate-200">{f.clientes?.nome || '—'}</td>
                      <td className="table-cell text-slate-400">{formatData(f.data_emissao)}</td>
                      <td className="table-cell text-right font-semibold text-slate-100">{formatKz(f.total)}</td>
                      <td className="table-cell text-center">
                        <span className={badge.class}>
                          <BadgeIcon size={10} /> {badge.label}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setPreviewFactura(f)}
                            className="p-1.5 rounded text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                            title="Ver"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => gerarFacturaPDF(f).save(`${f.numero_factura.replace(/\s/g,'-')}.pdf`)}
                            className="p-1.5 rounded text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                            title="Baixar PDF"
                          >
                            <Download size={14} />
                          </button>
                          {f.estado === 'pendente' && (
                            <button
                              onClick={() => actualizarEstado(f.id, 'pago')}
                              className="p-1.5 rounded text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                              title="Marcar como pago"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview modal */}
      {previewFactura && (
        <Modal open={!!previewFactura} onClose={() => setPreviewFactura(null)} title={previewFactura.numero_factura} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-500">Cliente</p><p className="text-slate-200 font-medium">{previewFactura.clientes?.nome}</p></div>
              <div><p className="text-slate-500">Data</p><p className="text-slate-200">{formatData(previewFactura.data_emissao)}</p></div>
              <div><p className="text-slate-500">Estado</p>
                <span className={ESTADO_BADGE[previewFactura.estado]?.class}>{ESTADO_BADGE[previewFactura.estado]?.label}</span>
              </div>
              <div><p className="text-slate-500">Total</p><p className="text-xl font-bold text-amber-400">{formatKz(previewFactura.total)}</p></div>
            </div>
            {/* Itens */}
            <div className="overflow-x-auto rounded-xl border border-slate-700">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/60">
                  <tr>
                    <th className="table-header">Descrição</th>
                    <th className="table-header text-right">Qtd.</th>
                    <th className="table-header text-right">Preço Unit.</th>
                    <th className="table-header text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(previewFactura.itens_factura || []).map(item => (
                    <tr key={item.id} className="table-row">
                      <td className="table-cell">{item.descricao}</td>
                      <td className="table-cell text-right">{item.quantidade}</td>
                      <td className="table-cell text-right">{formatKz(item.preco_unitario)}</td>
                      <td className="table-cell text-right font-semibold">{formatKz(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" className="flex-1"
                onClick={() => gerarFacturaPDF(previewFactura).save(`${previewFactura.numero_factura.replace(/\s/g,'-')}.pdf`)}>
                <Download size={15} /> Baixar PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
