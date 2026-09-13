<script setup>
import { ref } from 'vue'
import { formatContextLimit, formatPrice } from '../utils/format'
import ModelDetails from './ModelDetails.vue'

defineProps({
  models: {
    type: Array,
    required: true,
  },
})

// Controle do accordion: nomes dos modelos atualmente expandidos.
const expanded = ref(new Set())

function toggleDetails(name) {
  const next = new Set(expanded.value)
  if (next.has(name)) next.delete(name)
  else next.add(name)
  expanded.value = next
}
</script>

<template>
  <div class="nice-scroll overflow-x-auto">
    <table class="w-full min-w-[840px] border-collapse text-left text-sm">
      <thead>
        <tr class="border-b border-slate-700/70 bg-slate-900 text-xs uppercase tracking-wider text-slate-400">
          <th class="px-4 py-3 font-semibold">Nome do Modelo</th>
          <th class="px-4 py-3 font-semibold">Provedor</th>
          <th class="px-4 py-3 text-right font-semibold">Contexto (input)</th>
          <th class="px-4 py-3 text-right font-semibold">Custo Entrada / 1M tokens</th>
          <th class="px-4 py-3 text-right font-semibold">Custo Saída / 1M tokens</th>
          <th class="px-4 py-3 text-right font-semibold">Detalhes</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-800/70">
        <template v-for="model in models" :key="model.name">
          <tr class="transition-colors hover:bg-slate-800/40">
          <td class="max-w-[320px] px-4 py-3">
            <span class="break-all font-mono text-[13px] font-medium text-slate-100">
              {{ model.name }}
            </span>
          </td>
          <td class="px-4 py-3">
            <span
              v-if="model.provider"
              class="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/20"
            >
              {{ model.provider }}
            </span>
            <span v-else class="text-slate-500">—</span>
          </td>
          <td class="px-4 py-3 text-right font-mono text-slate-300">
            {{ formatContextLimit(model.maxInputTokens) }}
          </td>
          <td class="px-4 py-3 text-right font-mono text-emerald-300">
            {{ formatPrice(model.inputCostPerMillion) }}
          </td>
          <td class="px-4 py-3 text-right font-mono text-emerald-300">
            {{ formatPrice(model.outputCostPerMillion) }}
          </td>
          <td class="px-4 py-3 text-right">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-indigo-500/60 hover:text-indigo-300"
              :aria-expanded="expanded.has(model.name)"
              @click="toggleDetails(model.name)"
            >
              <span>{{ expanded.has(model.name) ? 'Ocultar' : 'Detalhes' }}</span>
              <svg
                class="h-3.5 w-3.5 transition-transform"
                :class="expanded.has(model.name) ? 'rotate-180' : ''"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </td>
          </tr>
          <!-- Linha de detalhes (accordion): painel formatado em português -->
          <tr v-if="expanded.has(model.name)">
            <td colspan="6" class="bg-slate-950/60 px-4 py-4">
              <ModelDetails :raw="model.raw" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
