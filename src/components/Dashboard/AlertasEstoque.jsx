import { AlertTriangle, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function AlertasEstoque({ itens }) {
  const navigate = useNavigate()
  const baixos = itens.filter(i => Number(i.quantidade_actual) <= Number(i.estoque_minimo))

  if (baixos.length === 0) return null

  return (
    <div className="card border-amber-500/30 bg-amber-500/5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={18} className="text-amber-400" />
        <h3 className="font-semibold text-amber-400">Estoque Baixo ({baixos.length})</h3>
      </div>
      <div className="space-y-2">
        {baixos.slice(0, 5).map(item => (
          <div
            key={item.id}
            onClick={() => navigate('/estoque')}
            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 cursor-pointer hover:border-amber-500/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Package size={14} className="text-slate-500" />
              <span className="text-sm text-slate-300">{item.nome}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-red-400">{item.quantidade_actual} {item.unidade}</span>
              <span className="text-xs text-slate-500 ml-1">/ mín {item.estoque_minimo}</span>
            </div>
          </div>
        ))}
        {baixos.length > 5 && (
          <p className="text-xs text-slate-500 text-center pt-1">
            +{baixos.length - 5} mais itens…
          </p>
        )}
      </div>
    </div>
  )
}
