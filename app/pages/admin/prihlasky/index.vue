<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-navy">{{ t('m_d_f_3.title') }}</h1>
      <p class="text-gray-500 mt-1">{{ t('m_d_f_3.subtitle') }}</p>
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
        v-model:sort-by="sortBy"
        v-model:sort-dir="sortDir"
        @update:current-page="onPageChange"
      >
        <template #header>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border-b border-gray-100">
            <UiInput
              v-model="search"
              :placeholder="t('m_d_f_3.search_placeholder')"
            />
            <UiSelect
              v-model="statusFilter"
              :options="statusOptions"
              :placeholder="t('m_d_f_3.status_placeholder')"
            />
            <UiButton @click="handleExport">
              <Download class="w-4 h-4" />
              {{ t('m_d_f_3.export_btn') }}
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
              :title="t('m_d_f_3.view_detail')"
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
    :title="t('common.export_application')"
    :subtitle="t('common.e_a')"
    endpoint="applications/export"
    filename-prefix="applications_export"
    :allowed-formats="['xlsx', 'csv', 'pdf']"
    :is-async="true"
    :filters="exportFilters"
  />
</template>

<script setup lang="ts">
import { Download, Eye } from 'lucide-vue-next'
import { watch, computed, ref } from 'vue'
import type { AdminApplication } from '~/types/admin'

const { t } = useI18n()
definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
  roles: ['nti_admin', 'nti_superadmin'],
})

useHead({ title: 'Prihlášky — Admin | NTI' })
const { addToast } = useToast()
const api = useApi()

// ── Filters ────────────────────────────────────────────────────────────────
const search       = ref('')
const statusFilter = ref<number | ''>('')

// ── Table state ────────────────────────────────────────────────────────────
const isLoading   = ref(false)
const applications = ref<any[]>([])
const currentPage  = ref(1)
const totalPages   = ref(1)

const sortBy  = ref('submittedAt')
const sortDir = ref<'asc' | 'desc'>('desc')

// Columns are computed so labels react to locale changes
const columns = computed(() => [
  { key: 'reference',   label: t('m_d_f_3.columns.id'),     sortable: true },
  { key: 'team',        label: t('m_d_f_3.columns.team'),   sortable: true },
  { key: 'call',        label: t('m_d_f_3.columns.call'),   sortable: true },
  { key: 'status',      label: t('m_d_f_3.columns.status') },
  { key: 'mentor',      label: t('m_d_f_3.columns.mentor') },
  { key: 'submittedAt', label: t('m_d_f_3.columns.date'),   sortable: true },
])

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
  let result = [...mappedApplications.value]

  if (q) {
    result = result.filter(
      (a) => a.reference.toLowerCase().includes(q) || a.team.toLowerCase().includes(q),
    )
  }

  const key = sortBy.value
  const dir = sortDir.value === 'asc' ? 1 : -1

  return result.sort((a, b) => {
    let valA = a[key]
    let valB = b[key]

    if (key === 'submittedAt') {
      valA = a._raw.submitted_at ? new Date(a._raw.submitted_at).getTime() : 0
      valB = b._raw.submitted_at ? new Date(b._raw.submitted_at).getTime() : 0
    }

    if (valA === null || valA === undefined) return 1
    if (valB === null || valB === undefined) return -1

    if (typeof valA === 'string' && typeof valB === 'string') {
      return valA.localeCompare(valB, 'sk') * dir
    }

    return (valA < valB ? -1 : valA > valB ? 1 : 0) * dir
  })
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(search, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  const q = search.value.toLowerCase().trim()
  if (!q || q.length < 2) return
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchApplications()
  }, 300)
})

const exportFilters = computed(() => ({
  ...(statusFilter.value !== '' && { status_id: statusFilter.value }),
  ...(search.value !== ''       && { search: search.value }),
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
          search: search.value,
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
      { value: '', label: t('m_d_f_3.status_all') },
      ...rawStatuses.map((s) => ({ value: s.id, label: s.name })),
    ]
  } catch {
    addToast(t('m_d_f_3.error_load'), 'error')
  } finally {
    isLoading.value = false
  }
}

watch(statusFilter, () => {
  currentPage.value = 1
  fetchApplications()
})

async function onPageChange(page: number) {
  if (currentPage.value === page) return  // sort reset the page to the same value — skip the fetch
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