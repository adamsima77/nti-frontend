<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close" />

        <div
          class="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
        >
          <!-- Header -->
          <div class="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100">
            <div class="flex items-center gap-3 min-w-0">
              <div class="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Users class="w-5 h-5 text-indigo-600" />
              </div>
              <div class="min-w-0">
                <h2 class="text-lg font-semibold text-navy truncate">
                  {{ $t('admin_calls.program_b_applications_modal_title') }}
                </h2>
                <p v-if="call" class="text-sm text-gray-500 mt-0.5 truncate">
                  {{ call.name }}
                </p>
              </div>
            </div>
            <button
              class="ml-4 flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              @click="close"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Subtitle -->
          <div class="px-6 py-3 bg-amber-50 border-b border-amber-100">
            <p class="text-sm text-amber-700">
              {{ $t('admin_calls.program_b_applications_modal_subtitle') }}
            </p>
          </div>

          <!-- Not all evaluated warning -->
          <div
            v-if="!loading && !error && applications.length && !allApplicationsEvaluated"
            class="px-6 py-2.5 bg-red-50 border-b border-red-100 flex items-center gap-2"
          >
            <AlertCircle class="w-4 h-4 text-red-500 flex-shrink-0" />
            <p class="text-sm text-red-600">
              Výber tímu nie je možný — nie všetky prihlášky boli ohodnotené všetkými členmi komisie.
            </p>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-6 py-4">
            <!-- Loading -->
            <div v-if="loading" class="flex items-center justify-center py-16">
              <div class="flex flex-col items-center gap-3 text-gray-400">
                <div class="w-8 h-8 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
                <span class="text-sm">Načítavam prihlášky…</span>
              </div>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="py-8 text-center">
              <p class="text-sm text-red-500">{{ error }}</p>
              <button class="mt-3 text-sm text-indigo-600 hover:underline" @click="fetchApplications">
                Skúsiť znova
              </button>
            </div>

            <!-- Empty -->
            <div v-else-if="!applications.length" class="py-12 text-center text-gray-400">
              <FileX class="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p class="text-sm">{{ $t('admin_calls.program_b_no_applications') }}</p>
            </div>

            <!-- Applications list -->
            <div v-else class="space-y-3">
              <div
                v-for="app in applications"
                :key="app.id"
                class="border border-gray-200 rounded-xl p-4 hover:border-indigo-200 transition"
                :class="{ 'border-indigo-300 bg-indigo-50/30': selectedAppId === app.id }"
              >
                <div class="flex items-start justify-between gap-4">
                  <!-- Team info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-semibold text-navy text-sm">{{ app.team?.name ?? '—' }}</span>
                      <span v-if="app.reference" class="text-xs font-mono text-gray-400">{{ app.reference }}</span>
                      <UiStatusBadge v-if="app.status" :status="resolveStatusKey(app.status.name)" />
                    </div>

                    <!-- Evaluation progress -->
                    <div class="mt-2 flex items-center gap-3 flex-wrap">
                      <div class="flex items-center gap-1.5 text-xs text-gray-500">
                        <ClipboardCheck
                          class="w-3.5 h-3.5"
                          :class="app.all_evaluated ? 'text-emerald-500' : 'text-gray-400'"
                        />
                        <span>
                          {{ $t('admin_calls.program_b_evaluations_progress', {
                            submitted: app.submitted_evaluations_count,
                            total: app.evaluations_count,
                          }) }}
                        </span>
                      </div>

                      <div
                        v-if="app.all_evaluated && app.average_score !== null"  
                        class="flex items-center gap-1.5 text-xs font-medium text-indigo-700"
                      >
                        <Star class="w-3.5 h-3.5 text-indigo-500" />
                        {{ $t('admin_calls.program_b_col_avg_score') }}: {{ app.average_score }} / 20
                      </div>
                    </div>

                    <!-- Per-evaluator breakdown -->
                    <div v-if="app.all_evaluated && app.evaluations?.length" class="mt-2 space-y-1">
                      <div
                        v-for="(ev, idx) in app.evaluations"
                        :key="idx"
                        class="flex items-center gap-2 text-xs text-gray-500"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                        <span>{{ ev.evaluator ?? 'Hodnotiteľ ' + (idx + 1) }}</span>
                        <span v-if="ev.avg_score !== null" class="text-gray-400">— {{ ev.avg_score }} / 20</span>
                      </div>
                    </div>

                    <!-- Not all evaluated notice -->
                    <p v-if="!app.all_evaluated" class="mt-2 text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle class="w-3.5 h-3.5" />
                      {{ $t('admin_calls.program_b_not_all_evaluated') }}
                    </p>
                  </div>

                  <!-- Action button -->
                  <UiButton
                    :disabled="!allApplicationsEvaluated || selecting"
                    :title="!allApplicationsEvaluated ? 'Výber je možný až po ohodnotení všetkých prihlášok' : ''"
                    class="flex-shrink-0 whitespace-nowrap"
                    :class="{ 'opacity-40 cursor-not-allowed': !allApplicationsEvaluated }"
                    @click="confirmSelect(app)"
                  >
                    <CheckCircle class="w-4 h-4 mr-1.5" />
                    {{ $t('admin_calls.program_b_select_team') }}
                  </UiButton>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <UiButton variant="outline" @click="close">
              {{ $t('common.close') }}
            </UiButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Confirm dialog -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="confirmApp" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="confirmApp = null" />
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <h3 class="text-base font-semibold text-navy mb-2">Potvrdenie výberu tímu</h3>
          <p class="text-sm text-gray-600 mb-6">
            {{ $t('admin_calls.program_b_select_confirm', { team: confirmApp.team?.name ?? '' }) }}
          </p>
          <div class="flex justify-end gap-3">
            <UiButton variant="outline" :disabled="selecting" @click="confirmApp = null">
              {{ $t('common.cancel') }}
            </UiButton>
            <UiButton :disabled="selecting" @click="doSelectTeam">
              <span v-if="selecting" class="flex items-center gap-2">
                <span class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Spracováva sa…
              </span>
              <span v-else>Potvrdiť výber</span>
            </UiButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  X, Users, CheckCircle, AlertCircle, Star, ClipboardCheck, FileX,
} from 'lucide-vue-next'

interface EvaluationDetail {
  evaluator: string | null
  submitted: boolean
  score_count: number
  avg_score: number | null
}

interface ApplicationRow {
  id: number
  reference: string | null
  team: { id: number; name: string } | null
  status: { id: number; name: string } | null
  evaluations_count: number
  submitted_evaluations_count: number
  all_evaluated: boolean
  average_score: number | null
  evaluations: EvaluationDetail[]
}

const props = defineProps<{
  modelValue: boolean
  call: { id: number; name: string } | null
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  'team-selected': []
}>()

const { t }          = useI18n()
const api            = useApi()
const { addToast }   = useToast()

const loading                  = ref(false)
const error                    = ref<string | null>(null)
const applications             = ref<ApplicationRow[]>([])
const allApplicationsEvaluated = ref(false)
const selectedAppId            = ref<number | null>(null)
const confirmApp               = ref<ApplicationRow | null>(null)
const selecting                = ref(false)

// ── Fetch ────────────────────────────────────────────────────────────────────

async function fetchApplications() {
  if (!props.call) return
  loading.value = true
  error.value   = null

  try {
    const res: any = await api.get(`/v1/admin/calls/${props.call.id}/program-b-applications`)
    applications.value             = res?.data ?? []
    allApplicationsEvaluated.value = res?.all_applications_evaluated ?? false
  } catch {
    error.value = t('admin_calls.program_b_fetch_error')
  } finally {
    loading.value = false
  }
}

// ── Watch open ────────────────────────────────────────────────────────────────

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      applications.value             = []
      allApplicationsEvaluated.value = false
      selectedAppId.value            = null
      confirmApp.value               = null
      fetchApplications()
    }
  },
)

// ── Select team ───────────────────────────────────────────────────────────────

function confirmSelect(app: ApplicationRow) {
  if (!allApplicationsEvaluated.value) return
  confirmApp.value = app
}

async function doSelectTeam() {
  if (!confirmApp.value || !props.call) return
  selecting.value = true

  try {
    await api.post(`/v1/admin/calls/${props.call.id}/select-team`, {
      application_id: confirmApp.value.id,
    })
    addToast({ message: t('admin_calls.program_b_select_success'), type: 'success' })
    confirmApp.value = null
    emit('team-selected')
    close()
  } catch {
    addToast({ message: t('admin_calls.program_b_select_error'), type: 'error' })
  } finally {
    selecting.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveStatusKey(name: string): string {
  const lookup: Record<string, string> = {
    'Draft':                  'draft',
    'Podané':                 'submitted',
    'V hodnotení':            'evaluating',
    'Vyžiadané doplnenie':    'pending',
    'Schválené':              'approved',
    'Zamietnuté':             'rejected',
    'Pozastavené':            'paused',
    'Onboarding':             'onboarding',
    'Aktívny projekt':        'active_project',
    'Ukončené':               'completed',
  }
  return lookup[name] ?? 'draft'
}

function close() {
  emit('update:modelValue', false)
}
</script>
