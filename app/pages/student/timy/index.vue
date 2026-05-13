<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-navy">{{ t('student_dashboard.teams.title') }}</h1>
      <NuxtLink :to="localePath('/student/timy/vytvorit')">
        <UiButton>
          <Plus class="w-4 h-4" />
          {{ t('student_dashboard.teams.create_team') }}
        </UiButton>
      </NuxtLink>
    </div>

    <!-- Loading state -->
    <div
      v-if="teamsStore.isLoading"
      class="space-y-4"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 h-64 animate-pulse"
      />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="teamsStore.teams.length === 0"
      class="bg-white rounded-lg shadow-sm border border-gray-100"
    >
      <UiEmptyState
        :icon="Users"
        :title="t('student_dashboard.teams.empty_title')"
        :description="t('student_dashboard.teams.empty_description')"
      >
        <NuxtLink :to="localePath('/student/timy/vytvorit')">
          <UiButton>
            <Plus class="w-4 h-4" />
            {{ t('student_dashboard.teams.create_team') }}
          </UiButton>
        </NuxtLink>
      </UiEmptyState>
    </div>

    <!-- Team cards -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        v-for="team in teamsStore.teams"
        :key="team.id"
        class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
      >
        <h3 class="font-semibold text-navy text-lg mb-3">{{ team.name }}</h3>

        <!-- Role badge -->
        <div class="mb-3">
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600"
          >
            {{ team.myRole }}
          </span>
        </div>

        <!-- Member initials -->
        <div class="flex items-center gap-1 mb-3">
          <div
            v-for="member in team.members.slice(0, 4)"
            :key="member.id"
            class="w-8 h-8 rounded-full bg-navy text-white text-xs font-medium flex items-center justify-center"
            :title="member.name"
          >
            {{ getInitials(member.name) }}
          </div>
          <div
            v-if="team.members.length > 4"
            class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 text-xs font-medium flex items-center justify-center"
          >
            +{{ team.members.length - 4 }}
          </div>
          <span class="text-sm text-gray-500 ml-2">{{ t('student_dashboard.teams.members_count', { count: team.members.length }) }}</span>
        </div>

        <!-- Stats -->
        <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span class="flex items-center gap-1">
            <FileText class="w-4 h-4" />
            {{ t('student_dashboard.teams.applications_count', { count: team.applications.length }) }}
          </span>
          <span class="text-xs text-gray-400">{{ team.createdAt }}</span>
        </div>

        <!-- Detail link -->
        <NuxtLink
          :to="localePath(`/student/timy/${team.id}`)"
          class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          {{ t('student_dashboard.common.view_detail') }}
          <ChevronRight class="w-4 h-4" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, FileText, ChevronRight, Users } from 'lucide-vue-next'
import { onMounted } from 'vue'

const localePath = useLocalePath()
const { t } = useI18n()

definePageMeta({
  layout: 'portal',
  // middleware: 'auth', // TODO: re-enable when backend is available
})

useSeoMeta({
  title: t('student_dashboard.teams.seo_title'),
  description: t('student_dashboard.teams.seo_description'),
  ogTitle: t('student_dashboard.teams.og_title'),
  ogDescription: t('student_dashboard.teams.og_description'),
  ogType: 'website',
  ogUrl: 'https://nti.sk/timy',
  twitterCard: 'summary_large_image',
  twitterTitle: t('student_dashboard.teams.og_title'),
  twitterDescription: t('student_dashboard.teams.twitter_description'),
})

const teamsStore = useTeamsStore()

// Load teams when page mounts
onMounted(async () => {
  await teamsStore.fetchTeams()
})

function getInitials(name: string): string {
  if (!name?.trim()) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>
