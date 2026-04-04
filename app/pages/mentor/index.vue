<!-- pages/mentor/index.vue -->
<template>
  <div class="max-w-7xl mx-auto px-6 py-10">

    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-navy mb-1">Vitajte, {{ userDisplayName }}!</h1>
      <p class="text-gray-500">Prehľad priradených projektov a aktivít</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-purple-500 p-5">
        <div class="text-3xl font-bold text-purple-600">{{ stats.totalProjects }}</div>
        <p class="text-sm text-gray-500 mt-1">Projekty</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-blue-600 p-5">
        <div class="text-3xl font-bold text-blue-600">{{ stats.activeProjects }}</div>
        <p class="text-sm text-gray-500 mt-1">Aktívne</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-amber-500 p-5">
        <div class="text-3xl font-bold text-warning-500">{{ stats.pendingMilestones }}</div>
        <p class="text-sm text-gray-500 mt-1">Míľniky na schválenie</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-green-600 p-5">
        <div class="text-3xl font-bold text-success-500">{{ stats.consultationsThisMonth }}</div>
        <p class="text-sm text-gray-500 mt-1">Konzultácie (mesiac)</p>
      </div>
    </div>

    <!-- Required actions -->
    <div v-if="pendingActions.length" class="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-5">
      <div class="flex items-center gap-2 mb-3">
        <AlertTriangle class="w-5 h-5 text-amber-600" />
        <h2 class="text-lg font-semibold text-amber-800">Vyžaduje vašu pozornosť</h2>
      </div>
      <ul class="space-y-2">
        <li v-for="action in pendingActions" :key="action.id" class="flex items-center justify-between">
          <span class="text-sm text-amber-700">{{ action.message }}</span>
          <NuxtLink :to="action.link" class="text-sm font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1">
            Vyriešiť <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </li>
      </ul>
    </div>

    <!-- Assigned projects -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-navy">Priradené projekty</h2>
        <NuxtLink to="/mentor/projekty" class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">Zobraziť všetky <ChevronRight class="w-4 h-4" /></NuxtLink>
      </div>
      <div class="space-y-4">
        <div
          v-for="project in projects"
          :key="project.id"
          class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-navy text-base">{{ project.name }}</h3>
                <UiStatusBadge :status="project.status" />
                <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="programClass(project.program)">
                  {{ project.program }}
                </span>
              </div>
              <p class="text-sm text-gray-500">{{ project.teamName }} · Priradený {{ project.assignedAt }}</p>
            </div>
            <NuxtLink
              :to="`/mentor/projekty/${project.id}`"
              class="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Otvoriť projekt <ChevronRight class="w-4 h-4" />
            </NuxtLink>
          </div>

          <!-- Milestone progress -->
          <div class="mb-4">
            <div class="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Postup míľnikov</span>
              <span>{{ project.milestonesCompleted }}/{{ project.milestonesTotal }}</span>
            </div>
            <div class="bg-gray-100 rounded-full h-2">
              <div
                class="h-2 rounded-full bg-purple-500 transition-all"
                :style="{ width: `${(project.milestonesCompleted / project.milestonesTotal) * 100}%` }"
              />
            </div>
          </div>

          <div class="flex items-center justify-between text-sm text-gray-400">
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1">
                <Users class="w-4 h-4" />
                {{ project.teamSize }} členov
              </span>
              <span class="flex items-center gap-1">
                <MessageSquare class="w-4 h-4" />
                {{ project.consultationsCount }} konzultácií
              </span>
              <span v-if="project.nextMilestone" class="flex items-center gap-1 text-warning-500">
                <Flag class="w-4 h-4" />
                {{ project.nextMilestone }}
              </span>
            </div>
            <span v-if="project.pendingMilestone" class="inline-flex items-center gap-1 text-xs font-medium text-warning-600 bg-warning-50 px-2.5 py-1 rounded-full">
              <Clock class="w-3.5 h-3.5" />
              Čaká na schválenie
            </span>
          </div>
        </div>

        <div v-if="!projects.length" class="text-center py-16 bg-white rounded-lg border border-gray-100">
          <BookOpen class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500 font-medium">Zatiaľ žiadne priradené projekty</p>
        </div>
      </div>
    </div>

    <!-- Recent consultations -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-navy">Posledné konzultácie</h2>
        <NuxtLink to="/mentor/konzultacie" class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
          Všetky konzultácie <ChevronRight class="w-4 h-4" />
        </NuxtLink>
      </div>
      <div class="bg-white rounded-lg border border-gray-100 divide-y divide-gray-50">
        <div v-for="c in recentConsultations" :key="c.id" class="px-5 py-4 flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare class="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-navy">{{ c.projectName }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ c.summary }}</p>
            </div>
          </div>
          <span class="text-xs text-gray-400 shrink-0">{{ c.date }}</span>
        </div>
        <div v-if="!recentConsultations.length" class="px-5 py-8 text-center text-sm text-gray-400">
          Žiadne konzultácie
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Users, MessageSquare, Flag, Clock, ChevronRight, AlertTriangle, BookOpen } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  //middleware: 'auth',
  roles: ['mentor'],
})

useHead({ title: 'Dashboard | NTI Mentor' })

const authStore = useAuthStore()

// TODO: remove when backend is available
if (!authStore.user) {
  authStore.user = { 
    id: 10, 
    email: 'mentor@nti.sk', 
    first_name: 'Matej', 
    last_name: 'Novotný', 
    role: 'mentor' 
  }
  authStore.token = 'mock-token'
}

const userDisplayName = computed(() => {
  const u = authStore.user
  if (!u) return 'Mentor'
  return u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.email
})

const projects = [
  {
    id: 1, name: 'EcoTrack – Sledovanie uhlíkovej stopy', teamName: 'GreenTech tím',
    program: 'Program A', status: 'active', assignedAt: '15.02.2026',
    teamSize: 4, consultationsCount: 6, milestonesCompleted: 2, milestonesTotal: 5,
    nextMilestone: 'Prototyp — 20.04.2026', pendingMilestone: false,
  },
  {
    id: 2, name: 'AI chatbot pre zákaznícku podporu', teamName: 'AI Innovators',
    program: 'Program B', status: 'active', assignedAt: '01.03.2026',
    teamSize: 3, consultationsCount: 3, milestonesCompleted: 1, milestonesTotal: 4,
    nextMilestone: 'MVP — 30.04.2026', pendingMilestone: true,
  },
  {
    id: 3, name: 'StudyBuddy – AI asistent', teamName: 'EduTech',
    program: 'Program A', status: 'paused', assignedAt: '10.01.2026',
    teamSize: 3, consultationsCount: 4, milestonesCompleted: 3, milestonesTotal: 5,
    nextMilestone: null, pendingMilestone: false,
  },
]

const recentConsultations = [
  { id: 1, projectName: 'EcoTrack', summary: 'Review databázovej schémy, plán na ďalší sprint', date: '02.04.2026' },
  { id: 2, projectName: 'AI chatbot', summary: 'Diskusia o architektúre LLM integrácie', date: '28.03.2026' },
  { id: 3, projectName: 'EcoTrack', summary: 'Kontrola míľnika M2 — API integrácia', date: '20.03.2026' },
]

const pendingActions = [
  { id: 1, message: 'Schváľte míľnik "MVP" pre projekt AI chatbot', link: '/mentor/projekty/2' },
  { id: 2, message: 'Zapíšte záver z konzultácie (AI chatbot, 01.04.2026)', link: '/mentor/konzultacie/nova?project=2' },
]

const stats = computed(() => ({
  totalProjects:          projects.length,
  activeProjects:         projects.filter(p => p.status === 'active').length,
  pendingMilestones:      projects.filter(p => p.pendingMilestone).length,
  consultationsThisMonth: recentConsultations.length,
}))

const programClass = (program: string) =>
  program === 'Program A'
    ? 'bg-blue-50 text-blue-600'
    : 'bg-purple-50 text-purple-600'
</script>