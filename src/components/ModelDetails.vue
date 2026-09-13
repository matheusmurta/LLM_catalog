<script setup>
import { computed } from 'vue'
import { buildModelDetails } from '../utils/modelDetails'

const props = defineProps({
  raw: {
    type: Object,
    required: true,
  },
})

const sections = computed(() => buildModelDetails(props.raw))
const rawJson = computed(() => JSON.stringify(props.raw, null, 2))
</script>

<template>
  <div>
    <div class="grid gap-5 md:grid-cols-2">
      <section v-for="section in sections" :key="section.title" class="min-w-0">
        <h4 class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300">
          <span class="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
          {{ section.title }}
        </h4>
        <dl class="space-y-1.5">
          <div
            v-for="item in section.items"
            :key="item.label"
            class="rounded-lg border border-slate-800/70 bg-slate-900/40 px-3 py-2"
          >
            <dt class="flex flex-wrap items-baseline gap-x-1.5 text-[11px] font-medium leading-tight text-slate-400">
              <span>{{ item.label }}</span>
              <span v-if="item.rawKey" class="font-mono text-[10px] text-slate-600">{{ item.rawKey }}</span>
            </dt>
            <dd class="mt-1">
              <pre
                v-if="item.kind === 'json'"
                class="nice-scroll overflow-auto whitespace-pre-wrap break-words rounded bg-slate-950 p-2 text-[11px] leading-relaxed text-slate-300"
              >{{ item.value }}</pre>
              <span
                v-else-if="item.kind === 'boolean'"
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="
                  item.value === 'Sim'
                    ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/30'
                    : 'bg-slate-700/30 text-slate-300 ring-1 ring-inset ring-slate-600/30'
                "
              >
                {{ item.value }}
              </span>
              <span v-else class="font-mono text-sm text-slate-200">{{ item.value }}</span>
            </dd>
          </div>
        </dl>
      </section>
    </div>

    <details class="mt-5 border-t border-slate-800 pt-4">
      <summary class="cursor-pointer select-none text-xs font-medium text-slate-400 transition hover:text-slate-200">
        Ver JSON bruto
      </summary>
      <pre
        class="nice-scroll mt-3 max-h-80 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs leading-relaxed text-slate-300"
      >{{ rawJson }}</pre>
    </details>
  </div>
</template>
