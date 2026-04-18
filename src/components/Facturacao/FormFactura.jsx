import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFacturas } from '../../hooks/useFacturas'
import { useClientes } from '../../hooks/useClientes'
import { Input, Select, Textarea } from '../UI/Input'
import { Button } from '../UI/Button'
import { formatKz, hojeISO } from '../../lib/utils'

export function FormFactura() {
  const navigate = useNavigate()
  const { criarFactura } = useFacturas()
  const { clientes } = useClientes()
  const [aplicarIva, setAplicarIva] = useState(false)

  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      data_emissao: hojeISO(),
      forma_pagamento: 'dinheiro',
      estado: 'pendente',
      itens: [{ descricao: '', quantidade: 1, preco_unitario: 0, total: 0 }],
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'itens' })
  const itens = watch('itens') || []

  const subtotal = itens.reduce((s, i) => s + (Number(i.quantidade || 0) * Number(i.preco_unitario || 0)), 0)
  const iva = aplicarIva ? subtotal * 0.14 : 0
  const total = subtotal + iva

  async function onSubmit(dados) {
    const itensCalculados = dados.itens.map(i => ({
      descricao: i.descricao,
      quantidade: Number(i.quantidade),
      preco_unitario: Number(i.preco_unitario),
      total: Number(i.quantidade) * Number(i.preco_unitario),
    }))
    const factura = await criarFactura({ ...dados, aplicar_iva: aplicarIva }, itensCalculados)
    if (factura) navigate('/facturas')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Nova Factura</h1>
        <Button variant="secondary" onClick={() => navigate('/facturas')}>← Voltar</Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Cliente e datas */}
        <div className="card space-y-4">
          <h3 className="section-title">Informação do Cliente</h3>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Cliente *"
              error={errors.cliente_id?.message}
              {...register('cliente_id', { required: 'Seleccione um cliente' })}
            >
              <option value="">Seleccionar…</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
            <Select label="Estado" {...register('estado')}>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data de emissão *" type="date" {...register('data_emissao', { required: true })} />
            <Input label="Data de vencimento" type="date" {...register('data_vencimento')} />
          </div>
          <Select label="Forma de pagamento" {...register('forma_pagamento')}>
            <option value="dinheiro">Dinheiro</option>
            <option value="transferencia">Transferência</option>
            <option value="cheque">Cheque</option>
            <option value="multicaixa">Multicaixa</option>
          </Select>
        </div>

        {/* Itens */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="section-title">Itens da Factura</h3>
            <Button
              type="button"
              variant="secondary"
              onClick={() => append({ descricao: '', quantidade: 1, preco_unitario: 0, total: 0 })}
            >
              <Plus size={14} /> Adicionar linha
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => {
              const qty = Number(itens[index]?.quantidade || 0)
              const price = Number(itens[index]?.preco_unitario || 0)
              return (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Input
                      label={index === 0 ? 'Descrição *' : ''}
                      placeholder="Descrição do serviço/produto…"
                      error={errors.itens?.[index]?.descricao?.message}
                      {...register(`itens.${index}.descricao`, { required: 'Obrigatório' })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      label={index === 0 ? 'Qtd.' : ''}
                      type="number" min={0.01} step="0.01"
                      {...register(`itens.${index}.quantidade`, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      label={index === 0 ? 'Preço unit. (Kz)' : ''}
                      type="number" min={0} step="0.01"
                      {...register(`itens.${index}.preco_unitario`, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="col-span-1 pb-2.5">
                    <p className="text-xs text-amber-400 font-semibold whitespace-nowrap">
                      {formatKz(qty * price)}
                    </p>
                  </div>
                  <div className="col-span-1 pb-2.5">
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(index)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Totais */}
          <div className="border-t border-slate-700 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-slate-200 font-medium">{formatKz(subtotal)}</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={aplicarIva}
                onChange={e => setAplicarIva(e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
              <span className="text-sm text-slate-400">Aplicar IVA (14%)</span>
            </label>
            {aplicarIva && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">IVA (14%)</span>
                <span className="text-slate-200">{formatKz(iva)}</span>
              </div>
            )}
            <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <span className="font-bold text-amber-400">TOTAL</span>
              <span className="text-xl font-bold text-amber-400">{formatKz(total)}</span>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="card">
          <Textarea label="Observações" placeholder="Condições de pagamento, notas…" {...register('observacoes')} />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate('/facturas')}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" className="flex-1" loading={isSubmitting}>
            Emitir Factura
          </Button>
        </div>
      </form>
    </div>
  )
}
