import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../lib/store'
import toast from 'react-hot-toast'

export function useAno() {
  const { anoActivo, setAnoActivo } = useAppStore()
  const [anos, setAnos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    carregarAnos()
  }, [])

  async function carregarAnos() {
    const { data } = await supabase
      .from('anos')
      .select('*')
      .order('ano', { ascending: false })
    if (data) setAnos(data)
  }

  async function iniciarNovoAno() {
    const novoAno = anoActivo + 1
    setLoading(true)
    try {
      // 1. Criar novo ano
      const { error: e1 } = await supabase
        .from('anos')
        .insert({ ano: novoAno, activo: true })
      if (e1) throw e1

      // 2. Desactivar ano anterior
      await supabase.from('anos').update({ activo: false }).eq('ano', anoActivo)

      // 3. Criar passagens de caixa vazias (12 meses)
      const passagens = Array.from({ length: 12 }, (_, i) => ({
        ano: novoAno,
        mes: i + 1,
        saldo_anterior: 0,
        total_receitas: 0,
        total_despesas: 0,
        saldo_final: 0,
        fechado: false,
      }))
      await supabase.from('passagens_caixa').insert(passagens)

      // 4. Transferir saldo de Dezembro → Janeiro do novo ano
      const { data: dezembro } = await supabase
        .from('passagens_caixa')
        .select('saldo_final')
        .eq('ano', anoActivo)
        .eq('mes', 12)
        .single()

      if (dezembro?.saldo_final) {
        await supabase
          .from('passagens_caixa')
          .update({ saldo_anterior: dezembro.saldo_final })
          .eq('ano', novoAno)
          .eq('mes', 1)
      }

      setAnoActivo(novoAno)
      await carregarAnos()
      toast.success(`Ano ${novoAno} iniciado com sucesso!`)
    } catch (err) {
      toast.error('Erro ao iniciar novo ano: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return { anoActivo, setAnoActivo, anos, iniciarNovoAno, loading }
}
