import { useState } from 'react'
import { Sparkles, CalendarPlus } from 'lucide-react'
import { Modal } from '../UI/Modal'
import { Button } from '../UI/Button'
import { useAno } from '../../hooks/useAno'

export function BotaoNovoAno() {
  const [open, setOpen] = useState(false)
  const { anoActivo, iniciarNovoAno, loading } = useAno()
  const novoAno = anoActivo + 1

  async function confirmar() {
    const ok = await iniciarNovoAno()
    if (ok !== false) setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400
          text-slate-900 font-semibold text-sm shadow-lg shadow-amber-500/20
          hover:from-amber-400 hover:to-amber-300 transition-all duration-200"
      >
        <Sparkles size={16} />
        Iniciar {novoAno}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Iniciar Novo Ano" size="sm">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <CalendarPlus size={36} className="text-amber-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-100">Ano {novoAno}</p>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Ao confirmar, o sistema irá:
            </p>
            <ul className="text-sm text-slate-400 mt-3 space-y-1.5 text-left">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                Criar estrutura de 12 meses para {novoAno}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                Transferir saldo de Dezembro {anoActivo} → Janeiro {novoAno}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                Manter estoque, clientes e categorias
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">ℹ</span>
                O ano {anoActivo} fica acessível para consulta
              </li>
            </ul>
          </div>
          <div className="flex gap-3 w-full">
            <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" className="flex-1" onClick={confirmar} loading={loading}>
              <Sparkles size={15} />
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
