import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useSectores() {
  const [sectores, setSectores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('sectores')
        .select('*')
        .eq('activo', true)
        .order('nome')
      setSectores(data || [])
      setLoading(false)
    }
    carregar()
  }, [])

  return { sectores, loading }
}

// Cores fixas por nome de sector (fallback se não vierem da BD)
export const COR_SECTOR = {
  'Loja':          '#3b82f6',
  'Recauchutagem': '#f59e0b',
  'Lavagem':       '#10b981',
}

export const ICONE_SECTOR = {
  'Loja':          '🏪',
  'Recauchutagem': '🔧',
  'Lavagem':       '🚿',
}
