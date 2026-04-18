import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MESES } from '../../lib/meses'

export function MesSelector({ base }) {
  const { mes } = useParams()
  const navigate = useNavigate()
  const mesNum = Number(mes) || new Date().getMonth() + 1
  const mesActual = new Date().getMonth() + 1

  return (
    <div className="flex items-center gap-2">
      {/* Prev */}
      <button
        onClick={() => mesNum > 1 && navigate(`/${base}/${mesNum - 1}`)}
        disabled={mesNum <= 1}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 disabled:opacity-30 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Month tabs (scrollable) */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none">
        {MESES.map(m => (
          <button
            key={m.numero}
            onClick={() => navigate(`/${base}/${m.numero}`)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              m.numero === mesNum
                ? 'bg-amber-500 text-slate-900'
                : m.numero === mesActual
                ? 'bg-slate-700 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            {m.abrev}
          </button>
        ))}
      </div>

      {/* Next */}
      <button
        onClick={() => mesNum < 12 && navigate(`/${base}/${mesNum + 1}`)}
        disabled={mesNum >= 12}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 disabled:opacity-30 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
