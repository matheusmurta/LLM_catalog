<script setup>
import { ref, computed } from 'vue'
import { useModels } from './composables/useModels'
import ModelsTable from './components/ModelsTable.vue'
import { formatContextLimit } from './utils/format'

const { models, providers, loading, error, reload } = useModels()

// ===== Filtros (estado reativo) =====
const searchQuery = ref('')
const selectedProvider = ref('')

// ===== Ordenação =====
const sortField = ref('name')
const sortOrder = ref('asc') // 'asc' | 'desc'

const sortFields = [
  { value: 'name', label: 'Nome do Modelo' },
  { value: 'provider', label: 'Provedor' },
  { value: 'maxInputTokens', label: 'Contexto (input)' },
  { value: 'inputCostPerMillion', label: 'Custo Entrada / 1M' },
  { value: 'outputCostPerMillion', label: 'Custo Saída / 1M' },
]

// ===== Lista filtrada em tempo real (computed property) =====
const filteredModels = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return models.value.filter((model) => {
    const matchesName = !query || model.name.toLowerCase().includes(query)
    const matchesProvider =
      !selectedProvider.value || model.provider === selectedProvider.value
    return matchesName && matchesProvider
  })
})

// ===== Lista ordenada: aplica a ordenação sobre a lista já filtrada =====
const sortedModels = computed(() => {
  const dir = sortOrder.value === 'asc' ? 1 : -1
  const field = sortField.value

  return [...filteredModels.value].sort((a, b) => {
    const va = a[field]
    const vb = b[field]

    // Valores ausentes ficam sempre por último, independente da direção.
    const aMissing = va === null || va === undefined
    const bMissing = vb === null || vb === undefined
    if (aMissing && bMissing) return 0
    if (aMissing) return 1
    if (bMissing) return -1

    if (typeof va === 'number' && typeof vb === 'number') {
      return (va - vb) * dir
    }
    return String(va).toLowerCase().localeCompare(String(vb).toLowerCase()) * dir
  })
})

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const hasActiveFilters = computed(
  () => searchQuery.value.trim() !== '' || selectedProvider.value !== '',
)

function clearFilters() {
  searchQuery.value = ''
  selectedProvider.value = ''
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Cabeçalho -->
    <header class="border-b border-slate-800 bg-slate-950/80">
      <div class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <p class="text-sm font-medium uppercase tracking-widest text-indigo-400">
            LiteLLM · Pricing oficial
          </p>
          <h1 class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Catálogo de Modelos LLM
          </h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Explore preços, limites de contexto e provedores a partir do JSON oficial
            do LiteLLM.
          </p>
        </div>

        <!-- Estatísticas -->
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div class="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
            <p class="text-xs font-medium text-slate-400">Modelos</p>
            <p class="mt-1 text-2xl font-bold text-white">
              {{ formatContextLimit(models.length) }}
            </p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
            <p class="text-xs font-medium text-slate-400">Provedores</p>
            <p class="mt-1 text-2xl font-bold text-white">
              {{ formatContextLimit(providers.length) }}
            </p>
          </div>
          <div class="col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 sm:col-span-1">
            <p class="text-xs font-medium text-slate-400">Exibindo</p>
            <p class="mt-1 text-2xl font-bold text-white">
              {{ formatContextLimit(filteredModels.length) }}
            </p>
          </div>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Estado de carregamento -->
      <div v-if="loading" class="flex flex-col items-center gap-4 py-24">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500"></div>
        <p class="text-sm font-medium text-slate-400">Carregando modelos…</p>
      </div>

      <!-- Alerta de erro -->
      <div v-else-if="error" class="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
        <svg
          class="mx-auto h-10 w-10 text-rose-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
        <p class="mt-3 font-semibold text-rose-200">Não foi possível carregar os dados</p>
        <p class="mt-1 text-sm text-rose-300/80">{{ error }}</p>
        <button
          type="button"
          class="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
          @click="reload"
        >
          Tentar novamente
        </button>
      </div>

      <template v-else>
        <!-- Controles de filtro -->
        <section class="mb-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <!-- Busca por nome -->
            <div class="relative min-w-[220px] flex-1">
              <svg
                class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar por nome do modelo…"
                class="w-full rounded-lg border border-slate-700 bg-slate-950/60 py-2.5 pl-10 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <!-- Filtro por provedor -->
            <div class="w-full sm:w-64">
              <select
                v-model="selectedProvider"
                class="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="">Todos os provedores</option>
                <option v-for="provider in providers" :key="provider" :value="provider">
                  {{ provider }}
                </option>
              </select>
            </div>

            <!-- Ordenação: campo -->
            <div class="w-full sm:w-56">
              <select
                v-model="sortField"
                aria-label="Ordenar por"
                class="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option v-for="field in sortFields" :key="field.value" :value="field.value">
                  Ordenar: {{ field.label }}
                </option>
              </select>
            </div>

            <!-- Ordenação: direção (crescente/decrescente) -->
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
              :title="sortOrder === 'asc' ? 'Ordem crescente' : 'Ordem decrescente'"
              @click="toggleSortOrder"
            >
              <span>{{ sortOrder === 'asc' ? 'Crescente' : 'Decrescente' }}</span>
              <svg
                class="h-4 w-4 transition-transform"
                :class="sortOrder === 'asc' ? '' : 'rotate-180'"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 19.5V4.5m0 0-6.75 6.75M12 4.5l6.75 6.75" />
              </svg>
            </button>

            <!-- Limpar filtros -->
            <button
              v-if="hasActiveFilters"
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
              @click="clearFilters"
            >
              Limpar
            </button>
          </div>
        </section>

        <!-- Tabela -->
        <section class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
          <ModelsTable v-if="sortedModels.length" :models="sortedModels" />
          <div v-else class="px-4 py-20 text-center">
            <p class="text-lg font-semibold text-slate-300">Nenhum modelo encontrado</p>
            <p class="mt-1 text-sm text-slate-500">Ajuste a busca ou o filtro de provedor.</p>
          </div>
        </section>
      </template>
    </main>

    <footer class="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
      Dados obtidos de
      <a
        href="https://github.com/BerriAI/litellm"
        target="_blank"
        rel="noopener"
        class="text-indigo-400 hover:underline"
      >
        LiteLLM
      </a>
      · O custo por 1 milhão de tokens é calculado a partir do custo por 1 token.
    </footer>
  </div>
</template>
