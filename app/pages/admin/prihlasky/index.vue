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
        :paginated="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        row-key="id"
        @update:current-page="onPageChange"
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
              placeholder="Vyberte stav"
            />
            <UiButton @click="handleExport">
              <Download class="w-4 h-4" />
              Exportovať
            </UiButton>
          </div>
        </template>

        <template #cell-status="{ value }">
          <UiStatusBadge :status="value" />
        </template>

        <template #row-actions="{ row }">
          <div class="flex items-center gap-2">
            <button
              class="text-blue-600 hover:text-blue-800 transition"
              title="Zobraziť detail"
              @click="openDetail(row)"
            >
              <Eye class="w-4 h-4" />
            </button>
          </div>
        </template>
      </UiDataTable>
    </div>
  </div>

  <AdminApplicationDetailModal
    v-model="showDetailModal"
    :application-id="selectedApplicationId"
    @refreshed="fetchApplications"
  />

  <AdminExportModal
    v-model="openExportModal"
    title="Export prihlášok"
    subtitle="Exportuje zoznam prihlášok na základe zvolených filtrov"
    endpoint="applications/export"
    filename-prefix="applications_export"
    :allowed-formats="['xlsx', 'csv', 'pdf']"
    :is-async="true"
    :filters="exportFilters"
  />
</template>

<script setup lang="ts">
import { Download, Eye } from 'lucide-vue-next'
import type { AdminApplication } from '~/types/admin'

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
  roles: ['nti_admin', 'nti_superadmin'],
})

useHead({ title: 'Prihlášky — Admin | NTI' })

const api = useApi()

// ── Filters ────────────────────────────────────────────────────────────────
const search       = ref('')
const statusFilter = ref<number | ''>('')

// ── Table state ────────────────────────────────────────────────────────────
const isLoading    = ref(false)
const applications = ref<any[]>([])
const currentPage  = ref(1)
const totalPages   = ref(1)

const columns = [
  { key: 'reference',   label: 'ID',      sortable: true },
  { key: 'team',        label: 'Tím',     sortable: true },
  { key: 'call',        label: 'Výzva',   sortable: true },
  { key: 'status',      label: 'Stav' },
  { key: 'mentor',      label: 'Mentor' },
  { key: 'submittedAt', label: 'Dátum',   sortable: true },
]

// ── Status filter options ──────────────────────────────────────────────────
const statusOptions = ref<{ value: number | ''; label: string }[]>([])

// ── Status slug map ────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, string> = {
  'Draft':               'draft',
  'Podané':              'submitted',
  'V hodnotení':         'evaluating',
  'Vyžiadané doplnenie': 'pending',
  'Schválené':           'approved',
  'Zamietnuté':          'rejected',
  'Pozastavené':         'paused',
  'Onboarding':          'onboarding',
  'Aktívny projekt':     'active',
  'Ukončené':            'completed',
}

// ── Row mapping ────────────────────────────────────────────────────────────
const mappedApplications = computed(() =>
  applications.value.map((a) => {
    const firstMentor = a.mentorships?.[0]?.mentor
    return {
      id:          a.id,
      reference:   a.reference ?? '—',
      team:        a.team?.name ?? '—',
      call:        a.call?.name ?? '—',
      status:      STATUS_MAP[a.status?.name] ?? 'draft',
      mentor:      firstMentor
                     ? `${firstMentor.name} ${firstMentor.surname}`.trim()
                     : null,
      submittedAt: a.submitted_at
                     ? new Date(a.submitted_at).toLocaleDateString('sk-SK')
                     : '—',
      _raw: a,
    }
  }),
)



// ── Client-side search (status filter is server-side) ─────────────────────
const filteredApplications = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return mappedApplications.value
  return mappedApplications.value.filter(
    (a) => a.reference.toLowerCase().includes(q) || a.team.toLowerCase().includes(q),
  )
})

// ── Export filters passed to AdminExportModal ──────────────────────────────
// The modal appends these as query params: ?status_id=X&...
const exportFilters = computed(() => ({
  ...(statusFilter.value !== '' && { status_id: statusFilter.value }),
}))

// ── Data fetching ──────────────────────────────────────────────────────────
async function fetchApplications() {
  isLoading.value = true
  try {
    const [appsRes, statusRes] = await Promise.all([
      api.get('/admin/applications', {
        params: {
          page: currentPage.value,
          ...(statusFilter.value !== '' && { status_id: statusFilter.value }),
        },
      }),
      api.get('/get-status-admin'),
    ])

    const paginator    = appsRes.applications
    applications.value = paginator.data ?? []
    currentPage.value  = paginator.current_page
    totalPages.value   = paginator.last_page

    const rawStatuses: any[] = statusRes.statuses ?? []
    statusOptions.value = [
      { value: '', label: 'Všetky stavy' },
      ...rawStatuses.map((s) => ({ value: s.id, label: s.name })),
    ]
  } catch {
    useToast().error('Nepodarilo sa načítať prihlášky. Skúste to neskôr.')
  } finally {
    isLoading.value = false
  }
}

watch(statusFilter, () => {
  currentPage.value = 1
  fetchApplications()
})

async function onPageChange(page: number) {
  currentPage.value = page
  await fetchApplications()
}

onMounted(() => fetchApplications())

// ── Detail modal ───────────────────────────────────────────────────────────
const showDetailModal       = ref(false)
const selectedApplicationId = ref<number | null>(null)
const selectedApplication   = ref<AdminApplication | null>(null)

function openDetail(row: any) {
  selectedApplicationId.value = row.id
  showDetailModal.value       = true
}

// ── Export modal ───────────────────────────────────────────────────────────
const openExportModal = ref(false)

function handleExport() {
  openExportModal.value = true
}
</script>