<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div
      v-if="pending"
      class="mb-10 h-40 rounded-lg bg-gray-100 animate-pulse"
    />

    <template v-else>
    <!-- Header -->
    <div class="mb-10">
      <ClientOnly>
      <h1 class="text-3xl font-bold text-navy mb-1">{{ t('student_dashboard.home.welcome', { name: userDisplayName }) }}</h1>
      </ClientOnly>
      <p class="text-gray-500">{{ t('student_dashboard.home.subtitle') }}</p>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-blue-600 p-5">
        <div class="text-3xl font-bold text-blue-600">{{ stats.total }}</div>
        <p class="text-sm text-gray-500 mt-1">{{ t('student_dashboard.home.stats.applications') }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-green-600 p-5">
        <div class="text-3xl font-bold text-success-500">{{ stats.approved }}</div>
        <p class="text-sm text-gray-500 mt-1">{{ t('student_dashboard.home.stats.approved') }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-amber-500 p-5">
        <div class="text-3xl font-bold text-warning-500">{{ stats.inProcess }}</div>
        <p class="text-sm text-gray-500 mt-1">{{ t('student_dashboard.home.stats.in_process') }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-red-500 p-5">
        <div class="text-3xl font-bold text-danger-500">{{ stats.rejected }}</div>
        <p class="text-sm text-gray-500 mt-1">{{ t('student_dashboard.home.stats.rejected') }}</p>
      </div>
    </div>

    <!-- Required actions -->
    <div
      v-if="actions && actions.length"
      class="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-5"
    >
      <div class="flex items-center gap-2 mb-3">
        <AlertTriangle class="w-5 h-5 text-amber-600" />
        <h2 class="text-lg font-semibold text-amber-800">{{ t('student_dashboard.home.required_actions') }}</h2>
      </div>
      <ul class="space-y-2">
        <li
          v-for="action in actions"
          :key="action.id"
          class="flex items-center justify-between"
        >
          <span class="text-sm text-amber-700">{{ action.message }}</span>
          <NuxtLink
            :to="localePath(action.link)"
            class="text-sm font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1"
          >
            {{ t('student_dashboard.home.resolve') }}
            <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </li>
      </ul>
    </div>

    <!-- Upcoming deadlines -->
    <div v-if="deadlines && deadlines.length" class="mb-8">
      <h2 class="text-xl font-bold text-navy mb-4">{{ t('student_dashboard.home.upcoming_deadlines') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="d in deadlines"
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
            <p class="text-xs text-gray-500">{{ t('student_dashboard.home.days_left') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- My applications -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-navy">{{ t('student_dashboard.applications.title') }}</h2>
        <NuxtLink
          :to="localePath('/student/prihlasky')"
          class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          {{ t('student_dashboard.home.view_all') }}
          <ChevronRight class="w-4 h-4" />
        </NuxtLink>
      </div>
      <div v-if="applications && applications.length" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          v-for="app in applications.slice(0, 4)"
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
             
            </div>
            <NuxtLink
              :to="localePath(`/student/prihlasky/${app.id}`)"
              class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {{ t('student_dashboard.common.view_detail') }}
              <ChevronRight class="w-4 h-4" />
            </NuxtLink>
          </div>
        </div>
      </div>
      <UiEmptyState
        v-else
        :title="t('student_dashboard.applications.empty_title')"
        :message="t('student_dashboard.home.no_applications_yet')"
      />
    </div>

    <!-- Active projects milestones -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-navy">{{ t('student_dashboard.home.active_projects_milestones') }}</h2>
      </div>
      <div
        v-if="activeProjectsWithMilestones && activeProjectsWithMilestones.length"
        class="grid grid-cols-1 gap-4"
      >
        <div
          v-for="project in activeProjectsWithMilestones"
          :key="project.id"
          class="bg-white rounded-lg shadow-sm border border-gray-100 p-5"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="font-semibold text-navy text-base">{{ project.title }}</h3>
              <p class="text-xs text-gray-500 mt-1">{{ project.team }}</p>
            </div>
            <div class="text-right">
              <span class="text-xs text-gray-400"
                >{{ project.completedMilestones }}/{{ project.milestones.length }} {{ t('student_dashboard.home.milestones') }}</span
              >
              <div class="mt-1 h-1.5 w-20 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-blue-600"
                  :style="{ width: milestoneProgress(project) + '%' }"
                />
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <div
              v-for="milestone in project.milestones.slice(0, 2)"
              :key="milestone.id"
              class="flex items-center gap-2 text-sm"
            >
              <CheckCircle
                v-if="milestone.status === 'completed'"
                class="w-4 h-4 text-success-500 flex-shrink-0"
              />
              <Clock
                v-else-if="milestone.status === 'in_progress'"
                class="w-4 h-4 text-blue-500 flex-shrink-0"
              />
              <Circle
                v-else
                class="w-4 h-4 text-gray-300 flex-shrink-0"
              />
              <span class="text-gray-700 flex-1 truncate">{{ milestone.title }}</span>
              <span class="text-gray-400 text-xs">{{ milestone.dueDate }}</span>
            </div>
            <div
              v-if="project.milestones.length > 2"
              class="text-xs text-gray-400 ml-6"
            >
              +{{ project.milestones.length - 2 }} {{ t('student_dashboard.home.more_milestones') }}
            </div>
          </div>

          <NuxtLink
            :to="localePath(`/student/prihlasky/${project.id}`)"
            class="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 mt-3"
          >
            {{ t('student_dashboard.common.view_detail') }}
            <ChevronRight class="w-3 h-3" />
          </NuxtLink>
        </div>
      </div>
      <UiEmptyState
        v-else
        :title="t('student_dashboard.home.no_active_projects')"
      />
    </div>

    <!-- My teams -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-navy">{{ t('student_dashboard.teams.title') }}</h2>
        <NuxtLink
          :to="localePath('/student/timy')"
          class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          {{ t('student_dashboard.home.view_all') }}
          <ChevronRight class="w-4 h-4" />
        </NuxtLink>
      </div>
      <div v-if="teams && teams.length" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="team in teams"
          :key="team.id"
          class="bg-white rounded-lg shadow-sm border border-gray-100 p-5"
        >
          <h3 class="font-semibold text-navy mb-2">{{ team.name }}</h3>
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-1 text-sm text-gray-500">
              <Users class="w-4 h-4" />
              {{ t('student_dashboard.teams.members_count', { count: team.members }) }}
            </span>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600"
            >
              {{ team.role }}
            </span>
          </div>
        </div>
      </div>
      <UiEmptyState
        v-else
        :title="t('student_dashboard.home.no_teams_title')"
        :message="t('student_dashboard.home.no_teams_message')"
      />
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Users,
  Calendar,
  AlertTriangle,
  Clock,
  Paperclip,
  ChevronRight,
  CheckCircle,
  Circle,
} from 'lucide-vue-next'
import { useDashboard } from '../../composables/modules/student/useDashboard'


const localePath = useLocalePath()
const { t } = useI18n()

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
   roles: ['student'],
})

useHead({
  title: t('student_dashboard.home.seo_title'),
})

const authStore = useAuthStore()

// Fetch dashboard data from API
const {
  applications,
  teams,
  deadlines,
  actions,
  stats,
  activeProjectsWithMilestones,
  pending,
} = useDashboard()

const userDisplayName = computed(() => {
  const user = authStore.user
  if (!user) return t('student_dashboard.home.user_fallback')
  return `${user.name} ${user.surname}`.trim() || user.email || t('student_dashboard.home.user_fallback')
})

function milestoneProgress(project: any): number {
  if (!project.milestones || project.milestones.length === 0) return 0
  return Math.round((project.completedMilestones / project.milestones.length) * 100)
}
</script>
