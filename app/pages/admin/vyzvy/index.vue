<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-navy">Vyzvy</h1>
        <p class="text-gray-500 mt-1">Sprava vyziev a prihlasovacich obdobi</p>
      </div>
      <UiButton>
        <Plus class="w-4 h-4" />
        Nova vyzva
      </UiButton>
    </div>

    <div class="bg-white rounded-lg border border-gray-200">
      <UiDataTable
        :columns="columns"
        :rows="calls"
      >
        <template #cell-status="{ value }">
          <UiStatusBadge :status="value" />
        </template>

        <template #row-actions>
          <div class="flex items-center gap-2">
            <button class="text-blue-600 hover:text-blue-800">
              <Eye class="w-4 h-4" />
            </button>
            <button class="text-gray-400 hover:text-gray-600">
              <Pencil class="w-4 h-4" />
            </button>
          </div>
        </template>
      </UiDataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Eye, Pencil } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  // middleware: ['auth'], // TODO: re-enable when backend is available
})

useHead({ title: 'Vyzvy — Admin | NTI' })

const columns = [
  { key: 'name', label: 'Nazov', sortable: true },
  { key: 'program', label: 'Program', sortable: true },
  { key: 'status', label: 'Stav', sortable: true },
  { key: 'deadline', label: 'Deadline', sortable: true },
  { key: 'applications', label: 'Prihlasky', sortable: true },
]

const calls = ref([
  {
    id: 1,
    name: 'Jarny inkubator 2026',
    program: 'Program A',
    status: 'active',
    deadline: '15.04.2026',
    applications: 8,
  },
  {
    id: 2,
    name: 'Letny sprint — mobilna appka',
    program: 'Program B',
    status: 'active',
    deadline: '30.04.2026',
    applications: 5,
  },
  {
    id: 3,
    name: 'Jesenný inkubator 2026',
    program: 'Program A',
    status: 'draft',
    deadline: '01.09.2026',
    applications: 0,
  },
  {
    id: 4,
    name: 'Zimny hackathon 2025',
    program: 'Program B',
    status: 'paused',
    deadline: '15.12.2025',
    applications: 12,
  },
])
</script>
