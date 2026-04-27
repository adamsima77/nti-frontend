<!-- pages/hodnotenie/index.vue -->
<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-navy mb-1">Vitajte, {{ userDisplayName }}!</h1>
      <p class="text-gray-500">Prehľad hodnotenia prihlášok</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-blue-600 p-5">
        <div class="text-3xl font-bold text-blue-600">{{ stats.total }}</div>
        <p class="text-sm text-gray-500 mt-1">Prihlášky celkom</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-amber-500 p-5">
        <div class="text-3xl font-bold text-warning-500">{{ stats.pending }}</div>
        <p class="text-sm text-gray-500 mt-1">Čakajú na hodnotenie</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-green-600 p-5">
        <div class="text-3xl font-bold text-success-500">{{ stats.evaluated }}</div>
        <p class="text-sm text-gray-500 mt-1">Ohodnotené</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-gray-400 p-5">
        <div class="text-3xl font-bold text-gray-600">{{ stats.decided }}</div>
        <p class="text-sm text-gray-500 mt-1">Rozhodnuté</p>
      </div>
    </div>

    <!-- Required actions -->
    <div
      v-if="urgentApplications.length"
      class="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-5"
    >
      <div class="flex items-center gap-2 mb-3">
        <AlertTriangle class="w-5 h-5 text-amber-600" />
        <h2 class="text-lg font-semibold text-amber-800">Čakajú na vaše hodnotenie</h2>
      </div>
      <ul class="space-y-2">
        <li
          v-for="app in urgentApplications"
          :key="app.id"
          class="flex items-center justify-between"
        >
          <span class="text-sm text-amber-700">{{ app.projectName }} — {{ app.teamName }}</span>
          <NuxtLink
            :to="`/hodnotenie/${app.id}`"
            class="text-sm font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1"
          >
            Hodnotiť <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </li>
      </ul>
    </div>

    <!-- Recent applications -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-navy">Najnovšie prihlášky</h2>
        <NuxtLink
          :to="localePath('/hodnotenie/zoznam')"
          class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          Zobraziť všetky <ChevronRight class="w-4 h-4" />
        </NuxtLink>
      </div>

      <div class="space-y-3">
        <div
          v-for="app in recentApplications"
          :key="app.id"
          class="bg-white rounded-lg border border-gray-100 p-5 hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <h3 class="font-semibold text-navy text-base">{{ app.projectName }}</h3>
                <UiStatusBadge :status="app.status" />
                <span
                  class="text-xs px-2 py-0.5 rounded-full font-medium"
                  :class="app.program === 'A' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'"
                >
                  Program {{ app.program }}
                </span>
              </div>
              <p class="text-sm text-gray-500 mb-3">
                {{ app.teamName }} · Podané {{ app.submittedAt }}
                <span
                  v-if="app.deadline"
                  class="ml-2 text-warning-500 font-medium"
                >
                  · Deadline: {{ app.deadline }}
                </span>
              </p>
              <div
                v-if="app.myScore !== null"
                class="flex items-center gap-3"
              >
                <div class="flex items-center gap-1.5">
                  <Star class="w-4 h-4 text-warning-500" />
                  <span class="text-sm font-semibold text-navy">{{ app.myScore }}/100</span>
                  <span class="text-xs text-gray-400">váš skór</span>
                </div>
                <div
                  v-if="app.avgScore !== null"
                  class="flex items-center gap-1.5"
                >
                  <span class="text-xs text-gray-400">·</span>
                  <span class="text-sm text-gray-500"
                    >priemer komisie: <strong class="text-navy">{{ app.avgScore }}/100</strong></span
                  >
                </div>
              </div>
            </div>
            <div class="shrink-0">
              <NuxtLink
                :to="`/hodnotenie/${app.id}`"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="
                  app.myScore === null && app.status === 'evaluating'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                "
              >
                <ClipboardCheck
                  v-if="app.myScore === null && app.status === 'evaluating'"
                  class="w-4 h-4"
                />
                <Eye
                  v-else
                  class="w-4 h-4"
                />
                {{ app.myScore === null && app.status === 'evaluating' ? 'Hodnotiť' : 'Detail' }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight, AlertTriangle, Star, ClipboardCheck, Eye } from 'lucide-vue-next'

const localePath = useLocalePath()

definePageMeta({
  layout: 'portal',
  //middleware: 'auth',
  roles: ['company'],
})

useHead({ title: 'Dashboard | NTI Komisia' })

const authStore = useAuthStore()

if (!authStore.user) {
  authStore.user = {
    id: 20, email: 'evaluator@nti.sk',
    first_name: 'Eva',
    last_name: 'Komisárová',
    role: 'evaluator'
  }
  authStore.token = 'mock-token'
}

const userDisplayName = computed(() => {
  const u = authStore.user
  if (!u) return 'Hodnotiteľ'
  return u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.email
})

// TODO: fetch from API
const applications = [
  { id: 1, projectName: 'EcoTrack – Sledovanie uhlíkovej stopy', teamName: 'GreenTech tím',    program: 'A', status: 'evaluating', submittedAt: '10.03.2026', deadline: '15.04.2026', myScore: null,  avgScore: null },
  { id: 2, projectName: 'StudyBuddy – AI asistent',              teamName: 'AI Innovators',     program: 'A', status: 'evaluating', submittedAt: '12.03.2026', deadline: '15.04.2026', myScore: null,  avgScore: null },
  { id: 3, projectName: 'FitConnect – Fitness platforma',        teamName: 'HealthTech',        program: 'B', status: 'evaluating', submittedAt: '15.03.2026', deadline: '20.04.2026', myScore: 74,    avgScore: 71   },
  { id: 4, projectName: 'LocalMarket – Farmársky marketplace',   teamName: 'AgriDigital',       program: 'A', status: 'approved',   submittedAt: '01.02.2026', deadline: null,         myScore: 88,    avgScore: 85   },
  { id: 5, projectName: 'SmartPark – Inteligentné parkovanie',   teamName: 'UrbanTech',         program: 'B', status: 'rejected',   submittedAt: '20.01.2026', deadline: null,         myScore: 42,    avgScore: 45   },
]

const recentApplications = computed(() => applications.slice(0, 3))

const urgentApplications = computed(() =>
  applications.filter(a => a.status === 'evaluating' && a.myScore === null)
)

const stats = computed(() => ({
  total:     applications.length,
  pending:   applications.filter(a => a.status === 'evaluating' && a.myScore === null).length,
  evaluated: applications.filter(a => a.myScore !== null).length,
  decided:   applications.filter(a => ['approved', 'rejected'].includes(a.status)).length,
}))
</script>
