/**
 * Formata o limite de tokens com separador de milhar (padrão brasileiro).
 * Ex.: 128000 -> "128.000"; 2600 -> "2.600".
 */
export function formatContextLimit(value) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('pt-BR').format(value)
}

/**
 * Formata o preço (já convertido para "$ por 1 milhão de tokens") com o
 * prefixo "$" e até 4 casas decimais (mínimo de 2 para leitura em moeda).
 * Ex.: 0 -> "$0.00"; 0.06 -> "$0.06"; 2.5 -> "$2.50"; 0.0025 -> "$0.0025".
 */
export function formatPrice(value) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value)
}

/**
 * Formata um valor monetário bruto (sem o contexto de "por 1M tokens").
 * Usado no painel de detalhes para preços por token/imagem/caractere/etc.
 * Ex.: 0.0000025 -> "$0.0000025"; 0.06 -> "$0.06"; 15 -> "$15".
 */
export function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return '$' + n.toLocaleString('en-US', {
    maximumFractionDigits: 8,
    minimumFractionDigits: 0,
  })
}
