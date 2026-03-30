<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-navy">Audit log</h1>
      <p class="text-gray-500 mt-1">Historia systemovych udalosti a zmien</p>
    </div>

    <div class="bg-white rounded-lg border border-gray-200">
      <UiDataTable
        :columns="columns"
        :rows="filteredLogs"
      >
        <template #header>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border-b border-gray-100">
            <UiInput
              v-model="search"
              placeholder="Hladat podla pouzivatela alebo detailu..."
            />
            <UiSelect
              v-model="actionFilter"
              :options="actionOptions"
              placeholder="Vsetky akcie"
            />
          </div>
        </template>

        <template #cell-action="{ value }">
          <span :class="['inline-block px-2 py-0.5 rounded text-xs font-medium', actionColor(value)]">
            {{ value }}
          </span>
        </template>
      </UiDataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  // middleware: ['auth'], // TODO: re-enable when backend is available
})

useHead({ title: 'Audit log — Admin | NTI' })

const search = ref('')
const actionFilter = ref('')

const columns = [
  { key: 'time', label: 'Cas', sortable: true },
  { key: 'user', label: 'Pouzivatel', sortable: true },
  { key: 'action', label: 'Akcia', sortable: true },
  { key: 'detail', label: 'Detail' },
]

const actionOptions = [
  { value: '', label: 'Vsetky akcie' },
  { value: 'login', label: 'Prihlasenie' },
  { value: 'create', label: 'Vytvorenie' },
  { value: 'update', label: 'Uprava' },
  { value: 'delete', label: 'Vymazanie' },
  { value: 'status_change', label: 'Zmena stavu' },
]

const logs = ref([
  {
    id: 1,
    time: '30.03.2026 14:22',
    user: 'admin@nti.sk',
    action: 'login',
    detail: 'Uspesne prihlasenie z IP 192.168.1.10',
  },
  {
    id: 2,
    time: '30.03.2026 13:45',
    user: 'marek.d@nti.sk',
    action: 'status_change',
    detail: 'Prihlaska APP-003 zmenena na "schvalene"',
  },
  {
    id: 3,
    time: '30.03.2026 12:30',
    user: 'lucia.n@ukf.sk',
    action: 'create',
    detail: 'Nove hodnotenie pre prihlasku APP-002',
  },
  {
    id: 4,
    time: '30.03.2026 11:15',
    user: 'marek.d@nti.sk',
    action: 'update',
    detail: 'Vyzva "Jarny inkubator 2026" — uprava popisu',
  },
  {
    id: 5,
    time: '29.03.2026 16:00',
    user: 'jan.novak@ukf.sk',
    action: 'create',
    detail: 'Nova prihlaska APP-001 na vyzvu Jarny inkubator',
  },
  {
    id: 6,
    time: '29.03.2026 14:30',
    user: 'eva.s@firma.sk',
    action: 'login',
    detail: 'Uspesne prihlasenie z IP 10.0.0.5',
  },
  {
    id: 7,
    time: '29.03.2026 10:00',
    user: 'marek.d@nti.sk',
    action: 'create',
    detail: 'Nova vyzva "Letny sprint — mobilna appka"',
  },
  {
    id: 8,
    time: '28.03.2026 15:45',
    user: 'admin@nti.sk',
    action: 'update',
    detail: 'Sablona emailu "Uvitaci email" upravena',
  },
  {
    id: 9,
    time: '28.03.2026 09:20',
    user: 'tomas.b@ukf.sk',
    action: 'login',
    detail: 'Uspesne prihlasenie z IP 172.16.0.3',
  },
  {
    id: 10,
    time: '27.03.2026 17:00',
    user: 'marek.d@nti.sk',
    action: 'delete',
    detail: 'Vyzva "Testovacia vyzva" vymazana',
  },
])

const filteredLogs = computed(() => {
  return logs.value.filter((l) => {
    const matchSearch =
      !search.value ||
      l.user.toLowerCase().includes(search.value.toLowerCase()) ||
      l.detail.toLowerCase().includes(search.value.toLowerCase())
    const matchAction = !actionFilter.value || l.action === actionFilter.value
    return matchSearch && matchAction
  })
})

function actionColor(action: string) {
  const colors: Record<string, string> = {
    login: 'bg-blue-50 text-blue-700',
    create: 'bg-green-50 text-green-700',
    update: 'bg-yellow-50 text-yellow-700',
    delete: 'bg-red-50 text-red-700',
    status_change: 'bg-purple-50 text-purple-700',
  }
  return colors[action] ?? 'bg-gray-50 text-gray-700'
}
</script>
