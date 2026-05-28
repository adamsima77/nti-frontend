<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-navy mb-1">{{ t('mentor.dashboard.greeting', { name: userDisplayName }) }}</h1>
      <p class="text-gray-500">{{ t('mentor.dashboard.subtitle') }}</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-purple-500 p-5">
        <div class="text-3xl font-bold text-purple-600">{{ stats.totalProjects }}</div>
        <p class="text-sm text-gray-500 mt-1">{{ t('mentor.dashboard.stats.projects') }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-blue-600 p-5">
        <div class="text-3xl font-bold text-blue-600">{{ stats.activeProjects }}</div>
        <p class="text-sm text-gray-500 mt-1">{{ t('mentor.dashboard.stats.active') }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-amber-500 p-5">
        <div class="text-3xl font-bold text-warning-500">{{ stats.pendingMilestones }}</div>
        <p class="text-sm text-gray-500 mt-1">{{ t('mentor.dashboard.stats.pendingMilestones') }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-green-600 p-5">
        <div class="text-3xl font-bold text-success-500">{{ stats.consultationsThisMonth }}</div>
        <p class="text-sm text-gray-500 mt-1">{{ t('mentor.dashboard.stats.consultationsThisMonth') }}</p>
      </div>
    </div>

    <!-- Required actions -->
    <div
      v-if="pendingActions.length"
      class="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-5"
    >
      <div class="flex items-center gap-2 mb-3">
        <AlertTriangle class="w-5 h-5 text-amber-600" />
        <h2 class="text-lg font-semibold text-amber-800">{{ t('mentor.dashboard.attention') }}</h2>
      </div>
      <ul class="space-y-2">
        <li
          v-for="action in pendingActions"
          :key="action.id"
          class="flex items-center justify-between"
        >
          <span class="text-sm text-amber-700">{{ action.message }}</span>
          <NuxtLink
            :to="action.link"
            class="text-sm font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1"
          >
            {{ t('mentor.dashboard.resolve') }} <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </li>
      </ul>
    </div>

    <!-- Assigned projects -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-navy">{{ t('mentor.dashboard.assignedProjects') }}</h2>
        <NuxtLink
          to="/mentor/projekty"
          class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >{{ t('mentor.dashboard.viewAllProjects') }} <ChevronRight class="w-4 h-4"
        /></NuxtLink>
      </div>
      <div class="space-y-4">
        <div
          v-if="loading.dashboard || loading.projects"
          class="bg-white rounded-lg border border-gray-100 p-6 text-sm text-gray-500"
        >
          {{ t('mentor.dashboard.loadingProjects') }}
        </div>

        <div
          v-else-if="error.dashboard || error.projects"
          class="bg-danger-50 border border-danger-200 rounded-lg p-6"
        >
          <p class="text-sm text-danger-700 font-medium mb-3">
            {{ error.dashboard || error.projects }}
          </p>
          <button
            @click="handleDashboardRetry"
            class="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-danger-200 text-danger-700 text-sm font-medium hover:bg-danger-50"
          >
            {{ t('mentor.dashboard.retry') }}
          </button>
        </div>

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
                <span
                  class="text-xs px-2 py-0.5 rounded-full font-medium"
                  :class="programClass(project.program ?? '')"
                >
                  {{ project.program }}
                </span>
              </div>
              <p class="text-sm text-gray-500">
                {{ project.teamName }} · {{ t('mentor.dashboard.assignedAt', { date: project.assignedAt }) }}
              </p>
            </div>
            <NuxtLink
              :to="`/mentor/projekty/${project.id}`"
              class="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {{ t('mentor.dashboard.openProject') }} <ChevronRight class="w-4 h-4" />
            </NuxtLink>
          </div>

          <!-- Milestone progress -->
          <div class="mb-4">
            <div class="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>{{ t('mentor.dashboard.milestoneProgress') }}</span>
              <span>{{ project.milestonesCompleted ?? 0 }}/{{ project.milestonesTotal ?? project.milestones?.length ?? 0 }}</span>
            </div>
            <div class="bg-gray-100 rounded-full h-2">
              <div
                class="h-2 rounded-full bg-purple-500 transition-all"
                :style="{ width: `${progressPercent(project)}%` }"
              />
            </div>
          </div>

          <div class="flex items-center justify-between text-sm text-gray-400">
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1">
                <Users class="w-4 h-4" />
                {{ t('mentor.dashboard.membersCount', { count: project.teamSize }) }}
              </span>
              <span class="flex items-center gap-1">
                <MessageSquare class="w-4 h-4" />
                {{ t('mentor.dashboard.consultationsCount', { count: project.consultationsCount }) }}
              </span>
              <span
                v-if="project.nextMilestone"
                class="flex items-center gap-1 text-warning-500"
              >
                <Flag class="w-4 h-4" />
                {{ project.nextMilestone }}
              </span>
            </div>
            <span
              v-if="project.pendingMilestone"
              class="inline-flex items-center gap-1 text-xs font-medium text-warning-600 bg-warning-50 px-2.5 py-1 rounded-full"
            >
              <Clock class="w-3.5 h-3.5" />
              {{ t('mentor.projects.pendingApproval') }}
            </span>
          </div>
        </div>

        <div
          v-if="!loading.dashboard && !loading.projects && !projects.length"
          class="text-center py-16 bg-white rounded-lg border border-gray-100"
        >
          <BookOpen class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500 font-medium">{{ t('mentor.dashboard.noProjects') }}</p>
        </div>
      </div>
    </div>

    <!-- Recent consultations -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-navy">{{ t('mentor.dashboard.recentConsultations') }}</h2>
        <NuxtLink
          to="/mentor/konzultacie"
          class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          {{ t('mentor.dashboard.viewAllConsultations') }} <ChevronRight class="w-4 h-4" />
        </NuxtLink>
      </div>
      <div class="bg-white rounded-lg border border-gray-100 divide-y divide-gray-50">
        <div
          v-for="c in recentConsultations"
          :key="c.id"
          class="px-5 py-4 flex items-start justify-between gap-4"
        >
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
        <div
          v-if="!loading.dashboard && !recentConsultations.length"
          class="px-5 py-8 text-center text-sm text-gray-400"
        >
          {{ t('mentor.dashboard.noConsultations') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Users, MessageSquare, Flag, Clock, ChevronRight, AlertTriangle, BookOpen } from 'lucide-vue-next'
import type { MentorProject } from '../../types/mentor'
import { useMentorDashboard as useMentorDashboardComposable } from '../../composables/useMentorDashboard'

const { t } = useI18n()
const authStore = useAuthStore()
const { dashboard, projects, loading, error, fetchDashboard, fetchProjects } = useMentorDashboardComposable()
const { addToast } = useToast()

onMounted(async () => {
  await fetchDashboard()
  if (!projects.value.length) await fetchProjects()
})

const userDisplayName = computed(() => {
  const u = authStore.user
  if (!u) return 'Mentor'
  return u.name && u.surname ? `${u.name} ${u.surname}` : (u.email ?? 'Mentor')
})

const pendingActions = computed(() => dashboard.value?.pendingActions ?? [])
const recentConsultations = computed(() => dashboard.value?.recentConsultations ?? [])

const stats = computed(() => {
  const p = projects.value ?? []
  const server = dashboard.value?.stats

  return {
    totalProjects: server?.totalProjects ?? p.length,
    activeProjects: server?.activeProjects ?? p.filter((project) => project.status === 'active').length,
    pendingMilestones: server?.pendingMilestones ?? p.filter((project) => Boolean(project.pendingMilestone)).length,
    consultationsThisMonth: server?.consultationsThisMonth ?? recentConsultations.value.length,
  }
})

const programClass = (program: string) =>
  program === 'Program A' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'

const safeMilestonesTotal = (project: MentorProject) => {
  const total = project.milestonesTotal ?? project.milestones?.length ?? 0
  return total > 0 ? total : 1
}

const progressPercent = (project: MentorProject) => {
  const completed = project.milestonesCompleted ?? 0
  return Math.round((completed / safeMilestonesTotal(project)) * 100)
}

const handleDashboardRetry = async () => {
  try {
    await fetchDashboard()
    if (!projects.value.length) await fetchProjects()
  } catch {
    addToast({ message: t('mentor.dashboard.refreshFailed'), type: 'error' })
  }
}
</script>

