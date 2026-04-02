<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-navy">Používatelia</h1>
      <p class="text-gray-500 mt-1">Správa registrovaných používateľov a ich rolí</p>
    </div>

    <div class="bg-white rounded-lg border border-gray-200">
      <UiDataTable
        :columns="columns"
        :rows="filteredUsers"
        :loading="isLoading"
      >
        <template #header>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border-b border-gray-100">
            <UiInput
              v-model="search"
              placeholder="Hľadať podľa mena alebo emailu..."
            />
            <UiSelect
              v-model="roleFilter"
              :options="roleOptions"
              placeholder="Všetky role"
            />
          </div>
        </template>

        <template #cell-role="{ value }">
          <span class="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
            {{ value }}
          </span>
        </template>

        <template #cell-name="{ row, value }">
          <span :class="{ 'line-through text-gray-400': row.is_anonymized }">
            {{ value }}
          </span>
          <span
            v-if="row.is_anonymized"
            class="ml-2 inline-block px-1.5 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-500"
          >
            anonymizovaný
          </span>
        </template>

        <template #row-actions="{ row }">
          <div class="flex items-center gap-2">
            <button
              class="text-blue-600 hover:text-blue-800 text-sm"
              title="Zobraziť"
            >
              <Eye class="w-4 h-4" />
            </button>
            <button
              class="text-gray-400 hover:text-gray-600 text-sm"
              title="Upraviť"
            >
              <Pencil class="w-4 h-4" />
            </button>
            <button
              class="text-blue-600 hover:text-blue-800 text-sm"
              title="GDPR export"
              :disabled="row.is_anonymized"
              @click="handleGdprExport(row)"
            >
              <Download class="w-4 h-4" />
            </button>
            <button
              class="text-gray-400 hover:text-danger-500 text-sm"
              title="GDPR anonymizácia"
              :disabled="row.is_anonymized"
              @click="openAnonymizeModal(row)"
            >
              <UserX class="w-4 h-4" />
            </button>
          </div>
        </template>
      </UiDataTable>
    </div>

    <AdminGdprAnonymizeModal
      v-model="showAnonymizeModal"
      :user="selectedUser"
      @anonymized="fetchUsers"
    />
  </div>
</template>

<script setup lang="ts">
import { Eye, Pencil, Download, UserX } from 'lucide-vue-next'
import type { AdminUser } from '~/types/admin'

definePageMeta({
  layout: 'admin',
  // middleware: ['auth'],
})

useHead({ title: 'Používatelia — Admin | NTI' })

const api = useApi()
const { addToast } = useToast()

const search = ref('')
const roleFilter = ref('')
const isLoading = ref(false)

const columns = [
  { key: 'name', label: 'Meno', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Rola', sortable: true },
  { key: 'registered', label: 'Registrácia', sortable: true },
]

const roleOptions = [
  { value: '', label: 'Všetky role' },
  { value: 'student', label: 'Študent' },
  { value: 'team_lead', label: 'Team lead' },
  { value: 'company', label: 'Firma' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'evaluator', label: 'Hodnotiteľ' },
  { value: 'content_editor', label: 'Editor obsahu' },
  { value: 'nti_admin', label: 'NTI Admin' },
  { value: 'super_admin', label: 'Super Admin' },
]

const mockUsers: AdminUser[] = [
  { id: 1, name: 'Ján Novák', email: 'jan.novak@ukf.sk', role: 'student', registered: '12.01.2026' },
  { id: 2, name: 'Mária Horváthová', email: 'maria.h@ukf.sk', role: 'student', registered: '15.01.2026' },
  { id: 3, name: 'Peter Kráľ', email: 'peter.kral@ukf.sk', role: 'team_lead', registered: '20.01.2026' },
  { id: 4, name: 'Eva Svobodová', email: 'eva.s@firma.sk', role: 'company', registered: '01.02.2026' },
  { id: 5, name: 'Tomáš Beneš', email: 'tomas.b@ukf.sk', role: 'mentor', registered: '05.02.2026' },
  { id: 6, name: 'Lucia Nemcová', email: 'lucia.n@ukf.sk', role: 'evaluator', registered: '10.02.2026' },
  { id: 7, name: 'Marek Dvořák', email: 'marek.d@nti.sk', role: 'nti_admin', registered: '01.01.2026' },
  { id: 8, name: 'Admin Systém', email: 'admin@nti.sk', role: 'super_admin', registered: '01.01.2026' },
  {
    id: 9,
    name: 'Anonymizovaný používateľ',
    email: 'anon-9@removed.local',
    role: 'student',
    registered: '05.11.2025',
    is_anonymized: true,
  },
]

const users = ref<AdminUser[]>([...mockUsers])

const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    const matchSearch =
      !search.value ||
      u.name.toLowerCase().includes(search.value.toLowerCase()) ||
      u.email.toLowerCase().includes(search.value.toLowerCase())
    const matchRole = !roleFilter.value || u.role === roleFilter.value
    return matchSearch && matchRole
  })
})

async function fetchUsers() {
  isLoading.value = true
  try {
    const response = await api.get('/v1/admin/users')
    users.value = response.data || response || []
  } catch {
    // Keep existing data
  } finally {
    isLoading.value = false
  }
}

onMounted(() => fetchUsers())

// GDPR
const showAnonymizeModal = ref(false)
const selectedUser = ref<AdminUser | null>(null)

function openAnonymizeModal(user: AdminUser) {
  selectedUser.value = user
  showAnonymizeModal.value = true
}

async function handleGdprExport(user: AdminUser) {
  addToast({ message: `Generujem GDPR export pre ${user.name}...`, type: 'info' })
  try {
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase || 'http://localhost:8000/api'
    const authStore = useAuthStore()
    const response = await fetch(`${apiBase}/v1/admin/users/${user.id}/gdpr-export`, {
      method: 'POST',
      headers: {
        ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
      },
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Export failed')

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gdpr-export-${user.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    addToast({ message: 'GDPR export bol stiahnutý', type: 'success' })
  } catch {
    addToast({ message: 'Nepodarilo sa vygenerovať GDPR export', type: 'error' })
  }
}
</script>
