import { useForm } from 'react-hook-form'
import { useCategorias } from '../../hooks/useCategorias'
import { Input, Select } from '../UI/Input'
import { Button } from '../UI/Button'

export function FormProduto({ onSave, onCancel, defaultValues }) {
  const { categorias } = useCategorias('produto')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues })

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <Input
        label="Nome do produto *"
        placeholder="ex: Pneu 195/65 R15"
        error={errors.nome?.message}
        {...register('nome', { required: 'Nome é obrigatório' })}
      />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Categoria" {...register('categoria_id')}>
          <option value="">Sem categoria</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </Select>
        <Select label="Unidade" {...register('unidade')}>
          <option value="un">Unidade (un)</option>
          <option value="kg">Quilograma (kg)</option>
          <option value="lt">Litro (lt)</option>
          <option value="mt">Metro (mt)</option>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Estoque mínimo"
          type="number"
          min={0}
          placeholder="0"
          {...register('estoque_minimo', { valueAsNumber: true })}
        />
        <Input
          label="Preço unitário (Kz)"
          type="number"
          min={0}
          step="0.01"
          placeholder="0.00"
          {...register('preco_unitario', { valueAsNumber: true })}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary" className="flex-1" loading={isSubmitting}>Guardar</Button>
      </div>
    </form>
  )
}
