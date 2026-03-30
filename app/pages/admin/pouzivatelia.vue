<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-navy">Pouzivatelia</h1>
      <p class="text-gray-500 mt-1">Sprava registrovanych pouzivatelov a ich roli</p>
    </div>

    <div class="bg-white rounded-lg border border-gray-200">
      <UiDataTable
        :columns="columns"
        :rows="filteredUsers"
      >
        <template #header>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border-b border-gray-100">
            <UiInput
              v-model="search"
              placeholder="Hladat podla mena alebo emailu..."
            />
            <UiSelect
              v-model="roleFilter"
              :options="roleOptions"
              placeholder="Vsetky role"
            />
          </div>
        </template>

        <template #cell-role="{ value }">
          <span class="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
            {{ value }}
          </span>
        </template>

        <template #row-actions>
          <div class="flex items-center gap-2">
            <button class="text-blue-600 hover:text-blue-800 text-sm">
              <Eye class="w-4 h-4" />
            </button>
            <button class="text-gray-400 hover:text-gray-600 text-sm">
              <Pencil class="w-4 h-4" />
            </button>
          </div>
        </template>
      </UiDataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Eye, Pencil } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  // middleware: ['auth'], // TODO: re-enable when backend is available
})

useHead({ title: 'Pouzivatelia — Admin | NTI' })

const search = ref('')
const roleFilter = ref('')

const columns = [
  { key: 'name', label: 'Meno', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Rola', sortable: true },
  { key: 'registered', label: 'Registracia', sortable: true },
]

const roleOptions = [
  { value: '', label: 'Vsetky role' },
  { value: 'student', label: 'Student' },
  { value: 'team_lead', label: 'Team lead' },
  { value: 'company', label: 'Firma' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'evaluator', label: 'Hodnotitel' },
  { value: 'content_editor', label: 'Editor obsahu' },
  { value: 'nti_admin', label: 'NTI Admin' },
  { value: 'super_admin', label: 'Super Admin' },
]

const users = ref([
  { id: 1, name: 'Jan Novak', email: 'jan.novak@ukf.sk', role: 'student', registered: '12.01.2026' },
  { id: 2, name: 'Maria Horvathova', email: 'maria.h@ukf.sk', role: 'student', registered: '15.01.2026' },
  { id: 3, name: 'Peter Kral', email: 'peter.kral@ukf.sk', role: 'team_lead', registered: '20.01.2026' },
  { id: 4, name: 'Eva Svobodova', email: 'eva.s@firma.sk', role: 'company', registered: '01.02.2026' },
  { id: 5, name: 'Tomas Benes', email: 'tomas.b@ukf.sk', role: 'mentor', registered: '05.02.2026' },
  { id: 6, name: 'Lucia Nemcova', email: 'lucia.n@ukf.sk', role: 'evaluator', registered: '10.02.2026' },
  { id: 7, name: 'Marek Dvorak', email: 'marek.d@nti.sk', role: 'nti_admin', registered: '01.01.2026' },
  { id: 8, name: 'Admin System', email: 'admin@nti.sk', role: 'super_admin', registered: '01.01.2026' },
])

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
</script>
