import { useForm } from 'react-hook-form'
import { useCategorias } from '../../hooks/useCategorias'
import { useClientes } from '../../hooks/useClientes'
import { Input, Select, Textarea } from '../UI/Input'
import { Button } from '../UI/Button'

export function FormMovimentoCaixaSector({ tipo, sector, dataMovimento, onSave, onCancel }) {
  const { categorias } = useCategorias(tipo === 'receita' ? 'servico' : 'despesa')
  const { clientes } = useClientes()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { tipo, data_movimento: dataMovimento }
  })

  const isReceita = tipo === 'receita'
  const cor = isReceita ? 'text-emerald-400' : 'text-red-400'
  const bg  = isReceita ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      {/* Sector badge */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{
        backgroundColor: sector?.cor + '15',
        borderColor: sector?.cor + '40'
      }}>
        <span className="text-sm font-semibold" style={{ color: sector?.cor }}>
          Sector: {sector?.nome}
        </span>
        <span className={`ml-auto text-xs font-semibold ${cor}`}>
          {isReceita ? '↑ Receita' : '↓ Despesa'}
        </span>
      </div>

      <Input
        label="Descrição *"
        placeholder={isReceita ? 'ex: Venda de pneu 195/65 R15' : 'ex: Compra de materiais'}
        error={errors.descricao?.message}
        {...register('descricao', { required: 'Descrição é obrigatória' })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Valor (Kz) *"
          type="number" min={0} step="0.01" placeholder="0.00"
          error={errors.valor?.message}
          {...register('valor', { required: 'Obrigatório', valueAsNumber: true, min: { value: 0.01, message: 'Inválido' } })}
        />
        <Select label="Categoria" {...register('categoria_id')}>
          <option value="">Sem categoria</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Data *" type="date" {...register('data_movimento', { required: true })} />
        <Select label="Pagamento" {...register('forma_pagamento')}>
          <option value="dinheiro">Dinheiro</option>
          <option value="transferencia">Transferência</option>
          <option value="multicaixa">Multicaixa</option>
          <option value="cheque">Cheque</option>
        </Select>
      </div>

      {isReceita && (
        <Select label="Cliente" {...register('cliente_id')}>
          <option value="">Sem cliente</option>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </Select>
      )}

      <Input label="Documento / Referência" placeholder="Nº recibo, factura…" {...register('documento')} />
      <Textarea label="Observações" {...register('observacoes')} />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant={isReceita ? 'success' : 'danger'} className="flex-1" loading={isSubmitting}>
          {isReceita ? 'Registar Receita' : 'Registar Despesa'}
        </Button>
      </div>
    </form>
  )
}
