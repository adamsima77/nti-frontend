<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-navy">Používatelia</h1>
        <p class="text-gray-500 mt-1">Správa registrovaných používateľov a ich rolí</p>
      </div>
      <UiButton @click="openCreateModal">
        <Plus class="w-4 h-4 mr-1" />
        Pridať používateľa
      </UiButton>
    </div>

    <div class="bg-white rounded-lg border border-gray-200">
      <UiDataTable
        :columns="columns"
        :rows="currentRows"
        :sort-by="sortBy"
        :sort-dir="sortDir"
        :loading="isLoading"
        @update:sort-by="sortBy = $event"
        @update:sort-dir="sortDir = $event"
        @update:current-page="onPageChange"
      >
        <template #header>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 border-b border-gray-100">
            <UiInput
              v-model="search"
              placeholder="Hľadať podľa mena alebo emailu..."
              @input="onSearchInput"
            />
            <UiSelect
              v-model="roleFilter"
              :options="roleOptions"
              placeholder="Všetky role"
              @change="onFilterChange"
            />
            <UiSelect
              v-model="statusFilter"
              :options="statusOptions"
              placeholder="Všetky stavy"
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
          <span>{{ row.name }} {{ row.surname }}</span>
        </template>

        <template #cell-roles="{ row }">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="role in row.roles"
              :key="role.id"
              class="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
            >
              {{ roleLabel(role.name) }}
            </span>
          </div>
        </template>

        <template #cell-status="{ row }">
          <UiStatusBadge v-if="row.status" :status="row.status.name" />
        </template>

        <template #cell-created_at="{ row }">
          {{ formatDate(row.created_at) }}
        </template>

        <template #row-actions="{ row }">
          <div class="flex items-center gap-2">
            <button
              class="text-blue-600 hover:text-blue-800 text-sm"
              title="Upraviť"
              :disabled="isSuperAdmin(row)"
              :class="{ 'opacity-30 cursor-not-allowed': isSuperAdmin(row) }"
              @click="!isSuperAdmin(row) && openEditModal(row)"
            >
              <Pencil class="w-4 h-4" />
            </button>

            <button
              v-if="!isSuperAdmin(row)"
              class="text-gray-400 hover:text-danger-500 text-sm"
              title="GDPR anonymizácia"
              @click="openAnonymizeModal(row)"
            >
              <UserX class="w-4 h-4" />
            </button>
          </div>
        </template>
      </UiDataTable>

      <div
        v-if="pagination.totalPages > 1"
        class="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50"
      >
        <span class="text-sm text-gray-500">
          Celkovo: {{ pagination.total }} používateľov
        </span>

        <UiPagination
          :current-page="pagination.currentPage"
          :total-pages="pagination.totalPages"
          @update:current-page="onPageChange"
        />
      </div>
    </div>

    <AdminUserEditModal
      v-model="showEditModal"
      :user="selectedUser"
      :roles="allRoles"
      :statuses="allStatuses"
      @saved="fetchUsers"
    />

    <AdminGdprAnonymizeModal
      v-model="showAnonymizeModal"
      :user="selectedUser"
      @anonymized="fetchUsers"
    />
  </div>
</template>

<script setup lang="ts">
import { Pencil, UserX, Plus, X } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
  roles: ['nti_admin', 'nti_superadmin'],
})

useHead({ title: 'Používatelia — Admin | NTI' })

const api = useApi()
const { addToast } = useToast()

const allRoles = ref<any[]>([])
const allStatuses = ref<any[]>([])

const roleOptions = computed(() => [
  { value: '', label: 'Všetky role' },
  ...allRoles.value.map(r => ({
    value: r.name,
    label: r.display_name ?? r.name,
  })),
])

const statusOptions = computed(() => [
  { value: '', label: 'Všetky stavy' },
  ...allStatuses.value.map(s => ({
    value: String(s.id),
    label: s.name,
  })),
])

async function fetchMeta() {
  const [rolesRes, statusesRes] = await Promise.all([
    api.get('/roles') as Promise<any>,
    api.get('/statuses') as Promise<any>,
  ])

  allRoles.value = rolesRes?.roles ?? []
  allStatuses.value = statusesRes?.statuses ?? []
}

function roleLabel(name: string): string {
  return allRoles.value.find(r => r.name === name)?.display_name ?? name
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const search = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const sortBy = ref<string | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const hasActiveFilters = computed(() =>
  !!search.value ||
  !!roleFilter.value ||
  !!statusFilter.value
)

function resetFilters() {
  search.value = ''
  roleFilter.value = ''
  statusFilter.value = ''

  pagination.value.currentPage = 1

  fetchUsers()
}

function isSuperAdmin(row: any): boolean {
  return row.roles?.some((r: any) => r.name === 'nti_superadmin')
}

const columns = [
  { key: 'name', label: 'Meno', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'roles', label: 'Role' },
  { key: 'status', label: 'Stav' },
  { key: 'created_at', label: 'Registrácia', sortable: true },
]

const isLoading = ref(false)
const rows = ref<any[]>([])

const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  total: 0,
  perPage: 15,
})

const currentRows = computed(() => {
  if (!sortBy.value) return rows.value

  return [...rows.value].sort((a, b) => {
    const av = a[sortBy.value!] ?? ''
    const bv = b[sortBy.value!] ?? ''

    const cmp = String(av).localeCompare(String(bv), 'sk', {
      numeric: true,
      sensitivity: 'base',
    })

    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

async function fetchUsers() {
  isLoading.value = true

  try {
    const params: Record<string, any> = {
      page: pagination.value.currentPage,
      per_page: pagination.value.perPage,
    }

    if (search.value) params.search = search.value
    if (roleFilter.value) params.role = roleFilter.value
    if (statusFilter.value) params.status = statusFilter.value

    const response = await api.get('/users', { params }) as any

    rows.value = response?.data ?? []
    pagination.value.total = response?.total ?? 0
    pagination.value.currentPage = response?.current_page ?? 1
    pagination.value.totalPages = response?.last_page ?? 1
  } finally {
    isLoading.value = false
  }
}

function onPageChange(page: number) {
  pagination.value.currentPage = page
  fetchUsers()
}

function onFilterChange() {
  pagination.value.currentPage = 1
  fetchUsers()
}

function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)

  searchTimeout = setTimeout(() => {
    pagination.value.currentPage = 1
    fetchUsers()
  }, 400)
}

onMounted(async () => {
  await fetchMeta()
  fetchUsers()
})

const showEditModal = ref(false)
const showAnonymizeModal = ref(false)
const selectedUser = ref<any>(null)

function openCreateModal() {
  selectedUser.value = null
  showEditModal.value = true
}

async function openEditModal(row: any) {
  try {
    isLoading.value = true
    selectedUser.value = await api.get(`/users/${row.id}`)
    showEditModal.value = true
  } catch {
    addToast({
      message: 'Nepodarilo sa načítať používateľa',
      type: 'error',
    })
  } finally {
    isLoading.value = false
  }
}

function openAnonymizeModal(row: any) {
  selectedUser.value = row
  showAnonymizeModal.value = true
}
</script>