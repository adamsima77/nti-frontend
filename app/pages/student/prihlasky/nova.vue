<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <!-- Breadcrumbs -->
    <div class="mb-8">
      <UiBreadcrumbs
        :items="[
          { label: t('student_dashboard.applications.title'), to: localePath('/student/prihlasky') },
          { label: t('student_dashboard.applications.new_application') },
        ]"
      />
    </div>

    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-navy mb-2">{{ t('student_dashboard.applications.new_application') }}</h1>
      <p class="text-gray-600">{{ t('student_dashboard.applications.new_description') }}</p>
    </div>

    <!-- Step 1: Select Call -->
    <div
      v-if="!selectedCall"
      class="space-y-6"
    >
      <!-- Loading -->
      <div
        v-if="callsStore.isLoading"
        class="grid gap-4"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-40 animate-pulse"
        />
      </div>

      <!-- Available Calls -->
      <div
        v-else-if="callsStore.openCalls.length"
        class="grid gap-4"
      >
        <div
          v-for="call in callsStore.openCalls"
          :key="call.id"
          @click="selectCall(call)"
          class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:border-blue-200 transition"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="text-xl font-bold text-navy">{{ call.title }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ call.programName }}</p>
            </div>
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700"
            >
              {{ t('student_dashboard.applications.open_calls.open') }}
            </span>
          </div>

          <p class="text-sm text-gray-600 mb-4">{{ call.description }}</p>

          <div class="flex items-center gap-4 text-sm text-gray-500">
            <span class="flex items-center gap-1">
              <Calendar class="w-4 h-4" />
              {{ formatDate(call.startDate) }} - {{ formatDate(call.endDate) }}
            </span>
            <span class="flex items-center gap-1">
              <Users class="w-4 h-4" />
              {{ t('student_dashboard.teams.applications_count', { count: call.applicantsCount || 0 }) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="bg-white rounded-lg shadow-sm border border-gray-100"
      >
        <UiEmptyState
          :icon="FileText"
          :title="t('student_dashboard.applications.open_calls.empty_title')"
          :description="t('student_dashboard.applications.open_calls.empty_description')"
        >
          <NuxtLink :to="localePath('/student/prihlasky')">
            <UiButton variant="outline">{{ t('student_dashboard.applications.back_to_applications') }}</UiButton>
          </NuxtLink>
        </UiEmptyState>
      </div>
    </div>

    <!-- Step 2: Fill Form -->
    <div
      v-else
      class="bg-white rounded-lg shadow-sm border border-gray-100 p-8"
    >
      <!-- Call Header -->
      <div class="mb-8 pb-8 border-b">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold text-navy">{{ selectedCall.title }}</h2>
            <p class="text-sm text-gray-500 mt-1">{{ selectedCall.programName }}</p>
          </div>
          <button
            @click="selectedCall = null"
            class="text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            ✕ {{ t('student_dashboard.applications.change_call') }}
          </button>
        </div>

        <!-- Team selection -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">{{ t('student_dashboard.applications.team') }}</label>
          <select
            v-model.number="selectedTeamId"
            class="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option
              value=""
              disabled
            >
              {{ t('student_dashboard.applications.select_team') }}
            </option>
            <option
              v-for="team in teamsStore.teams"
              :key="team.id"
              :value="team.id"
            >
              {{ team.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Form -->
      <DynamicForm
        v-if="selectedCall.formSchema"
        :form-schema="selectedCall.formSchema"
        :initial-data="draftData"
        @cancel="handleCancel"
        @save-draft="handleSaveDraft"
        @submit="handleSubmit"
      />
      <div
        v-else
        class="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
      >
        {{ t('student_dashboard.applications.no_form_schema') }}
        {{ t('student_dashboard.applications.no_form_schema_continuation') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Calendar, Users, FileText } from 'lucide-vue-next'
import type { Call } from '~/stores/calls'

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
})

useHead({ title: t('student_dashboard.applications.new_seo_title') })

const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()
const callsStore = useCallsStore()
const teamsStore = useTeamsStore()
const applicationsStore = useApplicationsStore()
const { addToast } = useToast()

const selectedCall = ref<Call | null>(null)
const selectedTeamId = ref<number | null>(null)
const draftData = ref<Record<string, any>>({})
const isSubmitting = ref(false)

// Load calls and teams on mount
onMounted(async () => {
  await Promise.all([callsStore.fetchOpenCalls(), teamsStore.fetchTeams()])
})

const selectCall = async (call: Call) => {
  selectedCall.value = call
  selectedTeamId.value = null

  // Check if there's a draft for this call
  if (teamsStore.teams.length > 0) {
    const draft = applicationsStore.getDraft(teamsStore.teams[0]!.id, call.id)
    if (draft) {
      draftData.value = draft.data
      addToast({
        message: t('student_dashboard.applications.toasts.loading_draft'),
        type: 'info',
      })
    }
  }
}

const handleSaveDraft = (data: Record<string, any>) => {
  if (!selectedTeamId.value || !selectedCall.value) return

  applicationsStore.saveDraft(selectedTeamId.value, selectedCall.value.id, data)
  addToast({
    message: t('student_dashboard.applications.toasts.draft_saved'),
    type: 'success',
  })
}

const handleSubmit = async (data: Record<string, any>) => {
  if (!selectedTeamId.value || !selectedCall.value) {
    addToast({ message: t('student_dashboard.applications.toasts.select_team'), type: 'error' })
    return
  }

  const rawIds = (data as { document_ids?: unknown }).document_ids
  const documentIds = Array.isArray(rawIds)
    ? rawIds.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0)
    : []

  isSubmitting.value = true

  try {
    const application = await applicationsStore.createApplication({
      callId: selectedCall.value.id,
      teamId: Number(selectedTeamId.value),
      documentIds,
    })

    addToast({
      message: t('student_dashboard.applications.toasts.created'),
      type: 'success',
    })

    applicationsStore.clearDraft(Number(selectedTeamId.value), selectedCall.value.id)

    await router.push(localePath(`/student/prihlasky/${application.id}`))
  } catch (err: any) {
    const msg = err?.data?.message ?? err?.message ?? t('student_dashboard.applications.toasts.submit_failed')
    addToast({ message: msg, type: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  if (confirm(t('student_dashboard.applications.cancel_confirm'))) {
    selectedCall.value = null
    selectedTeamId.value = null
    draftData.value = {}
    router.push(localePath('/student/prihlasky'))
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('sk-SK')
}
</script>
