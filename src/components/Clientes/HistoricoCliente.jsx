import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../lib/store'
import { formatKz, formatData } from '../../lib/utils'
import { Loading } from '../UI/Loading'
import { Button } from '../UI/Button'
import { FileText, Wallet } from 'lucide-react'

export function HistoricoCliente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { anoActivo } = useAppStore()
  const [cliente, setCliente] = useState(null)
  const [facturas, setFacturas] = useState([])
  const [movimentos, setMovimentos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      const [c, f, m] = await Promise.all([
        supabase.from('clientes').select('*').eq('id', id).single(),
        supabase.from('facturas').select('*, itens_factura(*)').eq('cliente_id', id).order('data_emissao', { ascending: false }),
        supabase.from('movimentos_caixa').select('*').eq('cliente_id', id).order('data_movimento', { ascending: false }),
      ])
      setCliente(c.data)
      setFacturas(f.data || [])
      setMovimentos(m.data || [])
      setLoading(false)
    }
    carregar()
  }, [id])

  if (loading) return <Loading />
  if (!cliente) return <p className="text-slate-400">Cliente não encontrado.</p>

  const totalFacturado = facturas.reduce((s, f) => s + Number(f.total || 0), 0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{cliente.nome}</h1>
          <p className="text-sm text-slate-500">
            {cliente.telefone && `${cliente.telefone} · `}
            {cliente.email && `${cliente.email} · `}
            {cliente.nif && `NIF: ${cliente.nif}`}
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/clientes')}>← Voltar</Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card"><p className="text-sm text-slate-400">Facturas</p><p className="text-2xl font-bold text-amber-400">{facturas.length}</p></div>
        <div className="card"><p className="text-sm text-slate-400">Total Facturado</p><p className="text-lg font-bold text-emerald-400">{formatKz(totalFacturado)}</p></div>
        <div className="card"><p className="text-sm text-slate-400">Movimentos</p><p className="text-2xl font-bold text-blue-400">{movimentos.length}</p></div>
      </div>

      {/* Facturas */}
      {facturas.length > 0 && (
        <div className="card">
          <h3 className="section-title mb-4 flex items-center gap-2"><FileText size={16} /> Facturas</h3>
          <div className="space-y-2">
            {facturas.map(f => (
              <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-700/50">
                <div>
                  <p className="text-sm font-mono font-semibold text-amber-400">{f.numero_factura}</p>
                  <p className="text-xs text-slate-500">{formatData(f.data_emissao)}</p>
                </div>
                <span className="font-semibold text-slate-200">{formatKz(f.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Movimentos */}
      {movimentos.length > 0 && (
        <div className="card">
          <h3 className="section-title mb-4 flex items-center gap-2"><Wallet size={16} /> Movimentos de Caixa</h3>
          <div className="space-y-2">
            {movimentos.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-700/50">
                <div>
                  <p className="text-sm text-slate-300">{m.descricao}</p>
                  <p className="text-xs text-slate-500">{formatData(m.data_movimento)}</p>
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
