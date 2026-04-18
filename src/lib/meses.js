export const MESES = [
  { numero: 1,  nome: 'Janeiro',   abrev: 'Jan' },
  { numero: 2,  nome: 'Fevereiro', abrev: 'Fev' },
  { numero: 3,  nome: 'Março',     abrev: 'Mar' },
  { numero: 4,  nome: 'Abril',     abrev: 'Abr' },
  { numero: 5,  nome: 'Maio',      abrev: 'Mai' },
  { numero: 6,  nome: 'Junho',     abrev: 'Jun' },
  { numero: 7,  nome: 'Julho',     abrev: 'Jul' },
  { numero: 8,  nome: 'Agosto',    abrev: 'Ago' },
  { numero: 9,  nome: 'Setembro',  abrev: 'Set' },
  { numero: 10, nome: 'Outubro',   abrev: 'Out' },
  { numero: 11, nome: 'Novembro',  abrev: 'Nov' },
  { numero: 12, nome: 'Dezembro',  abrev: 'Dez' },
]

export function getMesNome(numero) {
  return MESES.find(m => m.numero === numero)?.nome || ''
}

export function getMesAbrev(numero) {
  return MESES.find(m => m.numero === numero)?.abrev || ''
}
