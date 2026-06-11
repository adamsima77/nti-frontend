<!-- pages/firma/index.vue -->
<template>
  <div class="max-w-7xl mx-auto px-6 py-10">

    <!-- Loading -->
    <div v-if="orgDashboard.myRole.value === null" class="flex justify-center py-20">
      <UiLoader />
    </div>

    <!-- MEMBER VIEW -->
    <template v-else-if="orgDashboard.isMember.value">
      <div class="mb-10 bg-white rounded-xl border-l-4 border-gray-500 px-6 py-5 shadow-sm">
        <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full mb-3">
          <span class="w-1.5 h-1.5 rounded-full bg-gray-400" />
          Člen organizácie
        </span>
        <h1 class="text-3xl font-bold text-navy mb-1">Vitajte, {{ userDisplayName }}!</h1>
        <p class="text-gray-500 text-sm">Aktuálny prehľad projektov.</p>
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

        <!-- Priradené tímy -->
        <div class="mt-8">
          <h2 class="text-lg font-bold text-navy mb-4">Priradené tímy</h2>
          <div v-if="orgDashboard.teams.value.length" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="(t, i) in orgDashboard.teams.value"
              :key="i"
              class="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-3"
            >
              <div class="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Users class="w-4 h-4 text-green-600" />
              </div>
              <div class="min-w-0">
                <p class="font-medium text-navy truncate">{{ t.team_name }}</p>
                <p class="text-xs text-gray-400 truncate">{{ t.call_name }}</p>
              </div>
              <span class="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 shrink-0">{{ t.status }}</span>
            </div>
          </div>
          <div v-else class="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-5 text-center text-sm text-gray-400">
            Zatiaľ nebol priradený žiadny tím
          </div>
        </div>

        <!-- Prihlášky -->
        <div class="mt-8">
          <h2 class="text-lg font-bold text-navy mb-4">Posledné prihlášky</h2>
          <div v-if="orgDashboard.applications.value.length" class="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 bg-gray-50">
                  <th class="text-left px-5 py-3 font-medium text-gray-500">Tím</th>
                  <th class="text-left px-5 py-3 font-medium text-gray-500">Zadanie</th>
                  <th class="text-left px-5 py-3 font-medium text-gray-500">Stav</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="(app, i) in orgDashboard.applications.value" :key="i" class="hover:bg-gray-50 transition-colors">
                  <td class="px-5 py-3 font-medium text-navy">{{ app.team_name }}</td>
                  <td class="px-5 py-3 text-gray-500 text-xs">{{ app.call_name }}</td>
                  <td class="px-5 py-3">
                    <UiStatusBadge :status="app.status ?? ''" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-5 text-center text-sm text-gray-400">
            Zatiaľ neboli podané žiadne prihlášky
          </div>
        </div>

      </template>
    </template>

    <!-- ADMIN VIEW -->
    <template v-else>
    <!-- Header -->
    <div class="mb-10 bg-white rounded-xl border-l-4 border-gray-500 px-6 py-5 shadow-sm">
      <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full mb-3">
        <span class="w-1.5 h-1.5 rounded-full bg-gray-400" />
        Administrátor organizácie
      </span>
      <h1 class="text-3xl font-bold text-navy mb-1">Vitajte, {{ userDisplayName }}!</h1>
      <p class="text-gray-500 text-sm">Centrálny manažment firemného portfólia, zadaní a rozpočtov.</p>
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
        <p class="text-sm text-gray-500 mt-1">Prihlášky</p>
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
                  <UiStatusBadge :status="task.statusLabel" />
                </td>
              </tr>
              <tr v-if="!budgetTasks.length">
                <td colspan="4" class="px-5 py-10 text-center text-gray-400">
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

    <!-- Assigned teams -->
    <div class="mb-8">
      <h2 class="text-xl font-bold text-navy mb-4">Priradené tímy</h2>
      <div v-if="assignedTeams.length" :class="['grid gap-4', gridClass(assignedTeams.length)]">
        <div
          v-for="team in assignedTeams"
          :key="team.id"
          class="bg-white rounded-lg shadow-sm border border-gray-100 px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
        >
          <div class="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Users class="w-4 h-4 text-blue-600" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-navy text-sm">{{ team.name }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ team.task }} · {{ team.members }} členov</p>
          </div>
        </div>
      </div>
      <p v-else class="text-sm text-gray-400 text-center py-6 bg-white rounded-lg border border-gray-100">
        Zatiaľ žiadne priradené tímy
      </p>
    </div>

    <!-- Recent applications -->
    <div class="mb-8">
      <h2 class="text-xl font-bold text-navy mb-4">Posledné prihlášky</h2>
      <div v-if="pendingApplications.length" :class="['grid gap-4', gridClass(pendingApplications.length)]">
        <div
          v-for="app in pendingApplications"
          :key="app.id"
          class="bg-white rounded-lg shadow-sm border border-gray-100 px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
        >
          <div class="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Users class="w-4 h-4 text-blue-600" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-navy text-sm">{{ app.teamName }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ app.task }} · Podané {{ app.submittedAt }}</p>
          </div>
          <UiStatusBadge :status="app.status" />
        </div>
      </div>
      <p v-else class="text-sm text-gray-400 text-center py-6 bg-white rounded-lg border border-gray-100">
        Zatiaľ žiadne prihlášky
      </p>
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
            <p class="text-sm text-gray-500">{{ d.deadline ? d.deadline.split('-').reverse().join('. ') : '' }}</p>
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
  title: 'Firemný Dashboard | NTI',
})

const authStore = useAuthStore()
const api = useApi()

const orgDashboard = useOrgDashboard()

const userDisplayName = computed(() => {
  const u = authStore.user
  if (!u) return ''
  // člen vidí svoje meno, admin vidí názov firmy
  if (orgDashboard.isMember.value) {
    return [u.name, u.surname].filter(Boolean).join(' ') || u.email || ''
  }
  return u.organization_name || u.email || ''
})

const tasks = ref<any[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const stats = computed(() => ({
  totalTasks: tasks.value.length,
  activeTasks: tasks.value.filter((task) => ['published', 'matching', 'assigned', 'in_progress'].includes(task.status)).length,
  assignedTeams: tasks.value.filter((task) => task.assignedTeam).length,
  pendingApplications: tasks.value.reduce((sum, task) => sum + (task.applicationsCount ?? 0), 0),
}))

const assignedTeams = computed(() =>
  tasks.value
    .filter((task) => task.assignedTeam)
    .map((task) => ({
      id: task.id,
      name: task.assignedTeam?.name || 'Tím',
      task: task.title || 'Zadanie',
      members: task.assignedTeam?.members_count ?? 0,
      progress: Math.min(100, (task.assignedTeam?.members_count ?? 0) * 20),
    }))
)

const gridClass = (count: number) => {
  if (count === 1) return 'grid-cols-1'
  if (count === 2 || count === 4) return 'grid-cols-2'
  return 'grid-cols-3'
}

const pendingApplications = computed(() =>
  tasks.value
    .flatMap((task) => task.applications ?? [])
    .slice(0, 4)
)

const actions = computed(() => {
  if (!tasks.value.length) {
    return [
      {
        id: 'create-task',
        message: 'Nemáte ešte žiadne zverejnené zadania. Vytvorte vaše prvé zadanie.',
        link: '/firma/zadania/nove',
      },
    ]
  }

  return []
})

const budgetTasks = computed(() => tasks.value.slice(0, 3))
const upcomingDeadlines = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return tasks.value
    .filter((task) => task.deadline && task.deadline >= today)
    .sort((a, b) => (a.deadline > b.deadline ? 1 : -1))
    .slice(0, 4)
    .map((task) => ({
      ...task,
      daysLeft: Math.ceil((new Date(task.deadline).getTime() - new Date(today).getTime()) / 86_400_000),
    }))
})

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
      assignedTeam: call.assigned_team ?? null,
      isOpen: Boolean(call.is_open),
      budget: Number(call.budget ?? 0),
      spent: Number(call.spent ?? 0),
      applications: (call.applications ?? []).map((a: any) => ({
        id: a.id,
        teamName: a.teamName ?? a.team?.name ?? '—',
        submittedAt: a.submittedAt ?? a.submitted_at,
        status: a.status ?? '',
        task: call.name,
      })),
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
