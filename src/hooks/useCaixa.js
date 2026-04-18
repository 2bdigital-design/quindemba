import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../lib/store'
import toast from 'react-hot-toast'

export function useCaixa(mes = null) {
  const { anoActivo } = useAppStore()
  const [movimentos, setMovimentos] = useState([])
  const [passagem, setPassagem] = useState(null)
  const [resumoAnual, setResumoAnual] = useState([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      // Movimentos
      let query = supabase
        .from('movimentos_caixa')
        .select('*, categorias(nome), clientes(nome)')
        .eq('ano', anoActivo)
        .order('data_movimento', { ascending: false })
      if (mes) query = query.eq('mes', mes)
      const { data: movs } = await query
      setMovimentos(movs || [])

      // Passagem do mês
      if (mes) {
        const { data: pass } = await supabase
          .from('passagens_caixa')
          .select('*')
          .eq('ano', anoActivo)
          .eq('mes', mes)
          .single()
        setPassagem(pass || null)
      }

      // Resumo anual (view)
      const { data: anual } = await supabase
        .from('v_resumo_caixa_mensal')
        .select('*')
        .eq('ano', anoActivo)
        .order('mes')
      setResumoAnual(anual || [])
    } finally {
      setLoading(false)
    }
  }, [anoActivo, mes])

  useEffect(() => { carregar() }, [carregar])

  async function registarMovimento(dados) {
    const mesFinal = mes || new Date(dados.data_movimento).getMonth() + 1
    const payload = { ...dados, ano: anoActivo, mes: mesFinal }
    const { error } = await supabase.from('movimentos_caixa').insert(payload)
    if (error) { toast.error('Erro: ' + error.message); return false }
    toast.success('Movimento registado!')
    await carregar()
    return true
  }

  async function eliminarMovimento(id) {
    const { error } = await supabase.from('movimentos_caixa').delete().eq('id', id)
    if (error) { toast.error('Erro: ' + error.message); return false }
    toast.success('Eliminado.')
    await carregar()
    return true
  }

  async function fecharMes(dados) {
    const total_receitas = movimentos.filter(m => m.tipo === 'receita').reduce((s, m) => s + Number(m.valor), 0)
    const total_despesas = movimentos.filter(m => m.tipo === 'despesa').reduce((s, m) => s + Number(m.valor), 0)
    const saldo_anterior = passagem?.saldo_anterior || 0
    const saldo_final = saldo_anterior + total_receitas - total_despesas

    const payload = {
      ano: anoActivo,
      mes,
      total_receitas,
      total_despesas,
      saldo_anterior,
      saldo_final,
      fechado: true,
      data_fecho: new Date().toISOString(),
      ...dados,
    }

    const op = passagem
      ? supabase.from('passagens_caixa').update(payload).eq('id', passagem.id)
      : supabase.from('passagens_caixa').insert(payload)

    const { error } = await op
    if (error) { toast.error('Erro: ' + error.message); return false }

    // Actualizar saldo_anterior do mês seguinte
    if (mes < 12) {
      await supabase
        .from('passagens_caixa')
        .update({ saldo_anterior: saldo_final })
        .eq('ano', anoActivo)
        .eq('mes', mes + 1)
    }

    toast.success('Mês fechado com sucesso!')
    await carregar()
    return true
  }

  // Resumo do mês actual
  const resumo = {
    receitas:  movimentos.filter(m => m.tipo === 'receita').reduce((s, m) => s + Number(m.valor), 0),
    despesas:  movimentos.filter(m => m.tipo === 'despesa').reduce((s, m) => s + Number(m.valor), 0),
    saldo_anterior: passagem?.saldo_anterior || 0,
    get saldo() { return this.saldo_anterior + this.receitas - this.despesas },
  }

  return { movimentos, passagem, resumoAnual, loading, registarMovimento, eliminarMovimento, fecharMes, resumo, recarregar: carregar }
}
