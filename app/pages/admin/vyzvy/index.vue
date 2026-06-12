<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-navy">{{ $t('admin_calls.title') }}</h1>
        <p class="text-gray-500 mt-1">{{ $t('admin_calls.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <ClientOnly>
          <UiButton v-if="canCreateCalls" @click="openCreateModal">
            <Plus class="w-4 h-4 mr-1" />
            {{ $t('admin_calls.add_call') }}
          </UiButton>
        </ClientOnly>
      </div>
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
              :placeholder="$t('admin_calls.all_statuses')"
              @change="onFilterChange"
            />
            <UiInput
              v-model="deadlineFrom"
              type="date"
              :placeholder="$t('admin_calls.deadline_from')"
              @change="onFilterChange"
            />
            <UiInput
              v-model="deadlineTo"
              type="date"
              :placeholder="$t('admin_calls.deadline_to')"
              @change="onFilterChange"
            />
            <div class="flex items-center gap-3">
              <button
                v-if="hasActiveFilters"
                class="flex items-center gap-1 text-sm text-gray-400 hover:text-danger-500 transition-colors"
                :title="$t('admin_calls.clear_filters')"
                @click="resetFilters"
              >
                <X class="w-4 h-4" />
              </button>

              <UiButton @click = "exportCalls"><Download class="w-4 h-4 mr-1" />
          {{ $t('user_management.export_calls') }}</UiButton>
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
              {{ $t('admin_calls.open') }}
            </p>
            <p v-else class="text-xs text-gray-400 mt-0.5">
              {{ $t('admin_calls.closed') }}
            </p>
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
              v-if="isProgramBMatching(row)"
              class="text-indigo-500 hover:text-indigo-700 transition-colors"
              title="Vybrať tím"
              @click.stop="openProgramBModal(row)"
            >
              <Users class="w-4 h-4" />
            </button>

            <button
              v-if="isClosedCall(row)"
              class="text-gray-400 hover:text-blue-600 transition-colors"
              title="Stiahnuť záverečný report"
              @click.stop="downloadClosureReport(row)"
            >
              <FileDown class="w-4 h-4" />
            </button>


            <button
              v-if="canEditCalls"
              class="text-gray-400 hover:text-navy transition-colors"
              :title="$t('admin_calls.edit')"
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
          {{ $t('admin_calls.total_calls', { count: pagination.total }) }}
        </span>
        <UiPagination
          :current-page="pagination.currentPage"
          :total-pages="pagination.totalPages"
          @update:current-page="onPageChange"
        />
      </div>
    </div>

    <ClientOnly>
      <AdminCallModal
        v-model="modalOpen"
        :call="selectedCall"
        @saved="fetchCalls"
      />
    </ClientOnly>

    <ClientOnly>
     <AdminExportModal
  v-model="exportModalOpen"
  :title="t('common.export_call')"
  :subtitle="t('common.export')"
  endpoint="/calls/export"
  filename-prefix="calls_export"
  :allowed-formats="['xlsx', 'csv', 'pdf']"
  :is-async="true"
  :filters="exportFilters"
/>
    </ClientOnly>

    <ClientOnly>
      <AdminProgramBTeamSelectionModal
        v-model="programBModalOpen"
        :call="programBCall"
        @team-selected="fetchCalls"
      />
    </ClientOnly>


    <ClientOnly>
      <AdminExportModal
        v-if="reportCall"
        v-model="reportModalOpen"
        title="Záverečný report výzvy"
        :subtitle="reportCall?.name"
        :endpoint="`/v1/admin/calls/${reportCall?.id}/report`"
        filename-prefix="project-report"
        :allowed-formats="['pdf', 'xlsx']"
        :is-async="true"
        :show-lang-picker="true"
      />
    </ClientOnly>

  </div>
</template>

<script setup lang="ts">
import { Plus, Pencil, FileText, X, Users, Download, FileDown } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
  roles: ['nti_admin', 'nti_superadmin'],
})

const { t } = useI18n()

useHead({ title: t('admin_calls.page_title') })

const exportFilters = computed(() => ({
  status: statusFilter.value || undefined,
  deadline_from: deadlineFrom.value || undefined,
  deadline_to: deadlineTo.value || undefined,
}))

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
  status?: { id: number; name: string }
  program?: { id: number; name: string }
  organization?: { id: number; name: string }
  currentStatus?: { id: number; name: string }
  currentStatusHistory?: { id: number; status: { id: number; name: string } }
  call_type?: { id: number; name: string }
  callTranslations?: any[]
  callCriteria?: any[]
}

const api = useApi()
const { addToast } = useToast()

// ── Auth & Permissions ────────────────────────────────────────────────────────

const authStore      = useAuthStore()
const canCreateCalls = computed(() => authStore.hasPermission('programs.create'))
const canEditCalls   = computed(() => authStore.hasPermission('programs.edit'))

// ── Filters ───────────────────────────────────────────────────────────────────

const statusFilter = ref('')
const deadlineFrom = ref('')
const deadlineTo   = ref('')
const sortBy       = ref<string | null>(null)
const sortDir      = ref<'asc' | 'desc'>('asc')

const statusOptions = computed(() => [
  { value: '',             label: t('admin_calls.all_statuses') },
  { value: 'Draft',        label: 'Draft' },
  { value: 'Publikované',  label: 'Publikované' },
  { value: 'V párovaní',   label: 'V párovaní' },
  { value: 'Pridelené',    label: 'Pridelené' },
  { value: 'V realizácii', label: 'V realizácii' },
  { value: 'Uzavreté',     label: 'Uzavreté' },
])

const hasActiveFilters = computed(
  () => !!statusFilter.value || !!deadlineFrom.value || !!deadlineTo.value,
)

function resetFilters() {
  statusFilter.value           = ''
  deadlineFrom.value           = ''
  deadlineTo.value             = ''
  pagination.value.currentPage = 1
  fetchCalls()
}

// ── Columns ───────────────────────────────────────────────────────────────────

const columns = computed(() => [
  { key: 'name',         label: t('admin_calls.col_name'),         sortable: true },
  { key: 'program',      label: t('admin_calls.col_program'),      sortable: true },
  { key: 'status',       label: t('admin_calls.col_status') },
  { key: 'deadline',     label: t('admin_calls.col_deadline'),     sortable: true },
  { key: 'applications', label: t('admin_calls.col_applications'), sortable: true },
])

// ── Data ──────────────────────────────────────────────────────────────────────

const loading = ref(false)
const calls   = ref<CallRow[]>([])

const pagination = ref({
  currentPage: 1,
  totalPages:  1,
  total:       0,
  perPage:     15,
})

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

    const cmp =
      typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv), 'sk', {
            numeric: true, sensitivity: 'base',
          })

    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

const exportModalOpen = ref(false)
const exportCalls = () => {
  exportModalOpen.value = true
}

// ── API ───────────────────────────────────────────────────────────────────────

async function fetchCalls() {
  loading.value = true

  try {
    const params: Record<string, any> = {
      page:     pagination.value.currentPage,
      per_page: pagination.value.perPage,
    }

    if (statusFilter.value) params.status        = statusFilter.value
    if (deadlineFrom.value) params.deadline_from = deadlineFrom.value
    if (deadlineTo.value)   params.deadline_to   = deadlineTo.value

    const res: any = await api.get('/v1/admin/calls', { params })

    calls.value                  = res?.data         ?? []
    pagination.value.total       = res?.total        ?? 0
    pagination.value.currentPage = res?.current_page ?? pagination.value.currentPage
    pagination.value.totalPages  = res?.last_page    ?? 1

  } catch {
    addToast({ message: t('admin_calls.fetch_error'), type: 'error' })
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
    'Draft':        'draft',
    'Publikované':  'published',
    'V párovaní':   'matching',
    'Pridelené':    'assigned',
    'V realizácii': 'in_progress',
    'Uzavreté':     'closed',
  }

  return lookup[statusName ?? ''] ?? 'draft'
}

// ── Program B helpers ──────────────────────────────────────────────────────────

function isDraftCall(row: CallRow): boolean {
  const status = row.status?.name || row.currentStatusHistory?.status?.name || row.currentStatus?.name
  return status === 'Draft'
}

function isProgramBCall(row: CallRow): boolean {
  return (row.program?.name ?? '').toLowerCase().includes('b')
}

function isClosedCall(row: CallRow): boolean {
  const statusName =
    row.status?.name ||
    row.currentStatusHistory?.status?.name ||
    row.currentStatus?.name

  return statusName === 'Uzavreté'
}

const reportModalOpen = ref(false)
const reportCall      = ref<CallRow | null>(null)
const reportLang      = ref<'sk' | 'en'>('sk')

function downloadClosureReport(row: CallRow) {
  reportCall.value      = row
  reportModalOpen.value = true
}

function isProgramBMatching(row: CallRow): boolean {
  const statusName =
    row.status?.name ||
    row.currentStatusHistory?.status?.name ||
    row.currentStatus?.name

  return isProgramBCall(row) && statusName === 'V párovaní'
}


const programBModalOpen = ref(false)
const programBCall      = ref<{ id: number; name: string } | null>(null)

function openProgramBModal(row: CallRow) {
  programBCall.value      = { id: row.id, name: row.name }
  programBModalOpen.value = true
}

// ── Modal ─────────────────────────────────────────────────────────────────────

const modalOpen    = ref(false)
const selectedCall = ref<CallRow | null>(null)

function openCreateModal() {
  selectedCall.value = null
  modalOpen.value    = true
}

async function openEditModal(call: CallRow) {
  try {
    loading.value      = true
    const full: any    = await api.get(`/v1/admin/calls/${call.id}`)
    selectedCall.value = full?.data ?? full
    modalOpen.value    = true
  } catch {
    addToast({ message: t('admin_calls.load_error'), type: 'error' })
  } finally {
    loading.value = false
  }
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('sk-SK', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

onMounted(fetchCalls)
</script>