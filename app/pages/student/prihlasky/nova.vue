<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <div class="mb-8">
      <UiBreadcrumbs
        :items="[
          { label: t('student_dashboard.applications.title'), to: localePath('/student/prihlasky') },
          { label: t('student_dashboard.applications.new_application') },
        ]"
      />
    </div>

    <div class="mb-8">
      <h1 class="text-3xl font-bold text-navy mb-2">{{ t('student_dashboard.applications.new_application') }}</h1>
      <p class="text-gray-600">{{ t('student_dashboard.applications.new_description') }}</p>
    </div>

    <div
      v-if="!selectedCall"
      class="space-y-6"
    >
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

    <div
      v-else
      class="bg-white rounded-lg shadow-sm border border-gray-100 p-8"
    >
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

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">{{ t('student_dashboard.applications.team') }}</label>
          <p class="text-xs text-gray-500">{{ t('student_dashboard.applications.team_min_members_help') }}</p>
          <select
            v-model.number="selectedTeamId"
            :disabled="isFormDisabled"
            class="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
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

      <div 
        v-if="isFormDisabled" 
        class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"
      >
        Prihláška už bola odoslaná alebo je uzamknutá na úpravu.
      </div>

      <DynamicForm
        v-if="selectedCall.formSchema?.fields?.length"
        :key="selectedCall.id"
        :form-schema="selectedCall.formSchema"
        :initial-data="draftData"
        :draft-persist-enabled="Boolean(selectedTeamId) && !isFormDisabled"
        :disabled="isFormDisabled"
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
const { addToast } = useToast()

// ── State ──────────────────────────────────────────────────────────────────

const selectedCall   = ref<Call | null>(null)
const selectedTeamId = ref<number | null>(null)
const draftData      = ref<Record<string, any>>({})
const applicationStatus = ref<string | null>(null)
const isSubmitting   = ref(false)
const isSavingDraft  = ref(false)

// ── Computed ───────────────────────────────────────────────────────────────

const eligibleTeams = computed(() =>
  teamsStore.teams.filter((team) => Array.isArray(team.members) && team.members.length >= 3),
)

// Kontrola, či sa majú polia zakázať (ak je prihláška podaná alebo zamknutá)
const isFormDisabled = computed(() => {
  return applicationStatus.value === 'submitted' || applicationStatus.value === 'approved' || applicationStatus.value === 'rejected'
})

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
      
      // Nastavenie stavu prihlášky z backendu ak existuje
      applicationStatus.value = (callsStore.currentCall as any).applicationStatus ?? null

      if ((callsStore.currentCall as any).formData) {
        draftData.value = (callsStore.currentCall as any).formData
      }
    }
    if (Number.isFinite(teamId) && teamId > 0) {
      selectedTeamId.value = teamId
    }
  }
})

// ── Call selection ─────────────────────────────────────────────────────────

const selectCall = async (call: Call) => {
  await callsStore.fetchCallById(call.id)
  selectedCall.value = callsStore.currentCall ?? call
  selectedTeamId.value = null
  draftData.value = {}
  applicationStatus.value = (callsStore.currentCall as any).applicationStatus ?? null

  if (selectedCall.value && (selectedCall.value as any).formData) {
    draftData.value = (selectedCall.value as any).formData
    addToast({ message: t('student_dashboard.applications.toasts.loading_draft'), type: 'info' })
  }
}

// ── Draft save ─────────────────────────────────────────────────────────────

const handleSaveDraft = async (data: Record<string, any>) => {
  if (!selectedCall.value || isFormDisabled.value) return

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
      form_data: serializeFormDataForApi(schema, data as Record<string, unknown>),
    })

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
  if (isFormDisabled.value) return
  if (!selectedTeamId.value || !selectedCall.value) {
    addToast({ message: t('student_dashboard.applications.toasts.select_team'), type: 'error' })
    return
  }

  const schema = selectedCall.value.formSchema
  if (!schema?.fields?.length) {
    addToast({ message: t('student_dashboard.applications.toasts.submit_failed'), type: 'error' })
    return
  }

  // Schema Validation
  const errors: string[] = []
  schema.fields.forEach((field: any) => {
    if (field.required && (!data[field.name] || (Array.isArray(data[field.name]) && data[field.name].length === 0))) {
      errors.push(t('student_dashboard.applications.errors.required_field', { field: field.label || field.name }))
    }
  })

  if (errors.length > 0) {
    addToast({ message: errors[0], type: 'error' })
    return
  }

  const formPayload = serializeFormDataForApi(schema, data as Record<string, unknown>)
  isSubmitting.value = true

  try {
    const response = await api.post('/submit-application', {
      call_id: selectedCall.value.id,
      team_id: Number(selectedTeamId.value),
      form_data: formPayload,
    }) as any

    addToast({ message: t('student_dashboard.applications.toasts.created'), type: 'success' })

    const appId = response?.data?.id ?? response?.id
    if (appId) {
      await router.push(localePath(`/student/prihlasky/${appId}`))
    } else {
      await router.push(localePath('/student/prihlasky'))
    }
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
    applicationStatus.value = null
    router.push(localePath('/student/prihlasky'))
  }
}

// ── Formatters ─────────────────────────────────────────────────────────────

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('sk-SK')
</script>