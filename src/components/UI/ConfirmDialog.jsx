import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

export function ConfirmDialog({ open, onClose, onConfirm, title = 'Confirmar', message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <p className="text-slate-300">{message || 'Tem a certeza que pretende continuar?'}</p>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm} loading={loading}>Confirmar</Button>
        </div>
      </div>
    </Modal>
  )
}
