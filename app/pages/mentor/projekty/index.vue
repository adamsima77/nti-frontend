<!-- pages/mentor/projekty/index.vue -->
<template>
  <div class="max-w-4xl mx-auto px-6 py-10">

    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-navy mb-1">Priradené projekty</h1>
      <p class="text-gray-500 text-sm">Všetky projekty kde pôsobíte ako mentor</p>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-6">
      <div class="flex gap-2">
        <button
          v-for="f in statusFilters"
          :key="f.value"
          @click="filterStatus = f.value"
          class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
          :class="filterStatus === f.value
            ? 'bg-purple-600 text-white'
            : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300'"
        >
          {{ f.label }}
          <span class="ml-1 opacity-60">{{ f.count }}</span>
        </button>
      </div>
      <select
        v-model="filterProgram"
        class="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <option value="">Všetky programy</option>
        <option value="Program A">Program A</option>
        <option value="Program B">Program B</option>
      </select>
    </div>

    <!-- Summary bar -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <p class="text-2xl font-bold text-purple-600">{{ filteredProjects.length }}</p>
        <p class="text-xs text-gray-500 mt-0.5">Projektov</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <p class="text-2xl font-bold text-warning-500">{{ totalPendingMilestones }}</p>
        <p class="text-xs text-gray-500 mt-0.5">Míľniky na schválenie</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <p class="text-2xl font-bold text-navy">{{ totalConsultations }}</p>
        <p class="text-xs text-gray-500 mt-0.5">Konzultácií celkom</p>
      </div>
    </div>

    <!-- Projects list -->
    <div class="space-y-4">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="bg-white rounded-lg border border-gray-100 p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold text-navy text-base">{{ project.name }}</h3>
              <UiStatusBadge :status="project.status" />
              <span
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="project.program === 'Program A' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'"
              >
                {{ project.program }}
              </span>
            </div>
            <p class="text-sm text-gray-500">{{ project.teamName }} · Priradený {{ project.assignedAt }}</p>
          </div>
          <NuxtLink
            :to="`/mentor/projekty/${project.id}`"
            class="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Otvoriť <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </div>

        <!-- Milestone progress -->
        <div class="mb-3">
          <div class="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Postup míľnikov</span>
            <span>{{ project.milestonesCompleted }}/{{ project.milestonesTotal }}</span>
          </div>
          <div class="bg-gray-100 rounded-full h-1.5">
            <div
              class="h-1.5 rounded-full bg-purple-500 transition-all"
              :style="{ width: `${(project.milestonesCompleted / project.milestonesTotal) * 100}%` }"
            />
          </div>
        </div>

        <!-- Meta -->
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
          <span
            v-if="project.pendingMilestone"
            class="inline-flex items-center gap-1 text-xs font-medium text-warning-600 bg-warning-50 px-2.5 py-1 rounded-full"
          >
            <Clock class="w-3.5 h-3.5" /> Čaká na schválenie
          </span>
        </div>
      </div>

      <div v-if="!filteredProjects.length" class="text-center py-16 bg-white rounded-lg border border-gray-100">
        <BookOpen class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">Žiadne projekty</p>
        <p class="text-sm text-gray-400 mt-1">Skúste zmeniť filtre</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Users, MessageSquare, Flag, Clock, ChevronRight, BookOpen } from 'lucide-vue-next'

definePageMeta({ 
  layout: 'portal', 
  //middleware: 'auth', 
  roles: ['mentor'] 
})

useHead({ title: 'Projekty | NTI Mentor' })

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

const filterStatus  = ref('all')
const filterProgram = ref('')

// TODO: fetch from API
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

const statusFilters = computed(() => [
  { label: 'Všetky',    value: 'all',    count: projects.length },
  { label: 'Aktívne',   value: 'active', count: projects.filter(p => p.status === 'active').length },
  { label: 'Pozastavené', value: 'paused', count: projects.filter(p => p.status === 'paused').length },
])

const filteredProjects = computed(() =>
  projects.filter(p => {
    if (filterStatus.value !== 'all' && p.status !== filterStatus.value) return false
    if (filterProgram.value && p.program !== filterProgram.value) return false
    return true
  })
)

const totalPendingMilestones = computed(() => projects.filter(p => p.pendingMilestone).length)
const totalConsultations     = computed(() => projects.reduce((s, p) => s + p.consultationsCount, 0))
</script>