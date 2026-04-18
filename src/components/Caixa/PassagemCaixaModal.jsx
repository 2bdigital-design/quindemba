import { useForm } from 'react-hook-form'
import { CheckCircle, Lock } from 'lucide-react'
import { formatKz } from '../../lib/utils'
import { getMesNome } from '../../lib/meses'
import { Button } from '../UI/Button'
import { Textarea } from '../UI/Input'

export function PassagemCaixaModal({ resumo, mes, ano, onFechar, onCancel }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  return (
    <form onSubmit={handleSubmit(onFechar)} className="space-y-5">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <Lock size={18} className="text-blue-400" />
        <div>
          <p className="text-sm font-semibold text-blue-400">Fecho de {getMesNome(mes)} {ano}</p>
          <p className="text-xs text-slate-400">Este processo finaliza o mês e passa o saldo para o mês seguinte.</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-700">
          <span className="text-sm text-slate-400">Saldo anterior</span>
          <span className="font-semibold text-slate-200">{formatKz(resumo.saldo_anterior)}</span>
        </div>
        <div className="flex justify-between items-center px-4 py-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <span className="text-sm text-emerald-400">+ Total receitas</span>
          <span className="font-semibold text-emerald-400">{formatKz(resumo.receitas)}</span>
        </div>
        <div className="flex justify-between items-center px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/20">
          <span className="text-sm text-red-400">− Total despesas</span>
          <span className="font-semibold text-red-400">{formatKz(resumo.despesas)}</span>
        </div>
        <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <span className="font-semibold text-amber-400">= Saldo final</span>
          <span className={`text-lg font-bold ${resumo.saldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatKz(resumo.saldo)}
          </span>
        </div>
      </div>

      <Textarea label="Observações do responsável" placeholder="Notas do fecho…" {...register('observacoes')} />
      <input type="hidden" {...register('responsavel')} />

      <div className="flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary" className="flex-1" loading={isSubmitting}>
          <CheckCircle size={15} /> Fechar Mês
        </Button>
      </div>
    </form>
  )
}
