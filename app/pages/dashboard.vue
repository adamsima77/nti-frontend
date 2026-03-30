<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-navy mb-1">Vitajte, {{ userDisplayName }}!</h1>
      <p class="text-gray-500">Prehľad vášho konta a aktivít</p>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-blue-600 p-5">
        <div class="text-3xl font-bold text-blue-600">{{ stats.total }}</div>
        <p class="text-sm text-gray-500 mt-1">Prihlášky</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-green-600 p-5">
        <div class="text-3xl font-bold text-success-500">{{ stats.approved }}</div>
        <p class="text-sm text-gray-500 mt-1">Schválené</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-amber-500 p-5">
        <div class="text-3xl font-bold text-warning-500">{{ stats.inProcess }}</div>
        <p class="text-sm text-gray-500 mt-1">V procese</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-red-500 p-5">
        <div class="text-3xl font-bold text-danger-500">{{ stats.rejected }}</div>
        <p class="text-sm text-gray-500 mt-1">Zamietnuté</p>
      </div>
    </div>

    <!-- Required actions -->
    <div v-if="mockActions.length" class="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-5">
      <div class="flex items-center gap-2 mb-3">
        <AlertTriangle class="w-5 h-5 text-amber-600" />
        <h2 class="text-lg font-semibold text-amber-800">Vyžadované akcie</h2>
      </div>
      <ul class="space-y-2">
        <li v-for="action in mockActions" :key="action.id" class="flex items-center justify-between">
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

    <!-- Upcoming deadlines -->
    <div class="mb-8">
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

    <!-- My applications -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-navy">Moje prihlášky</h2>
        <NuxtLink to="/prihlasky" class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
          Zobraziť všetky
          <ChevronRight class="w-4 h-4" />
        </NuxtLink>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          v-for="app in mockApplications"
          :key="app.id"
          class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-semibold text-navy text-base leading-tight">{{ app.title }}</h3>
            <UiStatusBadge :status="app.status" />
          </div>
          <p class="text-sm text-gray-500 mb-4">
            {{ app.team }} · {{ app.program }}
            <span v-if="app.submittedAt"> · {{ app.submittedAt }}</span>
          </p>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4 text-sm text-gray-400">
              <span class="flex items-center gap-1">
                <Users class="w-4 h-4" />
                {{ app.members }}
              </span>
              <span class="flex items-center gap-1">
                <Paperclip class="w-4 h-4" />
                {{ app.documents }}
              </span>
            </div>
            <NuxtLink
              :to="`/prihlasky/${app.id}`"
              class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Zobraziť detail
              <ChevronRight class="w-4 h-4" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- My teams -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-navy">Moje tímy</h2>
        <NuxtLink to="/timy" class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
          Zobraziť všetky
          <ChevronRight class="w-4 h-4" />
        </NuxtLink>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="team in mockTeams"
          :key="team.id"
          class="bg-white rounded-lg shadow-sm border border-gray-100 p-5"
        >
          <h3 class="font-semibold text-navy mb-2">{{ team.name }}</h3>
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-1 text-sm text-gray-500">
              <Users class="w-4 h-4" />
              {{ team.members }} členov
            </span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
              {{ team.role }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FileText, Users, User, Calendar, AlertTriangle, Clock, Paperclip, ChevronRight } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  // middleware: 'auth' // TODO: re-enable when backend is available
})

useHead({
  title: 'Dashboard | NTI'
})

const authStore = useAuthStore()

// TODO: remove mock data when backend is available
if (!authStore.user) {
  authStore.user = {
    id: 1,
    email: 'jan.novak@example.com',
    first_name: 'Ján',
    last_name: 'Novák',
    role: 'student'
  }
  authStore.token = 'mock-token'
}

const userDisplayName = computed(() => {
  const user = authStore.user
  if (!user) return 'Užívateľ'
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`
  }
  if (user.organization_name) {
    return user.organization_name
  }
  return user.email || 'Užívateľ'
})

// Mock data
const mockApplications = [
  { id: 1, title: 'EcoTrack - Sledovanie uhlíkovej stopy', program: 'Program A', team: 'GreenTech tím', status: 'approved', submittedAt: '2026-02-15', members: 4, documents: 6 },
  { id: 2, title: 'StudyBuddy - AI asistent pre študentov', program: 'Program A', team: 'AI Innovators', status: 'evaluating', submittedAt: '2026-03-10', members: 3, documents: 4 },
  { id: 3, title: 'FitConnect - Fitness platforma', program: 'Program B', team: 'HealthTech', status: 'submitted', submittedAt: '2026-03-25', members: 5, documents: 3 },
  { id: 4, title: 'LocalMarket - Farmársky marketplace', program: 'Program A', team: 'AgriDigital', status: 'draft', submittedAt: null, members: 3, documents: 1 },
  { id: 5, title: 'SmartPark - Inteligentné parkovanie', program: 'Program B', team: 'UrbanTech', status: 'rejected', submittedAt: '2026-01-20', members: 4, documents: 5 },
]

const mockTeams = [
  { id: 1, name: 'GreenTech tím', members: 4, role: 'Team Lead' },
  { id: 2, name: 'AI Innovators', members: 3, role: 'Člen' },
  { id: 3, name: 'HealthTech', members: 5, role: 'Člen' },
]

const mockDeadlines = [
  { id: 1, title: 'Program A — Jarná výzva 2026', deadline: '2026-04-15', daysLeft: 16 },
  { id: 2, title: 'Program B — Firemné výzvy Q2', deadline: '2026-04-30', daysLeft: 31 },
]

const mockActions = [
  { id: 1, type: 'draft', message: 'Dokončite rozpracovanú prihlášku "LocalMarket"', link: '/prihlasky/4' },
  { id: 2, type: 'supplement', message: 'Doplňte dokumenty k prihláške "FitConnect"', link: '/prihlasky/3', deadline: '2026-04-05' },
]

const stats = computed(() => ({
  total: mockApplications.length,
  approved: mockApplications.filter(a => a.status === 'approved').length,
  inProcess: mockApplications.filter(a => ['submitted', 'evaluating'].includes(a.status)).length,
  rejected: mockApplications.filter(a => a.status === 'rejected').length,
}))
</script>
