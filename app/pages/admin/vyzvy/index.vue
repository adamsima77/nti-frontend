<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-navy">Výzvy</h1>
        <p class="text-gray-500 mt-1">Správa výziev a prihlasovacích období</p>
      </div>
      <UiButton @click="openCreateModal">
        <Plus class="w-4 h-4 mr-1" />
        Nová výzva
      </UiButton>
    </div>

    <div class="bg-white rounded-lg border border-gray-200">
    <UiDataTable
  :columns="columns"
  :rows="currentRows"
  :sort-by="sortBy"
  :sort-dir="sortDir"
  :loading="loading"
  :paginated="true"
  @update:sort-by="sortBy = $event"
  @update:sort-dir="sortDir = $event"
>
        <template #header>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 border-b border-gray-100">
            <UiSelect
              v-model="statusFilter"
              :options="statusOptions"
              placeholder="Všetky stavy"
              @change="onFilterChange"
            />
            <UiInput
              v-model="deadlineFrom"
              type="date"
              placeholder="Deadline od"
              @change="onFilterChange"
            />
            <UiInput
              v-model="deadlineTo"
              type="date"
              placeholder="Deadline do"
              @change="onFilterChange"
            />
            <div class="flex items-center gap-3">
              <button
                v-if="hasActiveFilters"
                class="flex items-center gap-1 text-sm text-gray-400 hover:text-danger-500 transition-colors"
                title="Zrušiť filtre"
                @click="resetFilters"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </template>

        <template #cell-name="{ row }">
          <div>
            <p class="font-medium text-navy text-sm">{{ row.name }}</p>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ row.organization?.name ?? '—' }}
            </p>
          </div>
        </template>

        <template #cell-program="{ row }">
          <span class="text-sm text-gray-700">
            {{ row.program?.name ?? '—' }}
          </span>
        </template>

        <template #cell-status="{ row }">
          <UiStatusBadge
  v-if="resolveStatusKey(row)"
  :status="resolveStatusKey(row)"
/>
          <span v-else class="text-gray-400">—</span>
        </template>

        <template #cell-deadline="{ row }">
          <div>
            <p class="text-sm text-gray-700">
              {{ formatDate(row.application_deadline) }}
            </p>
            <p
              v-if="row.is_open"
              class="text-xs text-emerald-600 font-medium mt-0.5"
            >
              Otvorená
            </p>
            <p v-else class="text-xs text-gray-400 mt-0.5">Uzavretá</p>
          </div>
        </template>

       <template #cell-applications="{ row }">
  <span class="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
    <FileText class="w-3.5 h-3.5 text-gray-400" />
    {{ row.applicants_count ?? row.applications_count ?? 0 }}
  </span>
</template>

        <template #row-actions="{ row }">
          <div class="flex items-center gap-2">
            
          
            <button
              class="text-gray-400 hover:text-navy transition-colors"
              title="Upraviť"
              @click="openEditModal(row)"
            >
              <Pencil class="w-4 h-4" />
            </button>
          </div>
        </template>
      </UiDataTable>

      <div
        v-if="pagination.totalPages > 1"
        class="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50"
      >
        <span class="text-sm text-gray-500">
          Celkovo výziev: {{ pagination.total }}
        </span>
        <UiPagination
          :current-page="pagination.currentPage"
          :total-pages="pagination.totalPages"
          @update:current-page="onPageChange"
        />
      </div>
    </div>

    <AdminCallModal
      v-model="modalOpen"
      :call="selectedCall"
      @saved="fetchCalls"
    />
  </div>
</template>
<script setup lang="ts">
import { Plus, Pencil, FileText, X } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
})

useHead({ title: 'Výzvy — Admin | NTI' })

interface CallRow {
  id: number
  name: string
  description?: string

  application_start?: string
  application_deadline?: string

  project_start?: string
  project_end?: string

  is_open?: boolean

  applicants_count?: number
  applications_count?: number

  status?: {
    id: number
    name: string
  }

  program?: {
    id: number
    name: string
  }

  organization?: {
    id: number
    name: string
  }

  currentStatus?: {
    id: number
    name: string
  }

  currentStatusHistory?: {
    id: number
    status: {
      id: number
      name: string
    }
  }

  call_type?: {
    id: number
    name: string
  }

  callTranslations?: any[]
  callCriteria?: any[]
}

const api = useApi()
const { addToast } = useToast()

// ── Filters ───────────────────────────────────────────────────────────────────

const statusFilter = ref('')
const deadlineFrom = ref('')
const deadlineTo = ref('')

const sortBy = ref<string | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')

const statusOptions = [
  { value: '', label: 'Všetky stavy' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Publikované', label: 'Publikované' },
  { value: 'V párovaní', label: 'V párovaní' },
  { value: 'Pridelené', label: 'Pridelené' },
  { value: 'V realizácii', label: 'V realizácii' },
  { value: 'Uzavreté', label: 'Uzavreté' },
]

const hasActiveFilters = computed(
  () => !!statusFilter.value || !!deadlineFrom.value || !!deadlineTo.value,
)

function resetFilters() {
  statusFilter.value = ''
  deadlineFrom.value = ''
  deadlineTo.value = ''
  pagination.value.currentPage = 1
  fetchCalls()
}

// ── Table columns ─────────────────────────────────────────────────────────────

const columns = [
  { key: 'name', label: 'Názov', sortable: true },
  { key: 'program', label: 'Program', sortable: true },
  { key: 'status', label: 'Stav' },
  { key: 'deadline', label: 'Deadline', sortable: true },
  { key: 'applications', label: 'Prihlášky', sortable: true },
]

// ── Data ──────────────────────────────────────────────────────────────────────

const loading = ref(false)
const calls = ref<CallRow[]>([])

const currentRows = computed(() => {
  if (!sortBy.value) return calls.value

  return [...calls.value].sort((a, b) => {
    let av: any
    let bv: any

    switch (sortBy.value) {
      case 'name':
        av = a.name ?? ''
        bv = b.name ?? ''
        break

      case 'program':
        av = a.program?.name ?? ''
        bv = b.program?.name ?? ''
        break

      case 'deadline':
        av = a.application_deadline ?? ''
        bv = b.application_deadline ?? ''
        break

      case 'applications':
        av = a.applicants_count ?? a.applications_count ?? 0
        bv = b.applicants_count ?? b.applications_count ?? 0
        break

      default:
        av = ''
        bv = ''
    }

    const comparison =
      typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv), 'sk', {
            numeric: true,
            sensitivity: 'base',
          })

    return sortDir.value === 'asc' ? comparison : -comparison
  })
})

const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  total: 0,
  perPage: 15,
})

// ── API ───────────────────────────────────────────────────────────────────────

async function fetchCalls() {
  loading.value = true

  try {
    const params: Record<string, any> = {
      page: pagination.value.currentPage,
      per_page: pagination.value.perPage,
    }

    if (statusFilter.value) {
      params.status = statusFilter.value
    }

    if (deadlineFrom.value) {
      params.deadline_from = deadlineFrom.value
    }

    if (deadlineTo.value) {
      params.deadline_to = deadlineTo.value
    }

    const res: any = await api.get('/v1/admin/calls', { params })

    // FIX: Defensive unwrap that mirrors the logic you used inside openEditModal
    const data = res?.data ?? res
    calls.value = Array.isArray(data) ? data : []

    // Pagination fallbacks if response is a naked array or carries meta signatures
    pagination.value.total =
      res?.meta?.total ??
      res?.total ??
      (Array.isArray(res) ? res.length : 0)

    pagination.value.currentPage =
      res?.meta?.current_page ??
      res?.current_page ??
      pagination.value.currentPage

    pagination.value.totalPages =
      res?.meta?.last_page ??
      res?.last_page ??
      Math.max(1, Math.ceil(pagination.value.total / pagination.value.perPage))
      
  } catch {
    addToast({
      message: 'Nepodarilo sa načítať výzvy.',
      type: 'error',
    })
  } finally {
    loading.value = false
  }
}

function onPageChange(page: number) {
  pagination.value.currentPage = page
  fetchCalls()
}

function onFilterChange() {
  pagination.value.currentPage = 1
  fetchCalls()
}

// ── Status helpers ────────────────────────────────────────────────────────────

function resolveStatusKey(row: CallRow): string {
  const statusName =
    row.status?.name ||
    row.currentStatusHistory?.status?.name ||
    row.currentStatus?.name

  const lookup: Record<string, string> = {
    Draft: 'draft',
    Publikované: 'published',
    'V párovaní': 'matching',
    Pridelené: 'assigned',
    'V realizácii': 'in_progress',
    Uzavreté: 'closed',
  }

  return lookup[statusName ?? ''] ?? 'draft'
}

// ── Modal state ───────────────────────────────────────────────────────────────

const modalOpen = ref(false)
const selectedCall = ref<CallRow | null>(null)

function openCreateModal() {
  selectedCall.value = null
  modalOpen.value    = true
}

async function openEditModal(call: CallRow) {
  try {
    loading.value = true
    const full = await api.get(`/calls/${call.id}`) as any
    selectedCall.value = full?.data ?? full
    modalOpen.value    = true
  } catch {
    addToast({ message: 'Nepodarilo sa načítať výzvu.', type: 'error' })
  } finally {
    loading.value = false
  }
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'

  return new Date(dateStr).toLocaleDateString('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

onMounted(fetchCalls)
</script>