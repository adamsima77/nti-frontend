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
          <p class="text-xs text-gray-500">{{ t('student_dashboard.applications.team_min_members_help') }}</p>
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
              v-for="team in eligibleTeams"
              :key="team.id"
              :value="team.id"
            >
              {{ team.name }} — {{ t('student_dashboard.teams.members_count', { count: team.members.length }) }}
            </option>
          </select>
          <p
            v-if="teamsStore.teams.length && !eligibleTeams.length"
            class="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-3 py-2"
          >
            {{ t('student_dashboard.applications.team_no_eligible') }}
          </p>
        </div>
      </div>

      <!-- Form -->
      <DynamicForm
        v-if="selectedCall.formSchema?.fields?.length"
        :key="selectedCall.id"
        :form-schema="selectedCall.formSchema"
        :initial-data="draftData"
        :draft-persist-enabled="Boolean(selectedTeamId)"
        @cancel="handleCancel"
        @save-draft="handleSaveDraft"
        @submit="handleSubmit"
      />
      <div
        v-else-if="selectedCall.formSchema"
        class="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
      >
        {{ t('student_dashboard.applications.no_form_fields') }}
      </div>
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
import { ref, onMounted, computed } from 'vue'
import { Calendar, Users, FileText } from 'lucide-vue-next'
import type { Call } from '~/stores/calls'
import type { FormSchema } from '~/stores/applications'

// ── Helpers ────────────────────────────────────────────────────────────────

function parseUploadedDocumentIds(val: unknown): number[] {
  if (val == null || val === '') return []
  if (typeof val === 'number' && Number.isFinite(val) && val > 0) return [val]
  if (Array.isArray(val)) return val.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0)
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val) as unknown
      if (Array.isArray(parsed)) return parsed.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0)
      if (typeof parsed === 'number' && parsed > 0) return [parsed]
    } catch {
      if (/^\d+$/.test(val)) return [Number(val)]
    }
  }
  return []
}

function collectDocumentIdsFromForm(schema: FormSchema, data: Record<string, unknown>): number[] {
  const set = new Set<number>()
  for (const f of schema.fields) {
    if (f.type !== 'file') continue
    for (const id of parseUploadedDocumentIds(data[f.name])) set.add(id)
  }
  return [...set].sort((a, b) => a - b)
}

/**
 * Serialise formData to Record<string, string> for the backend.
 * File fields become JSON-stringified arrays of document IDs.
 */
function serializeFormDataForApi(schema: FormSchema, data: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const field of schema.fields) {
    const v = data[field.name]
    if (field.type === 'file') {
      const ids = parseUploadedDocumentIds(v)
      out[field.name] = ids.length ? JSON.stringify(ids) : ''
    } else if (field.type === 'checkbox') {
      out[field.name] = v === true || v === 1 || v === '1' ? '1' : '0'
    } else if (field.type === 'repeater') {
      out[field.name] = JSON.stringify(Array.isArray(v) ? v : [])
    } else if (v == null) {
      out[field.name] = ''
    } else {
      out[field.name] = typeof v === 'string' ? v : String(v)
    }
  }
  return out
}

// ── Page meta ──────────────────────────────────────────────────────────────

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
  roles: ['student'],
})

// ── Composables ────────────────────────────────────────────────────────────

const { t } = useI18n()
useHead({ title: t('student_dashboard.applications.new_seo_title') })

const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()
const api = useApi()

const callsStore = useCallsStore()
const teamsStore = useTeamsStore()
const applicationsStore = useApplicationsStore()
const { addToast } = useToast()

// ── State ──────────────────────────────────────────────────────────────────

const selectedCall   = ref<Call | null>(null)
const selectedTeamId = ref<number | null>(null)
const draftData      = ref<Record<string, any>>({})
const isSubmitting   = ref(false)
const isSavingDraft  = ref(false)

// ── Computed ───────────────────────────────────────────────────────────────

const eligibleTeams = computed(() =>
  teamsStore.teams.filter((team) => Array.isArray(team.members) && team.members.length >= 3),
)

// ── Lifecycle ──────────────────────────────────────────────────────────────

onMounted(async () => {
  await Promise.all([callsStore.fetchOpenCalls(), teamsStore.fetchTeams()])

  const teamQ = route.query.team
  const callQ = route.query.call
  const teamId = typeof teamQ === 'string' ? Number(teamQ) : NaN
  const callId = typeof callQ === 'string' ? Number(callQ) : NaN

  if (Number.isFinite(callId) && callId > 0) {
    await callsStore.fetchCallById(callId)
    if (callsStore.currentCall) {
      selectedCall.value = callsStore.currentCall
    }
    if (Number.isFinite(teamId) && teamId > 0) {
      selectedTeamId.value = teamId
      const draft = applicationsStore.getDraft(teamId, callId)
      if (draft) {
        draftData.value = draft.data
        addToast({ message: t('student_dashboard.applications.toasts.loading_draft'), type: 'info' })
      }
    }
  }
})

// ── Call selection ─────────────────────────────────────────────────────────

const selectCall = async (call: Call) => {
  await callsStore.fetchCallById(call.id)
  selectedCall.value = callsStore.currentCall ?? call
  selectedTeamId.value = null

  // Restore any locally-persisted draft for this call
  for (const team of teamsStore.teams) {
    const draft = applicationsStore.getDraft(team.id, selectedCall.value.id)
    if (draft) {
      draftData.value = draft.data
      if (team.members.length >= 3) selectedTeamId.value = team.id
      addToast({ message: t('student_dashboard.applications.toasts.loading_draft'), type: 'info' })
      break
    }
  }
}

// ── Draft save ─────────────────────────────────────────────────────────────

const handleSaveDraft = async (data: Record<string, any>) => {
  if (!selectedCall.value) return

  if (!selectedTeamId.value) {
    addToast({
      message: t('student_dashboard.applications.toasts.draft_needs_team'),
      type: 'warning',
    })
    return
  }

  const schema = selectedCall.value.formSchema
  if (!schema?.fields?.length) return

  isSavingDraft.value = true

  try {
    await api.post('/applications/draft', {
      call_id:   selectedCall.value.id,
      team_id:   Number(selectedTeamId.value),
      // Serialise: file fields → JSON array of document IDs, rest → strings
      form_data: serializeFormDataForApi(schema, data as Record<string, unknown>),
    })

    // Mirror into local store so navigating away and back restores the form
    applicationsStore.saveDraft(Number(selectedTeamId.value), selectedCall.value.id, data)

    addToast({
      message: t('student_dashboard.applications.toasts.draft_saved'),
      type: 'success',
    })
  } catch (err: any) {
    const msg = err?.data?.message ?? err?.message ?? t('student_dashboard.applications.toasts.submit_failed')
    addToast({ message: msg, type: 'error' })
  } finally {
    isSavingDraft.value = false
  }
}

// ── Submit ─────────────────────────────────────────────────────────────────

const handleSubmit = async (data: Record<string, any>) => {
  if (!selectedTeamId.value || !selectedCall.value) {
    addToast({ message: t('student_dashboard.applications.toasts.select_team'), type: 'error' })
    return
  }

  const schema = selectedCall.value.formSchema
  if (!schema?.fields?.length) {
    addToast({ message: t('student_dashboard.applications.toasts.submit_failed'), type: 'error' })
    return
  }

  const formPayload  = serializeFormDataForApi(schema, data as Record<string, unknown>)
  const documentIds  = collectDocumentIdsFromForm(schema, data as Record<string, unknown>)

  if (documentIds.length === 0) {
    addToast({
      message: 'Nahrajte aspoň jednu prílohu (pole typu súbor v prihláške).',
      type: 'error',
    })
    return
  }

  isSubmitting.value = true

  try {
    const application = await applicationsStore.createApplication({
      callId:      selectedCall.value.id,
      teamId:      Number(selectedTeamId.value),
      documentIds,
      formData:    formPayload,
    })

    addToast({ message: t('student_dashboard.applications.toasts.created'), type: 'success' })

    applicationsStore.clearDraft(Number(selectedTeamId.value), selectedCall.value.id)

    await router.push(localePath(`/student/prihlasky/${application.id}`))
  } catch (err: any) {
    const msg = err?.data?.message ?? err?.message ?? t('student_dashboard.applications.toasts.submit_failed')
    addToast({ message: msg, type: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

// ── Cancel ─────────────────────────────────────────────────────────────────

const handleCancel = () => {
  if (confirm(t('student_dashboard.applications.cancel_confirm'))) {
    selectedCall.value   = null
    selectedTeamId.value = null
    draftData.value      = {}
    router.push(localePath('/student/prihlasky'))
  }
}

// ── Formatters ─────────────────────────────────────────────────────────────

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('sk-SK')
</script>