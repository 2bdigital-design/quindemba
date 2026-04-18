import { Loader2 } from 'lucide-react'

export function Loading({ text = 'A carregar…', size = 'md' }) {
  const sizes = { sm: 16, md: 24, lg: 36 }
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <Loader2 size={sizes[size]} className="animate-spin text-amber-500" />
      <p className="text-sm">{text}</p>
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <Loading size="lg" />
    </div>
  )
}
