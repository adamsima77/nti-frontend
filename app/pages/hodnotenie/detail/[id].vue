<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <div class="flex items-start justify-between gap-4 mb-6 flex-wrap">
      <div class="space-y-2">
        <NuxtLink
          :to="localePath('/hodnotenie/zoznam')"
          class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors"
        >
          <ChevronLeft class="w-4 h-4" /> {{ $t('evaluator.back_to_list') }}
        </NuxtLink>
        <div class="flex items-center gap-2 flex-wrap">
          <h1 class="text-2xl font-bold text-navy">{{ applicationTitle }}</h1>
          <UiStatusBadge :status="applicationDetail?.status ?? ''" />
        </div>
        <p class="text-gray-500 text-sm">
          {{ applicationDetail?.teamName ?? applicationDetail?.team?.name }} · {{ formatDate(applicationDetail?.submitted_at) }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="applicationDetail"
          type="button"
          @click="goBackToEvaluation"
          class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {{ $t('evaluator.view_evaluation') }}
        </button>
      </div>
    </div>

    <template v-if="isLoading">
      <div class="py-16 text-center text-sm text-gray-500">{{ $t('evaluator.loading_detail') }}</div>
    </template>

    <template v-else-if="applicationDetail">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- ── Main column ─────────────────────────────────────────── -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Summary -->
          <div class="bg-white rounded-lg border border-gray-100 p-6">
            <h2 class="text-base font-semibold text-navy mb-4">{{ $t('evaluator.application_summary') }}</h2>
            <div class="grid grid-cols-1 gap-4 text-sm text-gray-700">
              <div>
                <p class="font-medium text-gray-900">{{ $t('evaluator.student_name') }}</p>
                <p>{{ applicationDetail.applicant_name ?? applicationDetail.teamName ?? applicationDetail.team?.name ?? '—' }}</p>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ $t('evaluator.call') }}</p>
                <p>{{ applicationDetail.call?.name ?? '-' }}</p>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ $t('evaluator.current_status') }}</p>
                <p>{{ applicationDetail.status }}</p>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="bg-white rounded-lg border border-gray-100 p-6">
            <h2 class="text-base font-semibold text-navy mb-4">{{ $t('evaluator.application_description') }}</h2>
            <p class="text-gray-700 text-sm leading-relaxed break-words whitespace-pre-line">
              {{ applicationDetail.description ?? '—' }}
            </p>
          </div>

          <!-- Form responses -->
          <div class="bg-white rounded-lg border border-gray-100 p-6">
            <h2 class="text-base font-semibold text-navy mb-4">{{ $t('evaluator.form_responses') }}</h2>

            <!-- No answers -->
            <div
              v-if="!answersReady"
              class="text-xs text-gray-400"
            >
              {{ $t('evaluator.no_form_responses') }}
            </div>

            <!-- Rendered answers, driven by form_fields for labels -->
            <div v-else class="space-y-5 text-sm text-gray-700">
              <div
                v-for="field in applicationDetail.form_fields"
                :key="field.name"
                class="space-y-1.5 pb-4 border-b border-gray-50 last:border-0 last:pb-0"
              >
                <p class="font-medium text-gray-900">{{ field.label }}</p>

                <!-- FILE: download button, blob fetched directly -->
                <template v-if="field.type === 'file'">
                  <div v-if="getFileIds(field.name).length" class="flex flex-wrap gap-2 mt-1">
                    <button
                      v-for="docId in getFileIds(field.name)"
                      :key="docId"
                      :disabled="downloadingIds.has(docId)"
                      @click="downloadDocument(docId)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                      <span
                        v-if="downloadingIds.has(docId)"
                        class="w-3.5 h-3.5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"
                      />
                      <Download v-else class="w-3.5 h-3.5" />
                      {{ fileMetaMap[docId] ?? `Súbor #${docId}` }}
                    </button>
                  </div>
                  <p v-else class="text-sm text-gray-400 italic">{{ $t('evaluator.academic_record.not_uploaded') }}</p>
                </template>

                <!-- BOOLEAN -->
                <template v-else-if="field.type === 'checkbox'">
                  <p class="text-sm text-gray-600">
                    <span v-if="isTruthy(getAnswerRaw(field.name))">✅ {{ $t('evaluator.academic_record.yes') }}</span>
                    <span v-else>❌ {{ $t('evaluator.academic_record.no') }}</span>
                  </p>
                </template>

                <!-- LONG TEXT -->
                <template v-else-if="field.type === 'long text' || field.type === 'textarea'">
                  <p class="text-sm text-gray-600 break-words whitespace-pre-line bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1">
                    {{ formatValue(getAnswerRaw(field.name)) }}
                  </p>
                </template>

                <!-- DEFAULT -->
                <template v-else>
                  <p class="text-sm text-gray-600 break-words">
                    {{ formatValue(getAnswerRaw(field.name)) }}
                  </p>
                </template>
              </div>
            </div>
          </div>

          <!-- Team members -->
          <div class="bg-white rounded-lg border border-gray-100 p-6">
            <h2 class="text-base font-semibold text-navy mb-4">{{ $t('evaluator.team_members') }}</h2>
            <div class="space-y-4 text-sm">
              <div
                v-for="member in applicationDetail.teamMembers ?? []"
                :key="member.id"
                class="border border-gray-100 rounded-2xl p-4"
              >
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p class="font-medium text-navy">{{ member.name }}</p>
                    <p class="text-xs text-gray-500">{{ member.role }}</p>
                    <p v-if="member.school || member.study_program || member.study_year" class="mt-2 text-xs text-gray-500">
                      {{ [member.school, member.study_program, member.study_year].filter(Boolean).join(' / ') }}
                    </p>
                  </div>
                  <NuxtLink
                    v-if="member.student_id"
                    :to="localePath(`/hodnotenie/student/${member.student_id}`)"
                    class="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {{ $t('evaluator.student_profile') }}
                  </NuxtLink>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm text-gray-700">
                  <div>
                    <p class="font-medium text-gray-900">{{ $t('evaluator.academic_record.honor_declaration') }}</p>
                    <p>
                      <span v-if="member.honor_declaration">✅ {{ $t('evaluator.academic_record.yes') }}</span>
                      <span v-else>❌ {{ $t('evaluator.academic_record.no') }}</span>
                    </p>
                    <p v-if="member.honor_declaration && member.honor_declaration_signed_at" class="text-xs text-gray-500 mt-1">
                      {{ $t('evaluator.academic_record.signed_at') }} {{ formatDate(member.honor_declaration_signed_at) }}
                    </p>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ $t('evaluator.academic_record.transcript') }}</p>
                    <!-- Transcript: extract document ID from "/storage/32" and download via API -->
                    <div v-if="extractIdFromStoragePath(member.transcript_file) !== null">
                      <button
                        :disabled="downloadingIds.has(extractIdFromStoragePath(member.transcript_file)!)"
                        @click="downloadDocument(extractIdFromStoragePath(member.transcript_file)!)"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed transition"
                      >
                        <span
                          v-if="downloadingIds.has(extractIdFromStoragePath(member.transcript_file)!)"
                          class="w-3.5 h-3.5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"
                        />
                        <Download v-else class="w-3.5 h-3.5" />
                        {{ $t('evaluator.academic_record.download') }}
                      </button>
                    </div>
                    <div v-else class="text-gray-500">{{ $t('evaluator.academic_record.not_uploaded') }}</div>
                  </div>
                </div>
              </div>
              <div v-if="!(applicationDetail.teamMembers?.length ?? 0)" class="text-xs text-gray-400">{{ $t('evaluator.no_team_members') }}</div>
            </div>
          </div>
        </div>

        <!-- ── Sidebar ─────────────────────────────────────────────── -->
        <div class="space-y-4">
          <div class="bg-white rounded-lg border border-gray-100 p-5">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{{ $t('evaluator.overall_evaluation') }}</h3>
            <div class="space-y-3 text-sm text-gray-700">
              <div>
                <p class="font-medium text-gray-900">{{ $t('evaluator.final_decision') }}</p>
                <p>{{ evaluationRecommendation }}</p>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ $t('evaluator.total_score') }}</p>
                <p>{{ applicationDetail.evaluation?.total_score ?? '—' }} / {{ maxScore }}</p>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ $t('evaluator.submitted_at') }}</p>
                <p>{{ formatDate(applicationDetail?.submitted_at) }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg border border-gray-100 p-5">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{{ $t('evaluator.application_history') }}</h3>
            <div class="space-y-3 text-sm text-gray-700">
              <div
                v-for="item in applicationDetail.status_history || applicationDetail.history"
                :key="item.changed_at + item.status"
                class="border border-gray-100 rounded-lg p-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <UiStatusBadge :status="item.status" class="shrink-0" />
                  <p class="text-xs text-gray-500">{{ formatDate(item.changed_at) }}</p>
                </div>
                <p v-if="item.changed_by" class="text-sm font-medium text-navy mt-2">{{ item.changed_by }}</p>
                <p v-if="item.note" class="text-sm text-gray-600 mt-1">{{ item.note }}</p>
              </div>
              <div v-if="!applicationDetail.status_history?.length && !applicationDetail.history?.length" class="text-xs text-gray-400">{{ $t('evaluator.no_history') }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="py-16 text-center text-sm text-gray-500">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChevronLeft, Download } from 'lucide-vue-next'
import { useEvaluatorDashboard } from '~/composables/useEvaluatorDashboard'

const localePath = useLocalePath()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const api = useApi()
const { addToast } = useToast()
const { applicationDetail, fetchApplicationDetail } = useEvaluatorDashboard()

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['evaluator', 'predseda_komisie'],
})

// ── State ──────────────────────────────────────────────────────────────────

const isLoading    = ref(false)
const errorMessage = ref<string | null>(null)

// Answers come directly from the evaluator detail response under `answers: {}`
// No separate API call needed — everything is in GET /evaluator/applications/{id}
const fetchedAnswers = computed<Record<string, unknown>>(
  () => (applicationDetail.value?.answers as Record<string, unknown>) ?? {},
)

// FILE_REF_RE: "[2]", "[3,7]" — same regex as the modal
const FILE_REF_RE = /^\[\s*\d+(\s*,\s*\d+)*\s*\]$/

// Cache: docId → filename (populated lazily on first download)
const fileMetaMap    = ref<Record<number, string>>({})
const downloadingIds = ref<Set<number>>(new Set())

// ── Computed ───────────────────────────────────────────────────────────────

const answersReady = computed(() =>
  !!(applicationDetail.value?.form_fields?.length &&
  Object.keys(fetchedAnswers.value).length > 0),
)

const applicationTitle = computed(() => {
  if (!applicationDetail.value) return t('evaluator.application_detail')
  return (
    applicationDetail.value.projectName ??
    applicationDetail.value.teamName ??
    applicationDetail.value.team?.name ??
    `${t('evaluator.application')} #${applicationDetail.value.id}`
  )
})

const evaluationRecommendation = computed(() => {
  if (!applicationDetail.value?.evaluation?.recommendation) return '—'
  return t(`evaluator.recommendations.${applicationDetail.value.evaluation.recommendation}`)
})

const maxScore = computed(() =>
  (applicationDetail.value?.evaluation?.criteria ?? []).reduce(
    (sum: number, item: any) => sum + (item.max_score ?? 0),
    0,
  ),
)

// ── Answer helpers (mirrors AdminApplicationDetailModal) ───────────────────

/** Get the raw answer value for a field from fetchedAnswers */
function getAnswerRaw(fieldName: string): unknown {
  return fetchedAnswers.value[fieldName] ?? null
}

/**
 * Parse file IDs from a "[2]" or "[3,7]" string.
 * Same logic as the modal's parseFileIds.
 */
function parseFileIds(value: unknown): number[] {
  if (value == null) return []
  const str = String(value).trim()
  if (!FILE_REF_RE.test(str)) return []
  try {
    const parsed = JSON.parse(str)
    if (Array.isArray(parsed)) return parsed.map(Number).filter((n) => Number.isFinite(n) && n > 0)
  } catch {
    const nums = str.match(/\d+/g)
    if (nums) return nums.map(Number)
  }
  return []
}

/** Returns file IDs for a field if its answer looks like a file reference */
function getFileIds(fieldName: string): number[] {
  return parseFileIds(getAnswerRaw(fieldName))
}

function isTruthy(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return ['true', '1', 'yes', 'ano', 'áno'].includes(value.toLowerCase().trim())
  if (typeof value === 'number') return value === 1
  return false
}

function formatValue(value: unknown): string {
  if (value == null || value === '') return '—'
  if (typeof value === 'string') return value.trim() || '—'
  if (typeof value === 'boolean') return value ? t('evaluator.academic_record.yes') : t('evaluator.academic_record.no')
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

// ── Extract doc ID from storage path e.g. "/storage/32" → 32 ──────────────

function extractIdFromStoragePath(path: string | null | undefined): number | null {
  if (!path) return null
  const match = path.match(/\/(\d+)$/)
  return match ? Number(match[1]) : null
}

// ── File download ──────────────────────────────────────────────────────────

/**
 * Download a document by ID via GET /documents/{id}/download → blob.
 * Resolves the filename from GET /documents/{id} (cached), then saves.
 * Same pattern as AdminApplicationDetailModal.downloadDocument.
 */
async function downloadDocument(docId: number) {
  if (downloadingIds.value.has(docId)) return

  downloadingIds.value = new Set([...downloadingIds.value, docId])

  try {
    // Resolve filename if not cached yet
    if (!fileMetaMap.value[docId]) {
      try {
        const meta = (await api.get(`/documents/${docId}`)) as any
        fileMetaMap.value[docId] =
          meta?.current_version?.file_name ??
          meta?.data?.current_version?.file_name ??
          `dokument-${docId}`
      } catch {
        fileMetaMap.value[docId] = `dokument-${docId}`
      }
    }

    // Fetch blob
    const blob: Blob = await api.get(`/documents/${docId}/download`, {
      responseType: 'blob',
    })

    const url = URL.createObjectURL(blob)
    const a   = document.createElement('a')
    a.href     = url
    a.download = fileMetaMap.value[docId]
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    addToast({ message: t('evaluator.download_failed'), type: 'error' })
  } finally {
    const next = new Set(downloadingIds.value)
    next.delete(docId)
    downloadingIds.value = next
  }
}

// ── Data loading ───────────────────────────────────────────────────────────

async function loadApplication() {
  const applicationId = Number(route.params.id)
  if (!applicationId) return

  isLoading.value    = true
  errorMessage.value = null

  try {
    await fetchApplicationDetail(applicationId)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : t('evaluator.loading_detail_error')
  } finally {
    isLoading.value = false
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '—'
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) return dateString
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  const day   = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${date.getFullYear()}`
}

const goBackToEvaluation = () => {
  router.push(localePath(`/hodnotenie/${route.params.id}`))
}

onMounted(loadApplication)
</script>