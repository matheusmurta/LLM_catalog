import { ref, onMounted } from 'vue'

/**
 * URL oficial do catálogo de modelos/pricing da LiteLLM.
 */
const DATA_URL =
  'https://raw.githubusercontent.com/BerriAI/litellm/refs/heads/main/model_prices_and_context_window.json'

/**
 * O JSON da LiteLLM informa o custo de APENAS 1 token.
 * Para exibir "Custo por 1 Milhão de Tokens", multiplicamos por 1.000.000.
 */
export const TOKENS_PER_MILLION = 1_000_000

/**
 * Chave boilerplate presente no JSON que deve ser ignorada (não é um modelo real).
 */
const SAMPLE_SPEC_KEY = 'sample_spec'

// Estado compartilhado em nível de módulo ("singleton") para evitar múltiplos
// fetches caso o composable seja usado por mais de um componente.
const models = ref([])
const providers = ref([])
const loading = ref(true)
const error = ref(null)
let started = false

/**
 * Converte um valor bruto do JSON em número, ou `null` quando ausente/inválido.
 */
function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/**
 * REGRA DE NEGÓCIO — transformação de preço:
 * O JSON fornece o custo por 1 token. Multiplicamos por 1.000.000 para obter
 * o custo por 1 milhão de tokens antes de exibir na interface.
 */
function toCostPerMillion(costPerToken) {
  const n = toNumber(costPerToken)
  return n === null ? null : n * TOKENS_PER_MILLION
}

export function useModels() {
  async function load() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(DATA_URL)
      if (!response.ok) {
        throw new Error(`Falha ao carregar os dados (HTTP ${response.status})`)
      }

      const json = await response.json()

      // Transforma o objeto { "nome-do-modelo": { ...dados } } em um Array.
      // Ignora a chave boilerplate "sample_spec".
      const list = Object.entries(json)
        .filter(([key]) => key !== SAMPLE_SPEC_KEY)
        .map(([name, data]) => ({
          name,
          provider: data.litellm_provider || null,
          maxInputTokens: toNumber(data.max_input_tokens),
          inputCostPerMillion: toCostPerMillion(data.input_cost_per_token),
          outputCostPerMillion: toCostPerMillion(data.output_cost_per_token),
          // Mantém o objeto original para exibir os detalhes (accordion).
          raw: data,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

      models.value = list

      // Extrai os provedores únicos a partir de `litellm_provider`.
      providers.value = [
        ...new Set(list.map((model) => model.provider).filter(Boolean)),
      ].sort()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar os dados'
      models.value = []
      providers.value = []
    } finally {
      loading.value = false
    }
  }

  // Dispara o fetch assim que o app carrega (uma única vez).
  if (!started) {
    started = true
    onMounted(load)
  }

  return { models, providers, loading, error, reload: load }
}
