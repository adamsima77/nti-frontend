<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-navy">{{ t('student_dashboard.applications.title') }}</h1>
      <NuxtLink :to="localePath('/student/prihlasky/nova')">
        <UiButton>
          <Plus class="w-4 h-4" />
          {{ t('student_dashboard.applications.new_application') }}
        </UiButton>
      </NuxtLink>
    </div>

    <div
      v-if="pending"
      class="grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      <div
        v-for="i in 4"
        :key="i"
        class="bg-white rounded-lg border border-gray-100 h-48 animate-pulse"
      />
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <UiInput
          v-model="searchQuery"
          :placeholder="t('student_dashboard.applications.filters.search_placeholder')"
          type="text"
        />
        <UiSelect
          v-model="statusFilter"
          :options="statusOptions"
          :placeholder="t('student_dashboard.applications.filters.status')"
        />
        <UiSelect
          v-model="programFilter"
          :options="programOptions"
          :placeholder="t('student_dashboard.applications.filters.program')"
        />
      </div>

      <div
        v-if="filteredApplications.length"
        class="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <div
          v-for="app in filteredApplications"
          :key="app.id"
          class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-semibold text-navy text-base leading-tight">{{ app.title }}</h3>
            <UiStatusBadge :status="app.status" />
          </div>
          <p class="text-sm text-gray-500 mb-2">
            {{ app.team }} · {{ app.program }}
            <span v-if="app.submittedAt"> · {{ app.submittedAt }}</span>
          </p>
          <p
            v-if="app.description"
            class="text-sm text-gray-600 mb-4 truncate"
          >
            {{ app.description }}
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
              :to="detailLink(app)"
              class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {{ app.isDraft ? t('student_dashboard.applications.continue_draft') : t('student_dashboard.common.view_detail') }}
              <ChevronRight class="w-4 h-4" />
            </NuxtLink>
          </div>
        </div>
      </div>

      <div
        v-else
        class="bg-white rounded-lg shadow-sm border border-gray-100"
      >
        <UiEmptyState
          :icon="FileText"
          :title="t('student_dashboard.applications.empty_title')"
          :description="t('student_dashboard.applications.empty_description')"
        >
          <NuxtLink :to="localePath('/student/prihlasky/nova')">
            <UiButton size="sm">{{ t('student_dashboard.applications.new_application') }}</UiButton>
          </NuxtLink>
        </UiEmptyState>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Users, Paperclip, ChevronRight, FileText } from 'lucide-vue-next'
import type { Application } from '../../../composables/modules/student/types'
import { useApplications } from '~/composables/modules/student/useApplications'
import type { ApplicationDraft } from '~/stores/applications'

const localePath = useLocalePath()
const { t } = useI18n()

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
})

useHead({ title: t('student_dashboard.applications.seo_title') })

const { applications, pending } = useApplications()
const appsStore = useApplicationsStore()
const teamsStore = useTeamsStore()
const callsStore = useCallsStore()

onMounted(async () => {
  await Promise.all([teamsStore.fetchTeams(), callsStore.fetchOpenCalls()])
})

const searchQuery = ref('')
const statusFilter = ref('')
const programFilter = ref('')

function draftToApplication(draft: ApplicationDraft): Application {
  const team = teamsStore.teams.find((x) => x.id === draft.teamId)
  const call = callsStore.calls.find((c) => c.id === draft.callId)
  return {
    id: -(draft.teamId * 1_000_000 + draft.callId),
    title: call?.title ?? `${t('student_dashboard.applications.application')} #${draft.callId}`,
    program: call?.programName ?? '',
    team: team?.name ?? `${t('student_dashboard.applications.team')} #${draft.teamId}`,
    status: 'draft',
    submittedAt: draft.lastSavedAt ?? null,
    members: team?.members?.length ?? 0,
    documents: 0,
    milestones: [],
    isDraft: true,
    draftTeamId: draft.teamId,
    draftCallId: draft.callId,
  }
}

const combinedApplications = computed(() => {
  void appsStore.draftRevision
  const apiList = applications.value
  const pair = (teamId?: number, callId?: number) =>
    teamId != null && callId != null ? `${teamId}_${callId}` : null
  const submittedPairs = new Set(
    apiList
      .map((a) => pair(a.teamId, a.callId))
      .filter((x): x is string => x != null),
  )
  const drafts = appsStore
    .listDraftsFromStorage()
    .filter((d) => !submittedPairs.has(`${d.teamId}_${d.callId}`))
    .map(draftToApplication)
  return [...drafts, ...apiList]
})

function detailLink(app: Application): string {
  if (app.isDraft && app.draftTeamId != null && app.draftCallId != null) {
    const q = new URLSearchParams({
      team: String(app.draftTeamId),
      call: String(app.draftCallId),
    })
    return localePath(`/student/prihlasky/nova?${q.toString()}`)
  }
  return localePath(`/student/prihlasky/${app.id}`)
}

const statusOptions = [
  { value: '', label: t('student_dashboard.applications.filters.all_statuses') },
  { value: 'draft', label: t('student_dashboard.applications.status.draft') },
  { value: 'submitted', label: t('student_dashboard.applications.status.submitted') },
  { value: 'evaluating', label: t('student_dashboard.applications.status.evaluating') },
  { value: 'approved', label: t('student_dashboard.applications.status.approved') },
  { value: 'rejected', label: t('student_dashboard.applications.status.rejected') },
]

const programOptions = computed(() => {
  const programs = new Set<string>()
  for (const a of combinedApplications.value) {
    if (a.program) programs.add(a.program)
  }
  return [{ value: '', label: t('student_dashboard.applications.filters.all_programs') }, ...[...programs].sort().map((p) => ({ value: p, label: p }))]
})

const filteredApplications = computed(() => {
  return combinedApplications.value.filter((app: Application) => {
    const matchesSearch =
      !searchQuery.value || app.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !statusFilter.value || app.status === statusFilter.value
    const matchesProgram = !programFilter.value || app.program === programFilter.value
    return matchesSearch && matchesStatus && matchesProgram
  })
})
</script>
