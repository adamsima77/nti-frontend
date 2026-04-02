<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-navy">Prihlášky</h1>
      <p class="text-gray-500 mt-1">Pipeline prihlášok a ich stavy</p>
    </div>

    <div class="bg-white rounded-lg border border-gray-200">
      <UiDataTable
        :columns="columns"
        :rows="filteredApplications"
        :loading="isLoading"
      >
        <template #header>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border-b border-gray-100">
            <UiInput
              v-model="search"
              placeholder="Hľadať podľa tímu alebo ID..."
            />
            <UiSelect
              v-model="statusFilter"
              :options="statusOptions"
              placeholder="Všetky stavy"
            />
            <UiSelect
              v-model="programFilter"
              :options="programOptions"
              placeholder="Všetky programy"
            />
          </div>
        </template>

        <template #cell-status="{ value }">
          <UiStatusBadge :status="value" />
        </template>

        <template #cell-mentor="{ row }">
          <span
            v-if="row.mentor"
            class="text-sm text-gray-700"
          >
            {{ row.mentor.name }}
          </span>
          <span
            v-else
            class="text-xs text-gray-400"
          >
            —
          </span>
        </template>

        <template #row-actions="{ row }">
          <div class="flex items-center gap-2">
            <button
              class="text-blue-600 hover:text-blue-800"
              title="Zobraziť"
            >
              <Eye class="w-4 h-4" />
            </button>
            <button
              v-if="row.status === 'approved' || row.status === 'active'"
              class="text-purple-600 hover:text-purple-800"
              title="Priradiť mentora / PO"
              @click="openMentorModal(row)"
            >
              <UserPlus class="w-4 h-4" />
            </button>
          </div>
        </template>
      </UiDataTable>
    </div>

    <AdminMentorAssignModal
      v-model="showMentorModal"
      :application="selectedApplication"
      @assigned="fetchApplications"
    />
  </div>
</template>

<script setup lang="ts">
import { Eye, UserPlus } from 'lucide-vue-next'
import type { AdminApplication } from '~/types/admin'

definePageMeta({
  layout: 'admin',
  // middleware: ['auth'],
})

useHead({ title: 'Prihlášky — Admin | NTI' })

const api = useApi()
const search = ref('')
const statusFilter = ref('')
const programFilter = ref('')
const isLoading = ref(false)

const columns = [
  { key: 'appId', label: 'ID', sortable: true },
  { key: 'team', label: 'Tím', sortable: true },
  { key: 'call', label: 'Výzva', sortable: true },
  { key: 'program', label: 'Program', sortable: true },
  { key: 'status', label: 'Stav', sortable: true },
  { key: 'mentor', label: 'Mentor' },
  { key: 'date', label: 'Dátum', sortable: true },
]

const statusOptions = [
  { value: '', label: 'Všetky stavy' },
  { value: 'submitted', label: 'Podané' },
  { value: 'evaluating', label: 'V hodnotení' },
  { value: 'approved', label: 'Schválené' },
  { value: 'rejected', label: 'Zamietnuté' },
  { value: 'pending', label: 'Čaká na doplnenie' },
]

const programOptions = [
  { value: '', label: 'Všetky programy' },
  { value: 'Program A', label: 'Program A' },
  { value: 'Program B', label: 'Program B' },
]

const mockApplications: AdminApplication[] = [
  {
    id: 1,
    appId: 'APP-001',
    team: 'EcoTech',
    call: 'Jarný inkubátor 2026',
    program: 'Program A',
    status: 'submitted',
    date: '28.03.2026',
    mentor: null,
    product_owner: null,
  },
  {
    id: 2,
    appId: 'APP-002',
    team: 'SmartCampus',
    call: 'Jarný inkubátor 2026',
    program: 'Program A',
    status: 'evaluating',
    date: '25.03.2026',
    mentor: null,
    product_owner: null,
  },
  {
    id: 3,
    appId: 'APP-003',
    team: 'DataFlow',
    call: 'Jarný inkubátor 2026',
    program: 'Program A',
    status: 'approved',
    date: '20.03.2026',
    mentor: { id: 5, name: 'Tomáš Beneš' },
    product_owner: null,
  },
  {
    id: 4,
    appId: 'APP-004',
    team: 'HealthBot',
    call: 'Letný šprint',
    program: 'Program B',
    status: 'rejected',
    date: '18.03.2026',
    mentor: null,
    product_owner: null,
  },
  {
    id: 5,
    appId: 'APP-005',
    team: 'GreenEnergy',
    call: 'Jarný inkubátor 2026',
    program: 'Program A',
    status: 'pending',
    date: '15.03.2026',
    mentor: null,
    product_owner: null,
  },
  {
    id: 6,
    appId: 'APP-006',
    team: 'EduApp',
    call: 'Letný šprint',
    program: 'Program B',
    status: 'approved',
    date: '27.03.2026',
    mentor: null,
    product_owner: null,
  },
  {
    id: 7,
    appId: 'APP-007',
    team: 'CityGuide',
    call: 'Jarný inkubátor 2026',
    program: 'Program A',
    status: 'evaluating',
    date: '22.03.2026',
    mentor: null,
    product_owner: null,
  },
  {
    id: 8,
    appId: 'APP-008',
    team: 'FoodShare',
    call: 'Letný šprint',
    program: 'Program B',
    status: 'active',
    date: '10.03.2026',
    mentor: { id: 5, name: 'Tomáš Beneš' },
    product_owner: { id: 4, name: 'Eva Svobodová' },
  },
]

const applications = ref<AdminApplication[]>([...mockApplications])

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

async function fetchApplications() {
  isLoading.value = true
  try {
    const response = await api.get('/v1/admin/applications')
    applications.value = response.data || response || []
  } catch {
    // Keep existing data
  } finally {
    isLoading.value = false
  }
}

onMounted(() => fetchApplications())

// Mentor assignment
const showMentorModal = ref(false)
const selectedApplication = ref<AdminApplication | null>(null)

function openMentorModal(app: AdminApplication) {
  selectedApplication.value = app
  showMentorModal.value = true
}
</script>
