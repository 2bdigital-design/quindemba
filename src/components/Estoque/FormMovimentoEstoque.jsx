import { useForm } from 'react-hook-form'
import { Input, Select, Textarea } from '../UI/Input'
import { Button } from '../UI/Button'
import { hojeISO } from '../../lib/utils'
import { useSectores } from '../../hooks/useSectores'

export function FormMovimentoEstoque({ tipo, produtos, onSave, onCancel }) {
  const { sectores } = useSectores()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { tipo, data_movimento: hojeISO(), quantidade: 1, preco_unitario: 0 }
  })
  const quantidade = watch('quantidade') || 0
  const preco = watch('preco_unitario') || 0

  const titulo = tipo === 'entrada' ? 'Entrada de Estoque' : 'Saída de Estoque'
  const cor = tipo === 'entrada' ? 'text-emerald-400' : 'text-red-400'

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className={`px-3 py-2 rounded-lg ${tipo === 'entrada' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
        <p className={`text-sm font-semibold ${cor}`}>{titulo}</p>
      </div>

      <Select label="Sector" {...register('sector_id')}>
        <option value="">Sem sector</option>
        {sectores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
      </Select>

      <Select
        label="Produto *"
        error={errors.produto_id?.message}
        {...register('produto_id', { required: 'Seleccione um produto' })}
      >
        <option value="">Seleccionar produto…</option>
        {produtos.map(p => (
          <option key={p.id} value={p.id}>{p.nome} ({p.unidade})</option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Quantidade *"
          type="number"
          min={1}
          error={errors.quantidade?.message}
          {...register('quantidade', { required: 'Obrigatório', valueAsNumber: true, min: { value: 1, message: 'Mínimo 1' } })}
        />
        <Input
          label="Preço unitário (Kz)"
          type="number"
          min={0}
          step="0.01"
          {...register('preco_unitario', { valueAsNumber: true })}
        />
      </div>

      {/* Valor total preview */}
      <div className="flex justify-between px-3 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700">
        <span className="text-sm text-slate-400">Valor total</span>
        <span className="text-sm font-semibold text-amber-400">
          {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(quantidade * preco)}
        </span>
      </div>

      <Input
        label="Data do movimento *"
        type="date"
        error={errors.data_movimento?.message}
        {...register('data_movimento', { required: 'Data é obrigatória' })}
      />

      {tipo === 'entrada' && (
        <Input label="Fornecedor" placeholder="Nome do fornecedor…" {...register('fornecedor')} />
      )}

      <Input label="Documento / Referência" placeholder="Nº da guia, factura…" {...register('documento')} />
      <Textarea label="Observações" placeholder="Notas adicionais…" {...register('observacoes')} />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>Cancelar</Button>
        <Button
          type="submit"
          variant={tipo === 'entrada' ? 'success' : 'danger'}
          className="flex-1"
          loading={isSubmitting}
        >
          {tipo === 'entrada' ? 'Registar Entrada' : 'Registar Saída'}
        </Button>
      </div>
    </form>
  )
}
