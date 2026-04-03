<!-- pages/firma/index.vue -->
<template>
  <div class="max-w-7xl mx-auto px-6 py-10">

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
      v-if="mockActions.length"
      class="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-5"
    >
      <div class="flex items-center gap-2 mb-3">
        <AlertTriangle class="w-5 h-5 text-amber-600" />
        <h2 class="text-lg font-semibold text-amber-800">Vyžadované akcie</h2>
      </div>
      <ul class="space-y-2">
        <li
          v-for="action in mockActions"
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
      <h2 class="text-xl font-bold text-navy mb-4">Rozpočty zadaní</h2>
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
                v-for="task in mockTasks"
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
                  <p class="text-xs text-gray-400 mt-1">{{ formatCurrency(task.spent) }} z {{ formatCurrency(task.budget) }}</p>
                </td>
                <td class="px-5 py-4">
                  <UiStatusBadge :status="task.status" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span class="text-sm text-gray-500">
            Celkový rozpočet: <span class="font-semibold text-navy">{{ formatCurrency(totalBudget) }}</span>
            · Čerpanie: <span class="font-semibold text-navy">{{ formatCurrency(totalSpent) }}</span>
          </span>
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
            v-for="team in mockAssignedTeams"
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
          <p v-if="!mockAssignedTeams.length" class="text-sm text-gray-400 text-center py-6">
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
            v-for="app in mockPendingApplications"
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
          <p v-if="!mockPendingApplications.length" class="text-sm text-gray-400 text-center py-6">
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
          v-for="d in mockDeadlines"
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

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Users, Calendar, AlertTriangle, ChevronRight } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  //middleware: 'auth',
  roles: ['company'],
})

useHead({
  title: 'Dashboard | NTI Firma',
})

const authStore = useAuthStore()

// TODO: remove when backend is available
if (!authStore.user) {
  authStore.user = {
    id: 2,
    email: 'info@techfirma.sk',
    organization_name: 'TechFirma s.r.o.',
    role: 'company',
  }
  authStore.token = 'mock-token'
}

const userDisplayName = computed(() => {
  const u = authStore.user
  if (!u) return 'Organizácia'
  return u.organization_name || u.first_name || u.email || 'Organizácia'
})

// ── Mock data ──────────────────────────────────────────────

const mockTasks = [
  {
    id: 1,
    title: 'AI chatbot pre zákaznícku podporu',
    program: 'Program A',
    budget: 8000,
    spent: 3200,
    status: 'active',
    createdAt: '10.01.2026',
  },
  {
    id: 2,
    title: 'Optimalizácia logistického softvéru',
    program: 'Program B',
    budget: 12000,
    spent: 9800,
    status: 'active',
    createdAt: '15.01.2026',
  },
  {
    id: 3,
    title: 'Mobilná aplikácia pre HR',
    program: 'Program A',
    budget: 6000,
    spent: 6000,
    status: 'completed',
    createdAt: '05.11.2025',
  },
  {
    id: 4,
    title: 'Dashboard pre analýzu predajov',
    program: 'Program B',
    budget: 5000,
    spent: 0,
    status: 'draft',
    createdAt: '28.03.2026',
  },
]

const mockAssignedTeams = [
  { id: 1, name: 'AI Innovators', task: 'AI chatbot pre zákaznícku podporu', members: 3, progress: 40 },
  { id: 2, name: 'LogiTech tím', task: 'Optimalizácia logistického softvéru', members: 4, progress: 82 },
]

const mockPendingApplications = [
  { id: 11, teamName: 'DataFlow tím', task: 'Dashboard pre analýzu predajov', submittedAt: '30.03.2026', status: 'submitted' },
  { id: 12, teamName: 'CodeCraft', task: 'Dashboard pre analýzu predajov', submittedAt: '01.04.2026', status: 'submitted' },
]

const mockDeadlines = [
  { id: 1, title: 'Uzávierka zadaní — Program A', deadline: '2026-04-20', daysLeft: 18 },
  { id: 2, title: 'Výber tímov — Program B', deadline: '2026-05-05', daysLeft: 33 },
]

const mockActions = [
  { id: 1, message: 'Vyhodnoťte prihlášky tímov na zadanie "Dashboard pre analýzu predajov"', link: '' },
  { id: 2, message: 'Doplňte rozpočet k zadaniu "Dashboard pre analýzu predajov"', link: '/firma/zadania/4' },
]

// ── Computed ───────────────────────────────────────────────

const stats = computed(() => ({
  totalTasks: mockTasks.length,
  activeTasks: mockTasks.filter(t => t.status === 'active').length,
  assignedTeams: mockAssignedTeams.length,
  pendingApplications: mockPendingApplications.length,
}))

const totalBudget = computed(() => mockTasks.reduce((s, t) => s + t.budget, 0))
const totalSpent = computed(() => mockTasks.reduce((s, t) => s + t.spent, 0))

// ── Helpers ────────────────────────────────────────────────

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)

const budgetBarColor = (ratio: number) => {
  if (ratio >= 1) return 'bg-danger-500'
  if (ratio >= 0.8) return 'bg-warning-500'
  return 'bg-blue-500'
}

const teamProgressClass = (progress: number) => {
  if (progress >= 80) return 'bg-success-50 text-success-500'
  if (progress >= 40) return 'bg-blue-50 text-blue-600'
  return 'bg-gray-100 text-gray-500'
}
</script>