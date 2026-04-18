import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ─── Formatador de Kwanza (AOA) ───────────────────────────────────────────────
export function formatKz(valor) {
  if (valor === null || valor === undefined || isNaN(valor)) return 'Kz 0,00'
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2,
  }).format(Number(valor))
}

// ─── Formatador de número simples com separadores ────────────────────────────
export function formatNum(valor) {
  if (!valor && valor !== 0) return '0'
  return new Intl.NumberFormat('pt-AO').format(Number(valor))
}

// ─── Formatadores de data ─────────────────────────────────────────────────────
export function formatData(data) {
  if (!data) return '—'
  try {
    const d = typeof data === 'string' ? parseISO(data) : data
    return format(d, 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return '—'
  }
}

export function formatDataHora(data) {
  if (!data) return '—'
  try {
    const d = typeof data === 'string' ? parseISO(data) : data
    return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  } catch {
    return '—'
  }
}

export function hojeISO() {
  return format(new Date(), 'yyyy-MM-dd')
}

// ─── Número da factura ────────────────────────────────────────────────────────
export function gerarNumeroFactura(ano, sequencia) {
  const seq = String(sequencia).padStart(3, '0')
  return `FT ${ano}/${seq}`
}

// ─── Calcular IVA ─────────────────────────────────────────────────────────────
export function calcularIVA(subtotal, percentagem = 14) {
  return (subtotal * percentagem) / 100
}

// ─── Cores por tipo de movimento ─────────────────────────────────────────────
export function corTipo(tipo) {
  const mapa = {
    receita: 'text-emerald-400',
    despesa: 'text-red-400',
    entrada: 'text-emerald-400',
    saida:   'text-red-400',
  }
  return mapa[tipo] || 'text-slate-300'
}

export function bgTipo(tipo) {
  const mapa = {
    receita: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    despesa: 'bg-red-500/10 border-red-500/20 text-red-400',
    entrada: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    saida:   'bg-red-500/10 border-red-500/20 text-red-400',
  }
  return mapa[tipo] || 'bg-slate-700 text-slate-300'
}

// ─── Truncar texto ────────────────────────────────────────────────────────────
export function truncar(str, max = 40) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '…' : str
}

// ─── Gerar cor de gráfico por índice ─────────────────────────────────────────
export const CHART_COLORS = [
  '#f59e0b', '#3b82f6', '#10b981', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
]
