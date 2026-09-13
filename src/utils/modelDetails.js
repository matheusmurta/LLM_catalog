// Converte o objeto original de um modelo do LiteLLM em seções legíveis,
// com rótulos traduzidos para o português e valores devidamente formatados.
import { formatContextLimit, formatMoney } from './format'

/** Tradução dos valores possíveis da propriedade `mode`. */
export const MODE_LABELS = {
  chat: 'Chat',
  completion: 'Conclusão (texto)',
  embedding: 'Embedding',
  image_generation: 'Geração de imagem',
  audio_transcription: 'Transcrição de áudio',
  audio_speech: 'Síntese de fala (TTS)',
  moderation: 'Moderação',
  rerank: 'Re-ranking',
  search: 'Busca',
  tts: 'Síntese de fala (TTS)',
  realtime: 'Tempo real',
  image_edit: 'Edição de imagem',
  responses: 'Respostas',
}

/** Dicionário usado para humanizar nomes de campos não mapeados (fallback). */
const WORD_PT = {
  input: 'entrada',
  output: 'saída',
  cost: 'custo',
  per: 'por',
  token: 'token',
  tokens: 'tokens',
  character: 'caractere',
  image: 'imagem',
  audio: 'áudio',
  video: 'vídeo',
  pixel: 'pixel',
  second: 'segundo',
  request: 'requisição',
  query: 'consulta',
  session: 'sessão',
  page: 'página',
  credit: 'crédito',
  cache: 'cache',
  read: 'leitura',
  creation: 'criação',
  above: 'acima de',
  priority: 'prioritário',
  flex: 'flex',
  batches: 'lote',
  hit: 'hit',
  min: 'mínimo',
  max: 'máximo',
  high: 'alto',
  low: 'baixo',
  medium: 'médio',
  grounding: 'grounding',
  unit: 'unidade',
  dbu: 'DBU',
  ocr: 'OCR',
}

/**
 * Grupos curados de campos. Cada item é [chave, rótulo em português, tipo].
 * tipo: text | mode | tokens | money | boolean | list | json
 */
const GROUPS = [
  {
    title: 'Identificação',
    fields: [
      ['litellm_provider', 'Plataforma', 'text'],
      ['mode', 'Tipo do Modelo', 'mode'],
      ['source', 'Fonte', 'text'],
      ['deprecation_date', 'Data de Depreciação', 'text'],
      ['default_reasoning_effort', 'Esforço de Raciocínio Padrão', 'text'],
      ['comment', 'Comentário', 'text'],
      ['supported_regions', 'Regiões Suportadas', 'list'],
    ],
  },
  {
    title: 'Contexto e Limites',
    fields: [
      ['max_input_tokens', 'Limite de Tokens na Entrada (contexto)', 'tokens'],
      ['max_output_tokens', 'Limite de Tokens Gerados na Saída', 'tokens'],
      ['max_tokens', 'Limite de Tokens (legado)', 'tokens'],
      ['tpm', 'Tokens por Minuto (limite)', 'tokens'],
      ['rpm', 'Requisições por Minuto (limite)', 'tokens'],
      ['output_vector_size', 'Dimensão do Vetor de Saída', 'tokens'],
      ['prompt_cache_min_tokens', 'Mínimo para Cache de Prompt', 'tokens'],
    ],
  },
  {
    title: 'Preços',
    fields: [
      ['input_cost_per_token', 'Preço de Entrada (por token)', 'money'],
      ['output_cost_per_token', 'Preço de Saída (por token)', 'money'],
      ['input_cost_per_token_above_128k_tokens', 'Preço de Entrada (acima de 128k tokens)', 'money'],
      ['output_cost_per_token_above_128k_tokens', 'Preço de Saída (acima de 128k tokens)', 'money'],
      ['input_cost_per_token_above_200k_tokens', 'Preço de Entrada (acima de 200k tokens)', 'money'],
      ['output_cost_per_token_above_200k_tokens', 'Preço de Saída (acima de 200k tokens)', 'money'],
      ['input_cost_per_character', 'Preço de Entrada (por caractere)', 'money'],
      ['output_cost_per_character', 'Preço de Saída (por caractere)', 'money'],
      ['input_cost_per_image', 'Preço de Entrada (por imagem)', 'money'],
      ['output_cost_per_image', 'Preço de Saída (por imagem)', 'money'],
      ['input_cost_per_image_token', 'Preço de Entrada (por token de imagem)', 'money'],
      ['output_cost_per_image_token', 'Preço de Saída (por token de imagem)', 'money'],
      ['input_cost_per_pixel', 'Preço de Entrada (por pixel)', 'money'],
      ['output_cost_per_pixel', 'Preço de Saída (por pixel)', 'money'],
      ['input_cost_per_audio_token', 'Preço de Entrada (por token de áudio)', 'money'],
      ['output_cost_per_audio_token', 'Preço de Saída (por token de áudio)', 'money'],
      ['input_cost_per_second', 'Preço de Entrada (por segundo)', 'money'],
      ['output_cost_per_second', 'Preço de Saída (por segundo)', 'money'],
      ['input_cost_per_video_per_second', 'Preço de Entrada de Vídeo (por segundo)', 'money'],
      ['output_cost_per_video_per_second', 'Preço de Saída de Vídeo (por segundo)', 'money'],
      ['output_cost_per_video_token', 'Preço de Saída (por token de vídeo)', 'money'],
      ['input_cost_per_request', 'Preço de Entrada (por requisição)', 'money'],
      ['input_cost_per_query', 'Preço por Consulta', 'money'],
      ['code_interpreter_cost_per_session', 'Preço do Code Interpreter (por sessão)', 'money'],
      ['output_cost_per_reasoning_token', 'Preço de Saída (token de raciocínio)', 'money'],
      ['input_cost_per_token_batches', 'Preço de Entrada (em lote)', 'money'],
      ['output_cost_per_token_batches', 'Preço de Saída (em lote)', 'money'],
      ['input_cost_per_token_cache_hit', 'Preço de Entrada (cache hit)', 'money'],
      ['tiered_pricing', 'Preços em Camadas', 'json'],
    ],
  },
  {
    title: 'Cache de Prompt',
    fields: [
      ['cache_creation_input_token_cost', 'Criação de Cache (por token)', 'money'],
      ['cache_read_input_token_cost', 'Leitura de Cache (por token)', 'money'],
    ],
  },
  {
    title: 'Capacidades',
    fields: [
      ['supports_function_calling', 'Suporta uso de ferramentas', 'boolean'],
      ['supports_parallel_function_calling', 'Suporta chamadas paralelas de funções', 'boolean'],
      ['supports_system_messages', 'Aceita instruções de sistema', 'boolean'],
      ['supports_vision', 'Aceita imagens (visão)', 'boolean'],
      ['supports_image_input', 'Aceita entrada de imagem', 'boolean'],
      ['supports_video_input', 'Aceita entrada de vídeo', 'boolean'],
      ['supports_audio_input', 'Aceita entrada de áudio', 'boolean'],
      ['supports_audio_output', 'Gera saída de áudio', 'boolean'],
      ['supports_pdf_input', 'Aceita entrada em PDF', 'boolean'],
      ['supports_multimodal', 'Suporta multimodal', 'boolean'],
      ['supports_prompt_caching', 'Suporta cache de prompt', 'boolean'],
      ['supports_prompt_cache_breakpoint', 'Suporta breakpoint de cache', 'boolean'],
      ['supports_reasoning', 'Suporta raciocínio', 'boolean'],
      ['supports_response_schema', 'Suporta schema de resposta', 'boolean'],
      ['supports_native_structured_output', 'Suporta saída estruturada nativa', 'boolean'],
      ['supports_native_streaming', 'Suporta streaming nativo', 'boolean'],
      ['supports_tool_choice', 'Suporta escolha de ferramenta', 'boolean'],
      ['supports_tool_search', 'Suporta busca de ferramenta', 'boolean'],
      ['supports_web_search', 'Suporta busca na web', 'boolean'],
      ['supports_computer_use', 'Suporta uso de computador', 'boolean'],
      ['supports_embedding_image_input', 'Suporta imagem em embedding', 'boolean'],
      ['supports_assistant_prefill', 'Suporta pré-preenchimento do assistente', 'boolean'],
      ['supports_forced_tool_use', 'Suporta uso forçado de ferramentas', 'boolean'],
      ['supports_sampling_params', 'Suporta parâmetros de amostragem', 'boolean'],
      ['supports_speed', 'Suporta controle de velocidade', 'boolean'],
      ['supports_output_config', 'Suporta configuração de saída', 'boolean'],
      ['use_openai_responses_path', 'Usa rota de respostas da OpenAI', 'boolean'],
      ['thinking_always_on', 'Pensamento sempre ativo', 'boolean'],
    ],
  },
  {
    title: 'Outros',
    fields: [
      ['supported_modalities', 'Modalidades Suportadas', 'list'],
      ['supported_output_modalities', 'Modalidades de Saída Suportadas', 'list'],
      ['supported_audio_formats', 'Formatos de Áudio Suportados', 'list'],
      ['supported_endpoints', 'Endpoints Suportados', 'list'],
      ['reasoning_effort_levels', 'Níveis de Esforço de Raciocínio', 'list'],
      ['search_context_cost_per_query', 'Custo de Contexto de Busca (por consulta)', 'json'],
      ['metadata', 'Metadados', 'json'],
      ['provider_specific_entry', 'Configuração Específica do Provedor', 'json'],
      ['rules', 'Regras', 'json'],
      ['input_dbu_cost_per_token', 'Custo em DBU (entrada)', 'money'],
      ['output_dbu_cost_per_token', 'Custo em DBU (saída)', 'money'],
      ['web_search_billing_unit', 'Unidade de Cobrança de Busca na Web', 'text'],
      ['vertex_ai_audio_api', 'API de Áudio (Vertex AI)', 'text'],
      ['audio_transcription_config', 'Configuração de Transcrição de Áudio', 'text'],
      ['bedrock_output_config_effort_ceiling', 'Teto de Esforço de Saída (Bedrock)', 'text'],
    ],
  },
]

/** Infere um tipo de formatação para campos não mapeados. */
function inferKind(key, value) {
  if (typeof value === 'boolean') return 'boolean'
  if (Array.isArray(value)) {
    const primitivesOnly = value.every(
      (v) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean',
    )
    return primitivesOnly ? 'list' : 'json'
  }
  if (typeof value === 'object') return 'json'
  if (typeof value === 'number') return key.includes('cost') ? 'money' : 'tokens'
  return 'text'
}

/** Humaniza um nome de campo snake_case usando o dicionário WORD_PT. */
function humanizeKey(key) {
  const joined = String(key)
    .split('_')
    .map((token) => {
      if (/^\d+k$/.test(token)) return token.toUpperCase()
      if (/^\d+hr$/.test(token)) return token.replace('hr', 'h')
      return WORD_PT[token] ?? token
    })
    .join(' ')
  return joined.charAt(0).toUpperCase() + joined.slice(1)
}

/** Formata um valor de acordo com o tipo indicado. */
function formatValue(kind, value) {
  if (value === undefined || value === null || value === '') return '—'
  switch (kind) {
    case 'boolean':
      return value === true || value === 'true' ? 'Sim' : 'Não'
    case 'tokens':
      return formatContextLimit(value)
    case 'money':
      return formatMoney(value)
    case 'mode':
      return MODE_LABELS[value] ?? String(value)
    case 'list': {
      if (Array.isArray(value)) {
        const primitivesOnly = value.every(
          (v) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean',
        )
        return primitivesOnly ? value.map(String).join(', ') : JSON.stringify(value)
      }
      return String(value)
    }
    case 'json':
      return JSON.stringify(value, null, 2)
    default:
      return String(value)
  }
}

/**
 * Gera as seções (título + itens) para o painel de detalhes de um modelo.
 * Retorna um Array de { title, items: [{ label, value, kind, rawKey? }] }.
 */
export function buildModelDetails(raw) {
  if (!raw || typeof raw !== 'object') return []

  const usedKeys = new Set()
  const sections = []

  for (const group of GROUPS) {
    const items = []
    for (const [key, label, kind] of group.fields) {
      const value = raw[key]
      if (value === undefined || value === null || value === '') continue
      usedKeys.add(key)
      items.push({ label, value: formatValue(kind, value), kind })
    }
    if (items.length) sections.push({ title: group.title, items })
  }

  // Campos não mapeados explicitamente aparecem em "Outros campos".
  const leftovers = Object.entries(raw).filter(
    ([key, value]) =>
      !usedKeys.has(key) && value !== undefined && value !== null && value !== '',
  )

  if (leftovers.length) {
    sections.push({
      title: 'Outros campos',
      items: leftovers.map(([key, value]) => {
        const kind = inferKind(key, value)
        return {
          label: humanizeKey(key),
          value: formatValue(kind, value),
          kind,
          rawKey: key,
        }
      }),
    })
  }

  return sections
}
