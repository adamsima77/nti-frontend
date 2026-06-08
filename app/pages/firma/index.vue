<!-- pages/firma/index.vue -->
<template>
  <div class="max-w-7xl mx-auto px-6 py-10">

    <!-- MEMBER VIEW -->
    <template v-if="orgDashboard.isMember.value">
      <div class="mb-10">
        <h1 class="text-3xl font-bold text-navy mb-1">Vitajte, {{ userDisplayName }}!</h1>
        <p class="text-gray-500">Prehľad zadaní a priradených tímov vašej organizácie</p>
      </div>

      <div v-if="orgDashboard.isLoading.value" class="flex justify-center py-20">
        <UiLoader />
      </div>

      <template v-else>
        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white rounded-lg shadow-sm border-l-4 border-blue-600 p-5">
            <div class="text-3xl font-bold text-blue-600">{{ orgDashboard.stats.value.total_calls }}</div>
            <p class="text-sm text-gray-500 mt-1">Zadania celkom</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm border-l-4 border-green-600 p-5">
            <div class="text-3xl font-bold text-green-600">{{ orgDashboard.stats.value.active_calls }}</div>
            <p class="text-sm text-gray-500 mt-1">Aktívne</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm border-l-4 border-purple-500 p-5">
            <div class="text-3xl font-bold text-purple-600">{{ orgDashboard.stats.value.in_progress }}</div>
            <p class="text-sm text-gray-500 mt-1">V realizácii</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm border-l-4 border-gray-400 p-5">
            <div class="text-3xl font-bold text-gray-600">{{ orgDashboard.stats.value.completed }}</div>
            <p class="text-sm text-gray-500 mt-1">Uzavreté</p>
          </div>
        </div>

        <!-- Calls table -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-navy">Zadania organizácie</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 bg-gray-50">
                  <th class="text-left px-5 py-3 font-medium text-gray-500">Zadanie</th>
                  <th class="text-left px-5 py-3 font-medium text-gray-500">Typ / Program</th>
                  <th class="text-left px-5 py-3 font-medium text-gray-500">Deadline</th>
                  <th class="text-left px-5 py-3 font-medium text-gray-500">Prihlášky</th>
                  <th class="text-left px-5 py-3 font-medium text-gray-500">Priradený tím</th>
                  <th class="text-left px-5 py-3 font-medium text-gray-500">Stav</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr
                  v-for="call in orgDashboard.calls.value"
                  :key="call.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-5 py-4">
                    <p class="font-medium text-navy">{{ call.name }}</p>
                    <p v-if="call.description" class="text-xs text-gray-400 mt-0.5 line-clamp-1">{{ call.description }}</p>
                  </td>
                  <td class="px-5 py-4 text-gray-600">
                    <span>{{ call.call_type ?? '—' }}</span>
                    <span v-if="call.program" class="text-xs text-gray-400 block">{{ call.program }}</span>
                  </td>
                  <td class="px-5 py-4 text-gray-600">{{ call.application_deadline ?? '—' }}</td>
                  <td class="px-5 py-4 text-center font-medium text-navy">{{ call.applications_count }}</td>
                  <td class="px-5 py-4">
                    <span v-if="call.assigned_team" class="inline-flex items-center gap-1 text-green-700 font-medium">
                      <Users class="w-3.5 h-3.5" />
                      {{ call.assigned_team.name }}
                    </span>
                    <span v-else class="text-gray-400 text-xs">Nepriradený</span>
                  </td>
                  <td class="px-5 py-4">
                    <UiStatusBadge :status="call.status ?? ''" />
                  </td>
                </tr>
                <tr v-if="!orgDashboard.calls.value.length">
                  <td colspan="6" class="px-5 py-10 text-center text-gray-400">
                    Organizácia zatiaľ nemá žiadne zadania
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </template>

    <!-- ADMIN VIEW -->
    <template v-else>
    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-navy mb-1">Vitajte, {{ userDisplayName }}!</h1>
      <p class="text-gray-500">Prehľad vašich zadaní, tímov a rozpočtov</p>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-blue-600 p-5">
        <div class="text-3xl font-bold text-blue-600">{{ stats.totalTasks }}</div>
        <p class="text-sm text-gray-500 mt-1">Zadania</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-green-600 p-5">
        <div class="text-3xl font-bold text-success-500">{{ stats.activeTasks }}</div>
        <p class="text-sm text-gray-500 mt-1">Aktívne</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-purple-500 p-5">
        <div class="text-3xl font-bold text-purple-600">{{ stats.assignedTeams }}</div>
        <p class="text-sm text-gray-500 mt-1">Priradené tímy</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-amber-500 p-5">
        <div class="text-3xl font-bold text-warning-500">{{ stats.pendingApplications }}</div>
        <p class="text-sm text-gray-500 mt-1">Čakajúce prihlášky</p>
      </div>
    </div>

    <!-- Required actions -->
    <div
      v-if="actions.length"
      class="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-5"
    >
      <div class="flex items-center gap-2 mb-3">
        <AlertTriangle class="w-5 h-5 text-amber-600" />
        <h2 class="text-lg font-semibold text-amber-800">Vyžadované akcie</h2>
      </div>
      <ul class="space-y-2">
        <li
          v-for="action in actions"
          :key="action.id"
          class="flex items-center justify-between"
        >
          <span class="text-sm text-amber-700">{{ action.message }}</span>
          <NuxtLink
            :to="action.link"
            class="text-sm font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1"
          >
            Vyriešiť
            <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </li>
      </ul>
    </div>

    <!-- Budget overview -->
    <div class="mb-8">
      <h2 class="text-xl font-bold text-navy mb-4">Zadania</h2>
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th class="text-left px-5 py-3 font-medium text-gray-500">Zadanie</th>
                <th class="text-left px-5 py-3 font-medium text-gray-500">Program</th>
                <th class="text-left px-5 py-3 font-medium text-gray-500">Rozpočet</th>
                <th class="text-left px-5 py-3 font-medium text-gray-500">Čerpanie</th>
                <th class="text-left px-5 py-3 font-medium text-gray-500">Stav</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="task in budgetTasks"
                :key="task.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-5 py-4">
                  <p class="font-medium text-navy">{{ task.title }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">Pridané {{ task.createdAt }}</p>
                </td>
                <td class="px-5 py-4 text-gray-600">{{ task.program }}</td>
                <td class="px-5 py-4 font-medium text-navy">{{ formatCurrency(task.budget) }}</td>
                <td class="px-5 py-4">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[80px]">
                      <div
                        class="h-1.5 rounded-full transition-all"
                        :class="budgetBarColor(task.spent / task.budget)"
                        :style="{ width: `${Math.min((task.spent / task.budget) * 100, 100)}%` }"
                      />
                    </div>
                    <span class="text-xs text-gray-500 shrink-0">
                      {{ Math.round((task.spent / task.budget) * 100) }}%
                    </span>
                  </div>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ formatCurrency(task.spent) }} z {{ formatCurrency(task.budget) }}
                  </p>
                </td>
                <td class="px-5 py-4">
                  <UiStatusBadge :status="task.status" />
                </td>
              </tr>
              <tr v-if="!budgetTasks.length">
                <td colspan="5" class="px-5 py-10 text-center text-gray-400">
                  Nemáte žiadne zadania
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-end">

          <NuxtLink
            to="/firma/zadania"
            class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Všetky zadania
            <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Assigned teams & applications -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Assigned teams -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-navy">Priradené tímy</h2>
        </div>
        <div class="space-y-3">
          <div
            v-for="team in assignedTeams"
            :key="team.id"
            class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-4"
          >
            <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Users class="w-5 h-5 text-blue-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-navy truncate">{{ team.name }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ team.task }} · {{ team.members }} členov</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="teamProgressClass(team.progress)"
              >
                {{ team.progress }}%
              </span>
            </div>
          </div>
          <p
            v-if="!assignedTeams.length"
            class="text-sm text-gray-400 text-center py-6"
          >
            Zatiaľ žiadne priradené tímy
          </p>
        </div>
      </div>

      <!-- Pending applications -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-navy">Prihlášky tímov</h2>
          <NuxtLink
            to=""
            class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Zobraziť všetky
            <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </div>
        <div class="space-y-3">
          <div
            v-for="app in pendingApplications"
            :key="app.id"
            class="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
          >
            <div class="flex items-start justify-between mb-2">
              <div>
                <p class="font-medium text-navy text-sm">{{ app.teamName }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ app.task }} · Podané {{ app.submittedAt }}</p>
              </div>
              <UiStatusBadge :status="app.status" />
            </div>
            <div class="flex gap-2 mt-3">
              <NuxtLink
                to=""
                class="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
              >
                Detail
                <ChevronRight class="w-3.5 h-3.5" />
              </NuxtLink>
            </div>
          </div>
          <p
            v-if="!pendingApplications.length"
            class="text-sm text-gray-400 text-center py-6"
          >
            Žiadne čakajúce prihlášky
          </p>
        </div>
      </div>
    </div>

    <!-- Upcoming deadlines -->
    <div>
      <h2 class="text-xl font-bold text-navy mb-4">Blížiace sa termíny</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="d in upcomingDeadlines"
          :key="d.id"
          class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center gap-4"
        >
          <div class="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Calendar class="w-6 h-6 text-blue-600" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-navy truncate">{{ d.title }}</p>
            <p class="text-sm text-gray-500">{{ d.deadline }}</p>
          </div>
          <div class="text-right flex-shrink-0">
            <span class="text-2xl font-bold text-blue-600">{{ d.daysLeft }}</span>
            <p class="text-xs text-gray-500">dní zostáva</p>
          </div>
        </div>
      </div>
    </div>
    </template><!-- end ADMIN VIEW -->

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Users, Calendar, AlertTriangle, ChevronRight } from 'lucide-vue-next'
import { normalizeTaskStatus } from '~/composables/useTaskStatus'
import { useOrgDashboard } from '~/composables/useOrgDashboard'

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['partner'],
})

useHead({
  title: 'Dashboard | NTI Firma',
})

const authStore = useAuthStore()
const api = useApi()

const orgDashboard = useOrgDashboard()

const userDisplayName = computed(() => {
  const u = authStore.user
  if (!u) return 'Organizácia'
  return u.organization_name || u.email || 'Organizácia'
})

const tasks = ref<any[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const stats = computed(() => ({
  totalTasks: tasks.value.length,
  activeTasks: tasks.value.filter((task) => task.isOpen).length,
  assignedTeams: tasks.value.filter((task) => task.applicationsCount > 0).length,
  pendingApplications: tasks.value.reduce((sum, task) => sum + (task.applicationsCount ?? 0), 0),
}))

const assignedTeams = computed(() =>
  tasks.value
    .filter((task) => task.applicationsCount > 0)
    .map((task) => ({
      id: task.id,
      name: task.program || 'Zadanie',
      task: task.title || task.name || 'Zadanie',
      members: task.applicationsCount,
      progress: Math.min(100, (task.applicationsCount ?? 0) * 20),
    }))
)

const pendingApplications = computed(() =>
  tasks.value
    .filter((task) => task.applicationsCount > 0)
    .slice(0, 4)
    .map((task) => ({
      id: task.id,
      teamName: task.program || 'Tím',
      task: task.title || task.name || 'Zadanie',
      submittedAt: task.createdAt || task.created_at || 'dnes',
      status: task.status || 'published',
    }))
)

const actions = computed(() => {
  if (!tasks.value.length) {
    return [
      {
        id: 'create-task',
        message: 'Nemáte ešte žiadne zverejnené zadania. Vytvorte prvé zadanie pre váš tím.',
        link: '/firma/zadania/nove',
      },
    ]
  }

  return []
})

const budgetTasks = computed(() => tasks.value.slice(0, 3))
const upcomingDeadlines = computed(() =>
  tasks.value
    .filter((task) => task.deadline)
    .sort((a, b) => (a.deadline > b.deadline ? 1 : -1))
    .slice(0, 4)
)

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)

const budgetBarColor = (ratio: number) => {
  if (ratio >= 1) return 'bg-danger-500'
  if (ratio >= 0.8) return 'bg-warning-500'
  return 'bg-blue-500'
}

const loadTasks = async () => {
  isLoading.value = true
  error.value = null

  try {
    await authStore.getCurrentUser()
    if (!authStore.userOrganizationId) {
      tasks.value = []
      return
    }

    const response = await api.get('/v1/admin/calls', { params: { per_page: 100 } }) as any
    const items = Array.isArray(response?.data) ? response.data : []
    tasks.value = items.map((call: any) => ({
      id: call.id,
      title: call.name,
      program: call.program?.name ?? 'Program',
      description: call.description ?? '',
      createdAt: call.created_at ? call.created_at.slice(0, 10) : (call.application_start ? call.application_start.slice(0, 10) : ''),
      deadline: call.application_deadline ? call.application_deadline.slice(0, 10) : null,
      status: normalizeTaskStatus(call.status?.name ?? ''),
      statusLabel: call.status?.name ?? '',
      applicationsCount: Number(call.applicants_count ?? 0),
      isOpen: Boolean(call.is_open),
      budget: Number(call.budget ?? 0),
      spent: Number(call.spent ?? 0),
    }))
  } catch (err: any) {
    error.value = err?.data?.message ?? err?.message ?? 'Nastala chyba pri načítaní zadaní.'
    tasks.value = []
  } finally {
    isLoading.value = false
  }
}

const router = useRouter()

onMounted(async () => {
  await orgDashboard.load()
  if (orgDashboard.isPo.value) {
    router.replace('/firma/po')
    return
  }
  if (orgDashboard.isAdmin.value) {
    await loadTasks()
  }
})

const filters = computed(() => [
  { label: 'Všetky', value: 'all', count: tasks.value.length },
  { label: 'Otvorené', value: 'active', count: tasks.value.filter((task) => task.isOpen).length },
  { label: 'Dokončené', value: 'closed', count: tasks.value.filter((task) => task.status === 'closed').length },
  { label: 'Drafty', value: 'draft', count: tasks.value.filter((task) => task.status === 'draft').length },
])

const activeFilter = ref('all')

const filteredTasks = computed(() => {
  if (activeFilter.value === 'all') return tasks.value
  if (activeFilter.value === 'active') return tasks.value.filter((task) => task.isOpen)
  return tasks.value.filter((task) => task.status === activeFilter.value)
})

const totalBudget = computed(() => tasks.value.reduce((sum, task) => sum + (task.budget ?? 0), 0))
const totalSpent = computed(() => tasks.value.reduce((sum, task) => sum + (task.spent ?? 0), 0))

const teamProgressClass = (progress: number) => {
  if (progress >= 80) return 'bg-success-50 text-success-500'
  if (progress >= 40) return 'bg-blue-50 text-blue-600'
  return 'bg-gray-100 text-gray-500'
}
</script>
