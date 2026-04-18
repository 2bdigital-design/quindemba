import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { hojeISO } from '../lib/utils'
import toast from 'react-hot-toast'

export function useRelatorioDiario(data = null) {
  const dataAlvo = data || hojeISO()
  const [movimentos, setMovimentos] = useState([])
  const [resumo, setResumo] = useState([])
  const [passagens, setPassagens] = useState([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      // Movimentos do dia com sector
      const { data: movs } = await supabase
        .from('movimentos_caixa')
        .select('*, sectores(id, nome, cor), categorias(nome), clientes(nome)')
        .eq('data_movimento', dataAlvo)
        .order('criado_em', { ascending: false })
      setMovimentos(movs || [])

      // Resumo diário por sector (view)
      const { data: res } = await supabase
        .from('v_resumo_diario_sectores')
        .select('*')
        .eq('data', dataAlvo)
      setResumo(res || [])

      // Passagens do dia
      const { data: pass } = await supabase
        .from('passagens_caixa_diarias')
        .select('*, sectores(nome, cor)')
        .eq('data', dataAlvo)
      setPassagens(pass || [])
    } finally {
      setLoading(false)
    }
  }, [dataAlvo])

  useEffect(() => { carregar() }, [carregar])

  async function fecharCaixaSector(sectorId, dados) {
    const movsSector = movimentos.filter(m => m.sector_id === sectorId)
    const total_receitas = movsSector.filter(m => m.tipo === 'receita').reduce((s, m) => s + Number(m.valor), 0)
    const total_despesas = movsSector.filter(m => m.tipo === 'despesa').reduce((s, m) => s + Number(m.valor), 0)

    // Buscar saldo do dia anterior para este sector
    const { data: anterior } = await supabase
      .from('passagens_caixa_diarias')
      .select('saldo_final')
      .eq('sector_id', sectorId)
      .lt('data', dataAlvo)
      .order('data', { ascending: false })
      .limit(1)
      .single()

    const saldo_anterior = anterior?.saldo_final || 0
    const saldo_final = saldo_anterior + total_receitas - total_despesas

    const passagemExistente = passagens.find(p => p.sector_id === sectorId)
    const payload = {
      data: dataAlvo,
      sector_id: sectorId,
      saldo_anterior,
      total_receitas,
      total_despesas,
      saldo_final,
      fechado: true,
      data_fecho: new Date().toISOString(),
      ...dados,
    }

    const op = passagemExistente
      ? supabase.from('passagens_caixa_diarias').update(payload).eq('id', passagemExistente.id)
      : supabase.from('passagens_caixa_diarias').insert(payload)

    const { error } = await op
    if (error) { toast.error('Erro: ' + error.message); return false }
    toast.success('Caixa do sector fechado!')
    await carregar()
    return true
  }

  // Totais globais do dia
  const totalDia = {
    receitas: resumo.reduce((s, r) => s + Number(r.total_receitas || 0), 0),
    despesas: resumo.reduce((s, r) => s + Number(r.total_despesas || 0), 0),
    saldo:    resumo.reduce((s, r) => s + Number(r.saldo || 0), 0),
  }

  return { movimentos, resumo, passagens, loading, fecharCaixaSector, totalDia, recarregar: carregar }
}
