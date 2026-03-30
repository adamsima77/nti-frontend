<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-navy">Prihlasky</h1>
      <p class="text-gray-500 mt-1">Pipeline prihlasok a ich stavy</p>
    </div>

    <div class="bg-white rounded-lg border border-gray-200">
      <UiDataTable
        :columns="columns"
        :rows="filteredApplications"
      >
        <template #header>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border-b border-gray-100">
            <UiInput
              v-model="search"
              placeholder="Hladat podla timu alebo ID..."
            />
            <UiSelect
              v-model="statusFilter"
              :options="statusOptions"
              placeholder="Vsetky stavy"
            />
            <UiSelect
              v-model="programFilter"
              :options="programOptions"
              placeholder="Vsetky programy"
            />
          </div>
        </template>

        <template #cell-status="{ value }">
          <UiStatusBadge :status="value" />
        </template>

        <template #row-actions>
          <div class="flex items-center gap-2">
            <button class="text-blue-600 hover:text-blue-800">
              <Eye class="w-4 h-4" />
            </button>
          </div>
        </template>
      </UiDataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Eye } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  // middleware: ['auth'], // TODO: re-enable when backend is available
})

useHead({ title: 'Prihlasky — Admin | NTI' })

const search = ref('')
const statusFilter = ref('')
const programFilter = ref('')

const columns = [
  { key: 'appId', label: 'ID', sortable: true },
  { key: 'team', label: 'Tim', sortable: true },
  { key: 'call', label: 'Vyzva', sortable: true },
  { key: 'program', label: 'Program', sortable: true },
  { key: 'status', label: 'Stav', sortable: true },
  { key: 'date', label: 'Datum', sortable: true },
]

const statusOptions = [
  { value: '', label: 'Vsetky stavy' },
  { value: 'submitted', label: 'Podane' },
  { value: 'evaluating', label: 'V hodnoteni' },
  { value: 'approved', label: 'Schvalene' },
  { value: 'rejected', label: 'Zamietnute' },
  { value: 'pending', label: 'Caka na doplnenie' },
]

const programOptions = [
  { value: '', label: 'Vsetky programy' },
  { value: 'Program A', label: 'Program A' },
  { value: 'Program B', label: 'Program B' },
]

const applications = ref([
  {
    id: 1,
    appId: 'APP-001',
    team: 'EcoTech',
    call: 'Jarny inkubator 2026',
    program: 'Program A',
    status: 'submitted',
    date: '28.03.2026',
  },
  {
    id: 2,
    appId: 'APP-002',
    team: 'SmartCampus',
    call: 'Jarny inkubator 2026',
    program: 'Program A',
    status: 'evaluating',
    date: '25.03.2026',
  },
  {
    id: 3,
    appId: 'APP-003',
    team: 'DataFlow',
    call: 'Jarny inkubator 2026',
    program: 'Program A',
    status: 'approved',
    date: '20.03.2026',
  },
  {
    id: 4,
    appId: 'APP-004',
    team: 'HealthBot',
    call: 'Letny sprint',
    program: 'Program B',
    status: 'rejected',
    date: '18.03.2026',
  },
  {
    id: 5,
    appId: 'APP-005',
    team: 'GreenEnergy',
    call: 'Jarny inkubator 2026',
    program: 'Program A',
    status: 'pending',
    date: '15.03.2026',
  },
  {
    id: 6,
    appId: 'APP-006',
    team: 'EduApp',
    call: 'Letny sprint',
    program: 'Program B',
    status: 'submitted',
    date: '27.03.2026',
  },
  {
    id: 7,
    appId: 'APP-007',
    team: 'CityGuide',
    call: 'Jarny inkubator 2026',
    program: 'Program A',
    status: 'evaluating',
    date: '22.03.2026',
  },
  {
    id: 8,
    appId: 'APP-008',
    team: 'FoodShare',
    call: 'Letny sprint',
    program: 'Program B',
    status: 'approved',
    date: '10.03.2026',
  },
])

const filteredApplications = computed(() => {
  return applications.value.filter((a) => {
    const matchSearch =
      !search.value ||
      a.team.toLowerCase().includes(search.value.toLowerCase()) ||
      a.appId.toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = !statusFilter.value || a.status === statusFilter.value
    const matchProgram = !programFilter.value || a.program === programFilter.value
    return matchSearch && matchStatus && matchProgram
  })
})
</script>
