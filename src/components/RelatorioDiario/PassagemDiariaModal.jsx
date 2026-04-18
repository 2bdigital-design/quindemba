import { useForm } from 'react-hook-form'
import { Lock, CheckCircle } from 'lucide-react'
import { formatKz, formatData } from '../../lib/utils'
import { Button } from '../UI/Button'
import { Input, Textarea } from '../UI/Input'
import { ICONE_SECTOR } from '../../hooks/useSectores'

export function PassagemDiariaModal({ sector, data, resumo, onFechar, onCancel }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()
  const saldo_anterior = 0 // Será calculado no hook
  const saldo_final = Number(resumo?.total_receitas || 0) - Number(resumo?.total_despesas || 0)
  const icone = ICONE_SECTOR[sector?.nome] || '📦'

  return (
    <form onSubmit={handleSubmit(onFechar)} className="space-y-5">
      {/* Header sector */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{
        backgroundColor: (sector?.cor || '#f59e0b') + '15',
        borderColor: (sector?.cor || '#f59e0b') + '40',
      }}>
        <span className="text-2xl">{icone}</span>
        <div>
          <p className="font-bold" style={{ color: sector?.cor }}>{sector?.nome}</p>
          <p className="text-xs text-slate-400">Fecho de caixa · {formatData(data)}</p>
        </div>
      </div>

      {/* Resumo */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-4 py-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <span className="text-sm text-emerald-400">↑ Total receitas</span>
          <span className="font-bold text-emerald-400">{formatKz(resumo?.total_receitas || 0)}</span>
        </div>
        <div className="flex justify-between items-center px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/20">
          <span className="text-sm text-red-400">↓ Total despesas</span>
          <span className="font-bold text-red-400">{formatKz(resumo?.total_despesas || 0)}</span>
        </div>
        <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <span className="font-bold text-amber-400">= Saldo do dia</span>
          <span className={`text-xl font-black ${saldo_final >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatKz(saldo_final)}
          </span>
        </div>
      </div>

      <Input label="Responsável" placeholder="Nome de quem fecha o caixa" {...register('responsavel')} />
      <Textarea label="Observações" placeholder="Notas do fecho do dia…" {...register('observacoes')} />

      <div className="flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary" className="flex-1" loading={isSubmitting}>
          <Lock size={15} /> Fechar Caixa
        </Button>
      </div>
    </form>
  )
}
