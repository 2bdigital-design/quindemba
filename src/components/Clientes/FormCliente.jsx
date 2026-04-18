import { useForm } from 'react-hook-form'
import { Input, Textarea } from '../UI/Input'
import { Button } from '../UI/Button'

export function FormCliente({ onSave, onCancel, defaultValues = {} }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues })

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <Input
        label="Nome *"
        placeholder="Nome do cliente ou empresa…"
        error={errors.nome?.message}
        {...register('nome', { required: 'Nome é obrigatório' })}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Telefone" placeholder="+244 9xx xxx xxx" {...register('telefone')} />
        <Input label="Email" type="email" placeholder="email@exemplo.com" {...register('email')} />
      </div>
      <Input label="NIF" placeholder="Número de identificação fiscal" {...register('nif')} />
      <Textarea label="Endereço" placeholder="Morada completa…" {...register('endereco')} />
      <Textarea label="Notas" placeholder="Observações sobre o cliente…" {...register('notas')} />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary" className="flex-1" loading={isSubmitting}>Guardar</Button>
      </div>
    </form>
  )
}
