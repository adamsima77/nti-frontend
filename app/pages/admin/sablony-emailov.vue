<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-navy">Sablony emailov</h1>
        <p class="text-gray-500 mt-1">Sprava emailovych sablon a premennych</p>
      </div>
      <UiButton>
        <Plus class="w-4 h-4" />
        Nova sablona
      </UiButton>
    </div>

    <div class="bg-white rounded-lg border border-gray-200">
      <UiDataTable
        :columns="columns"
        :rows="templates"
      >
        <template #cell-variables="{ value }">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="v in value"
              :key="v"
              class="inline-block px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600 font-mono"
            >
              {{ v }}
            </span>
          </div>
        </template>

        <template #row-actions>
          <div class="flex items-center gap-2">
            <button class="text-blue-600 hover:text-blue-800">
              <Pencil class="w-4 h-4" />
            </button>
            <button class="text-gray-400 hover:text-gray-600">
              <Eye class="w-4 h-4" />
            </button>
          </div>
        </template>
      </UiDataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Pencil, Eye } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  // middleware: ['auth'], // TODO: re-enable when backend is available
})

useHead({ title: 'Sablony emailov — Admin | NTI' })

const columns = [
  { key: 'name', label: 'Nazov', sortable: true },
  { key: 'subject', label: 'Predmet', sortable: true },
  { key: 'variables', label: 'Premenne' },
  { key: 'updated', label: 'Posledna uprava', sortable: true },
]

const templates = ref([
  {
    id: 1,
    name: 'Uvitaci email',
    subject: 'Vitajte v NTI!',
    variables: ['{{meno}}', '{{email}}'],
    updated: '15.03.2026',
  },
  {
    id: 2,
    name: 'Prihlaska prijata',
    subject: 'Vasa prihlaska bola prijata',
    variables: ['{{meno}}', '{{tim}}', '{{vyzva}}'],
    updated: '10.03.2026',
  },
  {
    id: 3,
    name: 'Zmena stavu prihlasky',
    subject: 'Aktualizacia stavu vasej prihlasky',
    variables: ['{{meno}}', '{{stav}}', '{{vyzva}}'],
    updated: '08.03.2026',
  },
  {
    id: 4,
    name: 'Priradenie hodnotitela',
    subject: 'Nova prihlaska na hodnotenie',
    variables: ['{{hodnotitel}}', '{{tim}}', '{{deadline}}'],
    updated: '05.03.2026',
  },
  {
    id: 5,
    name: 'Pripomienka deadline',
    subject: 'Blizi sa deadline vyzvy',
    variables: ['{{vyzva}}', '{{deadline}}', '{{dni}}'],
    updated: '01.03.2026',
  },
])
</script>
