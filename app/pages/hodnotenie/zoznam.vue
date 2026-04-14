<!-- pages/hodnotenie/zoznam.vue -->
<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-navy mb-1">Všetky hodnotenia</h1>
      <p class="text-gray-500 text-sm">Prihlášky priradené vašej komisii</p>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-6">
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="f in statusFilters"
          :key="f.value"
          @click="filterStatus = f.value"
          class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
          :class="
            filterStatus === f.value
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
          "
        >
          {{ f.label }}
          <span class="ml-1 opacity-60">{{ f.count }}</span>
        </button>
      </div>
      <select
        v-model="filterProgram"
        class="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">Všetky programy</option>
        <option value="A">Program A</option>
        <option value="B">Program B</option>
      </select>
    </div>

    <!-- Summary bar -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">{{ filteredApplications.length }}</p>
        <p class="text-xs text-gray-500 mt-0.5">Prihlášok</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <p class="text-2xl font-bold text-navy">
          {{ filteredApplications.filter((a) => a.myScore !== null).length }}
        </p>
        <p class="text-xs text-gray-500 mt-0.5">Ohodnotených</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <p class="text-2xl font-bold text-navy">
          {{ avgMyScore !== null ? avgMyScore : '—' }}
        </p>
        <p class="text-xs text-gray-500 mt-0.5">Váš priemerný skór</p>
      </div>
    </div>

    <!-- Applications list -->
    <div class="space-y-3">
      <div
        v-for="app in filteredApplications"
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
                <span class="text-sm text-gray-500">
                  priemer komisie: <strong class="text-navy">{{ app.avgScore }}/100</strong>
                </span>
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

      <div
        v-if="!filteredApplications.length"
        class="text-center py-16 bg-white rounded-lg border border-gray-100"
      >
        <ClipboardCheck class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">Žiadne prihlášky</p>
        <p class="text-sm text-gray-400 mt-1">Skúste zmeniť filtre</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Star, ClipboardCheck, Eye } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  //middleware: 'auth',
  roles: ['evaluator'],
})

const authStore = useAuthStore()

if (!authStore.user) {
  authStore.user = {
    id: 20,
    email: 'evaluator@nti.sk',
    first_name: 'Eva',
    last_name: 'Komisárová',
    role: 'evaluator',
  }
  authStore.token = 'mock-token'
}

useHead({ title: 'Hodnotenia | NTI Komisia' })

const filterStatus = ref('all')
const filterProgram = ref('')

// TODO: fetch from API
const applications = [
  {
    id: 1,
    projectName: 'EcoTrack – Sledovanie uhlíkovej stopy',
    teamName: 'GreenTech tím',
    program: 'A',
    status: 'evaluating',
    submittedAt: '10.03.2026',
    deadline: '15.04.2026',
    myScore: null,
    avgScore: null,
  },
  {
    id: 2,
    projectName: 'StudyBuddy – AI asistent',
    teamName: 'AI Innovators',
    program: 'A',
    status: 'evaluating',
    submittedAt: '12.03.2026',
    deadline: '15.04.2026',
    myScore: null,
    avgScore: null,
  },
  {
    id: 3,
    projectName: 'FitConnect – Fitness platforma',
    teamName: 'HealthTech',
    program: 'B',
    status: 'evaluating',
    submittedAt: '15.03.2026',
    deadline: '20.04.2026',
    myScore: 74,
    avgScore: 71,
  },
  {
    id: 4,
    projectName: 'LocalMarket – Farmársky marketplace',
    teamName: 'AgriDigital',
    program: 'A',
    status: 'approved',
    submittedAt: '01.02.2026',
    deadline: null,
    myScore: 88,
    avgScore: 85,
  },
  {
    id: 5,
    projectName: 'SmartPark – Inteligentné parkovanie',
    teamName: 'UrbanTech',
    program: 'B',
    status: 'rejected',
    submittedAt: '20.01.2026',
    deadline: null,
    myScore: 42,
    avgScore: 45,
  },
]

const statusFilters = computed(() => [
  { label: 'Všetky', value: 'all', count: applications.length },
  { label: 'Na hodnotenie', value: 'evaluating', count: applications.filter((a) => a.status === 'evaluating').length },
  { label: 'Ohodnotené', value: 'evaluated', count: applications.filter((a) => a.myScore !== null).length },
  {
    label: 'Rozhodnuté',
    value: 'decided',
    count: applications.filter((a) => ['approved', 'rejected'].includes(a.status)).length,
  },
])

const filteredApplications = computed(() =>
  applications.filter((a) => {
    if (filterProgram.value && a.program !== filterProgram.value) return false
    if (filterStatus.value === 'all') return true
    if (filterStatus.value === 'evaluated') return a.myScore !== null
    if (filterStatus.value === 'decided') return ['approved', 'rejected'].includes(a.status)
    return a.status === filterStatus.value
  }),
)

const avgMyScore = computed(() => {
  const scored = applications.filter((a) => a.myScore !== null)
  if (!scored.length) return null
  return Math.round(scored.reduce((s, a) => s + (a.myScore ?? 0), 0) / scored.length)
})
</script>
