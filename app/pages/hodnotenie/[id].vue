<template>
  <div class="min-h-screen bg-gray-50/60">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">

      <div class="flex items-center justify-between mb-7">
        <NuxtLink
          :to="localePath('/hodnotenie/zoznam')"
          class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors font-medium"
        >
          <ChevronLeft class="w-4 h-4" />
          {{ $t('evaluator.back_to_list') }}
        </NuxtLink>

        <div class="hidden md:flex items-center gap-1">
          <button
            v-for="lang in ['sk', 'en']"
            :key="lang"
            @click="setLocale(lang)"
            :class="[
              'px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 uppercase tracking-wide',
              locale === lang
                ? 'bg-navy text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300',
            ]"
          >
            {{ lang }}
          </button>
        </div>
      </div>

      <template v-if="!application">
        <div class="space-y-4">
          <div class="h-32 bg-white rounded-xl border border-gray-100 animate-pulse" />
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div class="lg:col-span-2 space-y-4">
              <div class="h-64 bg-white rounded-xl border border-gray-100 animate-pulse" />
              <div class="h-48 bg-white rounded-xl border border-gray-100 animate-pulse" />
            </div>
            <div class="space-y-4">
              <div class="h-40 bg-white rounded-xl border border-gray-100 animate-pulse" />
              <div class="h-40 bg-white rounded-xl border border-gray-100 animate-pulse" />
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <h1 class="text-2xl font-bold text-navy truncate">{{ application.projectName }}</h1>
                <UiStatusBadge :status="application.status" />
                <span
                  class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold tracking-wide"
                  :class="application.program === 'A' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'"
                >
                  Program {{ application.program }}
                </span>
                <span
                  v-if="application.category"
                  class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium"
                >
                  {{ application.category.name }}
                </span>
              </div>
              <p class="text-sm text-gray-500">
                <span class="font-medium text-gray-700">{{ application.teamName }}</span>
                · {{ $t('evaluator.submitted_label') }} {{ formatDate(application.submittedAt) }}
              </p>
              <NuxtLink
                :to="localePath(`/hodnotenie/detail/${application.id}`)"
                class="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                <ExternalLink class="w-3.5 h-3.5" />
                {{ $t('evaluator.view_application_detail') }}
              </NuxtLink>
            </div>

            <div class="flex items-center gap-3 shrink-0">
              <div
                v-if="isReadOnly"
                class="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg"
              >
                <Lock class="w-3.5 h-3.5" />
                Iba na čítanie
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div class="lg:col-span-2 space-y-5">

            <div v-if="application.description" class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <SectionHeader :icon="FileText" :title="$t('evaluator.application_label')" iconClass="text-blue-500" />
              <p class="text-sm text-gray-700 leading-relaxed mt-4">{{ application.description }}</p>
            </div>

            <div v-if="formItems.length" class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <SectionHeader :icon="ClipboardList" :title="t('common.answers')" iconClass="text-indigo-500" />
              <div class="mt-4 space-y-3">
                <div
                  v-for="item in formItems"
                  :key="item.fieldName"
                  class="rounded-lg border border-gray-100 bg-gray-50/50 p-3.5"
                >
                  <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    {{ item.label }}
                  </p>

                  <div v-if="item.isFile">
                    <span v-if="!item.documentIds.length" class="text-sm text-gray-400 italic">—</span>
                    <div v-else class="flex flex-wrap gap-2">
                      <button
                        v-for="docId in item.documentIds"
                        :key="docId"
                        @click="downloadDocument(docId)"
                        :disabled="downloadingIds.has(docId)"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 disabled:opacity-60 transition"
                      >
                        <Loader2 v-if="downloadingIds.has(docId)" class="w-3.5 h-3.5 animate-spin" />
                        <Download v-else class="w-3.5 h-3.5" />
                        {{ docMetaMap[docId]?.name ?? `Súbor #${docId}` }}
                      </button>
                    </div>
                  </div>

                  <span v-else-if="item.isBoolean" class="inline-flex items-center gap-1 text-sm font-medium"
                    :class="(item.value === '1' || item.value === true) ? 'text-success-600' : 'text-gray-500'"
                  >
                    <CheckCircle2 v-if="item.value === '1' || item.value === true" class="w-4 h-4" />
                    <XCircle v-else class="w-4 h-4" />
                    {{ (item.value === '1' || item.value === true) ? 'Áno' : 'Nie' }}
                  </span>

                  <span v-else-if="item.isDate" class="text-sm text-gray-700 font-medium">
                    {{ formatDate(item.value) || '—' }}
                  </span>

                  <p v-else-if="item.isLongText" class="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {{ item.value || '—' }}
                  </p>

                  <div v-else-if="item.isArray" class="flex flex-wrap gap-1.5">
                    <span
                      v-for="(val, i) in item.arrayValues"
                      :key="i"
                      class="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium"
                    >
                      {{ val }}
                    </span>
                  </div>

                  <span v-else class="text-sm text-gray-700 font-medium">
                    {{ item.value || '—' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <SectionHeader :icon="Star" :title="$t('evaluator.scoring_form')" iconClass="text-amber-400" />
              <p class="text-xs text-gray-400 mt-1 mb-5">{{ $t('evaluator.scoring_instructions') }}</p>

              <div class="space-y-4">
                <div
                  v-for="criterion in scoringForm.criteria"
                  :key="criterion.id"
                  class="border border-gray-100 rounded-xl p-4 transition-colors"
                  :class="isReadOnly ? 'bg-gray-50/50' : 'hover:border-blue-100 hover:bg-blue-50/20'"
                >
                  <div class="flex items-start justify-between gap-3 mb-3">
                    <p class="font-medium text-navy text-sm">{{ criterion.name }}</p>
                    <span class="text-xs text-gray-400 shrink-0">
                      max {{ criterion.max_score }} {{ $t('evaluator.points') }}
                    </span>
                  </div>

                  <div class="flex items-center gap-3 mb-3">
                    <div class="relative flex items-center">
                      <input
                        type="number"
                        :min="0"
                        :max="criterion.max_score"
                        :value="criterion.score ?? ''"
                        :disabled="isReadOnly"
                        @input="updateCriterionScore(criterion, $event)"
                        class="w-20 px-2 py-1.5 rounded-lg border text-sm text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:bg-gray-50 disabled:text-gray-400"
                        :class="criterionScoreColor(criterion)"
                      />
                    </div>
                    <div class="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-300"
                        :class="criterionBarColor(criterion)"
                        :style="{ width: criterionPct(criterion) + '%' }"
                      />
                    </div>
                    <span class="text-xs text-gray-400 shrink-0">/ {{ criterion.max_score }}</span>
                  </div>

                  <textarea
                    v-model="criterion.comment"
                    :disabled="isReadOnly"
                    :placeholder="t('evaluator.comment_placeholder', { criterion: safeLower(criterion.name) })"
                    rows="2"
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition disabled:bg-gray-50 disabled:text-gray-400 placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div class="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p class="text-xs text-gray-500 mb-0.5">{{ $t('evaluator.total_score') }}</p>
                  <div class="flex items-baseline gap-1">
                    <span class="text-3xl font-bold" :class="totalScoreColor">{{ totalScore }}</span>
                    <span class="text-gray-400 text-sm">/ {{ maxTotalScore }}</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold" :class="totalScoreColor">{{ totalScorePercent }}%</div>
                  <p class="text-xs font-medium mt-0.5" :class="totalScoreColor">
                    {{ $t(`evaluator.scoring_label.${scoringLabelKey}`) }}
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <SectionHeader :icon="MessageSquare" :title="$t('evaluator.overall_comment')" iconClass="text-blue-500" />
              <div class="mt-4 space-y-5">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    {{ $t('evaluator.internal_note_label') }}
                  </label>
                  <textarea
                    v-model="scoringForm.internalNote"
                    :disabled="isReadOnly"
                    :placeholder="$t('evaluator.internal_note_placeholder')"
                    rows="3"
                    class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition disabled:bg-gray-50 placeholder:text-gray-300"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ $t('evaluator.recommendation_label') }}
                  </label>
                  <div class="grid grid-cols-3 gap-2">
                    <button
                      v-for="rec in recommendations"
                      :key="rec.value"
                      type="button"
                      :disabled="isReadOnly"
                      @click="scoringForm.recommendation = rec.value"
                      class="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      :class="scoringForm.recommendation === rec.value ? rec.activeClass : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'"
                    >
                      <component :is="rec.icon" class="w-4 h-4" />
                      {{ $t(rec.label) }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="isEvaluating && !isSubmitted" class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <SectionHeader :icon="Gavel" :title="$t('evaluator.submit_section')" iconClass="text-blue-500" />

              <div v-if="submitError" class="mt-4 flex items-center gap-2 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
                <AlertCircle class="w-4 h-4 shrink-0" /> {{ submitError }}
              </div>

              <p v-if="lastAutoSaveTime" class="mt-3 text-xs text-gray-400 text-center">
                {{ $t('evaluator.auto_saved') }}: {{ lastAutoSaveTime }}
              </p>

              <div class="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  @click="handleSaveDraft"
                  :disabled="isSubmitting"
                  class="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
                >
                  {{ $t('evaluator.save_draft') }}
                </button>
                <button
                  @click="handleSubmit"
                  :disabled="isSubmitting || !scoringForm.recommendation"
                  class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
                  {{ isSubmitting ? $t('evaluator.submitting') : $t('evaluator.submit') }}
                </button>
              </div>
              <p v-if="!scoringForm.recommendation" class="text-xs text-gray-400 mt-2 text-center">
                {{ $t('evaluator.error.select_recommendation') }}
              </p>
            </div>

            <div
              v-else-if="isSubmitted"
              class="bg-success-50 border border-success-200 rounded-xl p-5 flex items-center gap-3"
            >
              <div class="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center shrink-0">
                <CheckCircle class="w-5 h-5 text-success-500" />
              </div>
              <div>
                <p class="font-semibold text-success-700">{{ $t('evaluator.submitted_title') }}</p>
                <p class="text-xs text-success-600 mt-0.5">{{ $t('evaluator.submitted_message') }}</p>
              </div>
            </div>

          </div>

          <div class="space-y-4">

            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                {{ $t('evaluator.sidebar.students') }}
              </h3>

              <div v-if="application.teamMembers.length" class="mt-3 space-y-2">
                <div
                  v-for="member in application.teamMembers"
                  :key="member.id"
                  class="text-xs rounded-lg bg-gray-50 px-3 py-2 border border-gray-100"
                >
                  <p class="font-semibold text-gray-700">{{ member.name }}</p>
                  <p v-if="member.school || member.study_program || member.study_year" class="text-gray-500 mt-0.5">
                    {{ [member.school, member.study_program, member.study_year].filter(Boolean).join(' · ') }}
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-2.5">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                {{ $t('evaluator.sidebar.info') }}
              </h3>
              <MetaRow :label="$t('evaluator.sidebar.program')">
                <span class="font-semibold text-navy">Program {{ application.program }}</span>
              </MetaRow>
              <MetaRow v-if="application.category" :label="$t('evaluator.category')">
                <span class="font-medium text-navy">{{ application.category.name }}</span>
              </MetaRow>
              <MetaRow :label="$t('evaluator.sidebar.submitted')">
                <span class="font-medium text-navy">{{ formatDate(application.submittedAt) }}</span>
              </MetaRow>
              
            </div>

            <div v-if="isCommissionChair" class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Rozhodnutie predsedu komisie
              </h3>
              <p class="text-sm text-gray-600">{{ $t('evaluator.chair.instructions') }}</p>
              <div class="grid gap-2">
                <button
                  type="button"
                  @click="handleStatusChange('schvalene')"
                  :disabled="isUpdatingStatus"
                  class="w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-success-600 hover:bg-success-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  <ThumbsUp class="w-4 h-4" /> {{ $t('evaluator.chair.approve') }}
                </button>
                <button
                  type="button"
                  @click="handleStatusChange('zamietnute')"
                  :disabled="isUpdatingStatus"
                  class="w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-danger-600 hover:bg-danger-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  <ThumbsDown class="w-4 h-4" /> {{ $t('evaluator.chair.reject') }}
                </button>
                <button
                  type="button"
                  @click="handleStatusChange('vyziadane_doplnenie')"
                  :disabled="isUpdatingStatus"
                  class="w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  <RotateCcw class="w-4 h-4" /> {{ $t('evaluator.chair.request_supplement') }}
                </button>
              </div>
              <p v-if="statusError" class="text-sm text-danger-600">{{ statusError }}</p>

              <div v-if="allEvaluations.length" class="pt-4 border-t border-gray-100">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {{ $t('evaluator.chair.evaluations_title') }}
                </h4>
                <div class="space-y-2.5">
                  <div
                    v-for="evaluation in allEvaluations"
                    :key="evaluation.id"
                    class="rounded-lg border border-gray-100 p-3 bg-gray-50/50"
                  >
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-semibold text-navy">{{ evaluation.evaluator.name }}</p>
                        <p class="text-xs text-gray-400">{{ formatDate(evaluation.submitted_at) }}</p>
                      </div>
                      <span class="text-sm font-bold text-navy">{{ evaluation.total_score }}</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1.5">
                      {{ $t(`evaluator.recommendations.${evaluation.recommendation}`) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import {
  ChevronLeft,
  FileText,
  Star,
  MessageSquare,
  Gavel,
  CheckCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Lock,
  ExternalLink,
  GraduationCap,
  HelpCircle,
  ClipboardList,
  ShieldCheck,
  ShieldX,
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useEvaluatorDashboard } from '~/composables/useEvaluatorDashboard'
import type { ApplicationDetail, Evaluation, EvaluationCriterion } from '~/types/evaluator'

// ── Inline sub-components ──────────────────────────────────────

const SectionHeader = defineComponent({
  props: { icon: Object, title: String, iconClass: String },
  setup(props) {
    return () =>
      h('h2', { class: 'text-base font-semibold text-navy flex items-center gap-2' }, [
        h(props.icon as any, { class: `w-4 h-4 ${props.iconClass ?? ''}` }),
        props.title,
      ])
  },
})

const MetaRow = defineComponent({
  props: { label: String },
  slots: ['default'],
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'flex items-center justify-between text-sm' }, [
        h('span', { class: 'text-gray-500' }, props.label),
        h('span', {}, slots.default?.()),
      ])
  },
})

// ── Page meta ──────────────────────────────────────────────────

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['evaluator'],
})

// ── Composables ────────────────────────────────────────────────

const localePath = useLocalePath()
const { setLocale, locale, t } = useI18n()
const { addToast } = useToast()
const auth = useAuthStore()
const api = useApi()
const route = useRoute()
const router = useRouter()

const {
  fetchApplicationDetail,
  fetchAllEvaluations,
  submitEvaluation,
  updateEvaluation,
  updateApplicationStatus,
  requestSupplement,
  allEvaluations,
  hasSubmittedEvaluation,
} = useEvaluatorDashboard()

useHead({ title: 'Hodnotenie prihlášky | NTI Komisia' })

// ── Types ──────────────────────────────────────────────────────



type EvaluatorApplicationView = {
  id: number
  projectName: string
  teamName: string
  program: string
  status: string
  submittedAt: string
  evaluationDeadline: string
  avgScore: number | null
  description: string
  documents: { id: number; name: string; url: string }[]
  teamMembers: Array<{
    id: number
    name: string
    role: string
    school?: string | null
    study_program?: string | null
    study_year?: string | null
  }>
  commissionMembers: { id: number; name: string; score: number | null }[]
  academic_flag: boolean | null
  category?: { id: number; name: string } | null
  answers: Record<string, unknown>
  formFields: Array<{
    name: string
    label: string
    type: string
    placeholder?: string | null
    description?: string | null
    options?: string[] | null
  }>
}

type ScoringCriterionView = {
  id: number
  name: string
  max_score: number
  score: number | null
  comment: string
}

// ── State ──────────────────────────────────────────────────────

const application = ref<EvaluatorApplicationView | null>(null)
const currentEvaluation = ref<Evaluation | null>(null)

const scoringForm = reactive({
  criteria: [] as ScoringCriterionView[],
  internalNote: '',
  recommendation: '' as '' | 'approve' | 'reject' | 'supplement',
})

const isSubmitting = ref(false)
const isUpdatingStatus = ref(false)
const submitError = ref<string | null>(null)
const statusError = ref<string | null>(null)
const lastAutoSaveTime = ref<string | null>(null)

  const buildPayload = (isFinal = false) => ({
  criteria: scoringForm.criteria.map(c => ({
    name: c.name,
    max_score: c.max_score,
    score: c.score,
    comment: c.comment,
  })),
  internal_note: scoringForm.internalNote,
  recommendation: scoringForm.recommendation,
  is_final: isFinal,
})

// ── Computed flags ─────────────────────────────────────────────

const isEvaluating = computed(() => application.value?.status === 'evaluating')

// FIX: Spoliehame sa výhradne na príznak `locked`, ak backend v drafte vracia predvyplnené submitted_at
const isSubmitted = computed(() => {
  return currentEvaluation.value?.locked === true
})

const isReadOnly = computed(() => !isEvaluating.value || isSubmitted.value)
const isCommissionChair = computed(() => auth.hasRole('predseda_komisie'))

// ── Document handling ──────────────────────────────────────────

const docMetaMap = reactive<Record<number, { name: string }>>({})
const downloadingIds = ref<Set<number>>(new Set())

function parseDocumentIds(val: unknown): number[] {
  if (val == null || val === '') return []
  if (typeof val === 'number' && Number.isFinite(val) && val > 0) return [val]
  if (Array.isArray(val)) return val.map(Number).filter(n => Number.isFinite(n) && n > 0)
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val) as unknown
      if (Array.isArray(parsed)) return parsed.map(Number).filter(n => Number.isFinite(n) && n > 0)
      if (typeof parsed === 'number' && parsed > 0) return [parsed]
    } catch {
      if (/^\d+$/.test(val)) return [Number(val)]
    }
  }
  return []
}

async function loadDocumentMeta(ids: number[]) {
  const fresh = ids.filter(id => !docMetaMap[id])
  if (!fresh.length) return
  await Promise.allSettled(
    fresh.map(async id => {
      try {
        const res = (await api.get(`/documents/${id}`)) as any
        const doc = res?.data ?? res
        docMetaMap[id] = { name: doc?.original_name ?? doc?.name ?? `Súbor #${id}` }
      } catch {
        docMetaMap[id] = { name: `Súbor #${id}` }
      }
    }),
  )
}

async function downloadDocument(docId: number) {
  if (downloadingIds.value.has(docId)) return
  downloadingIds.value = new Set([...downloadingIds.value, docId])
  try {
    const blob: Blob = await api.get(`/documents/${docId}/download`, { responseType: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = docMetaMap[docId]?.name ?? `dokument-${docId}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    addToast({ message: 'Stiahnutie súboru zlyhalo.', type: 'error' })
  } finally {
    const next = new Set(downloadingIds.value)
    next.delete(docId)
    downloadingIds.value = next
  }
}

// ── Form items (answer renderer) ──────────────────────────────

const formItems = computed(() => {
  if (!application.value) return []
  const answers = application.value.answers
  const fields = application.value.formFields

  return Object.entries(answers).map(([key, val]) => {
    const def = fields.find(f => f.name === key)
    const type = def?.type ?? 'text'
    const documentIds = type === 'file' ? parseDocumentIds(val) : []

    let arrayValues: string[] = []
    if (type === 'multiselect' || type === 'checkboxgroup') {
      try {
        const parsed = typeof val === 'string' ? JSON.parse(val) : val
        arrayValues = Array.isArray(parsed) ? parsed.map(String) : []
      } catch {
        arrayValues = []
      }
    }

    return {
      fieldName: key,
      label: def?.label ?? key,
      value: val,
      isFile: type === 'file',
      isBoolean: type === 'checkbox',
      isDate: type === 'date',
      isLongText: type === 'textarea',
      isArray: type === 'multiselect' || type === 'checkboxgroup',
      documentIds,
      arrayValues,
    }
  })
})



// ── Mapping helpers ────────────────────────────────────────────

const mapApplication = (detail: ApplicationDetail): EvaluatorApplicationView => ({
  id: detail.id,
  projectName: detail.projectName ?? detail.teamName ?? `Prihláška #${detail.id}`,
  teamName: detail.teamName ?? detail.team?.name ?? '',
  program: detail.program ?? detail.call?.program ?? '',
  status: detail.status,
  submittedAt: detail.submitted_at,
  evaluationDeadline: detail.deadline ?? detail.call?.deadline ?? '',
  avgScore: detail.avgScore ?? null,
  description: detail.description ?? '',
  documents: (detail.documents ?? []).map((d: any) => ({
    id: d.id,
    name: d.type ?? `Dokument #${d.id}`,
    url: d.url ?? '',
  })),
  teamMembers: (detail.teamMembers ?? []).map((m: any) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    school: m.school ?? null,
    study_program: m.study_program ?? null,
    study_year: m.study_year ?? null,
  })),
  commissionMembers: (detail.commissionMembers ?? []).map((m: any) => ({
    id: m.id,
    name: m.name,
    score: m.score ?? null,
  })),
  academic_flag: detail.academic_flag ?? null,
  category: detail.category ?? null,
  answers: (detail as any).answers ?? {},
  formFields: (detail as any).form_fields ?? [],
})

const syncScoringForm = (detail: ApplicationDetail) => {
  const criteriaSource =
    (detail as any).evaluation?.criteria?.length
      ? (detail as any).evaluation.criteria
      : (detail as any).call?.criteria?.length
        ? (detail as any).call.criteria
        : []

  scoringForm.criteria = criteriaSource.map((c: any, i: number) => ({
    id: i + 1,
    name: c.name,
    max_score: c.max_score ?? 20,
    score: c.score ?? null,
    comment: c.comment ?? '',
  }))
  scoringForm.internalNote = (detail as any).evaluation?.internal_note ?? ''
  scoringForm.recommendation = (detail as any).evaluation?.recommendation ?? ''
}

// ── Data loading ───────────────────────────────────────────────

const loadApplication = async () => {
  const id = Number(route.params.id)
  const detail = await fetchApplicationDetail(id)
  if (!detail) return

  application.value = mapApplication(detail)
  currentEvaluation.value = (detail as any).evaluation ?? null
  syncScoringForm(detail)

  if (isCommissionChair.value) {
    await fetchAllEvaluations(id)
  }
}

onMounted(loadApplication)

// ── Scoring computed ───────────────────────────────────────────

const totalScore = computed(() =>
  scoringForm.criteria.reduce((s, c) => s + (c.score ?? 0), 0),
)
const maxTotalScore = computed(() =>
  scoringForm.criteria.reduce((s, c) => s + c.max_score, 0),
)
const totalScorePercent = computed(() =>
  maxTotalScore.value > 0 ? Math.round((totalScore.value / maxTotalScore.value) * 100) : 0,
)
const scoringLabelKey = computed(() => {
  const p = totalScorePercent.value
  if (p >= 80) return 'excellent'
  if (p >= 65) return 'good'
  if (p >= 50) return 'sufficient'
  return 'insufficient'
})
const totalScoreColor = computed(() => {
  const p = totalScorePercent.value
  if (p >= 80) return 'text-success-500'
  if (p >= 65) return 'text-blue-600'
  if (p >= 50) return 'text-warning-500'
  return 'text-danger-500'
})

const criterionPct = (c: ScoringCriterionView) =>
  c.max_score > 0 ? Math.min(100, Math.max(0, ((c.score ?? 0) / c.max_score) * 100)) : 0

const criterionBarColor = (c: ScoringCriterionView) => {
  const p = criterionPct(c)
  if (p >= 80) return 'bg-success-400'
  if (p >= 50) return 'bg-blue-400'
  if (p > 0) return 'bg-warning-400'
  return 'bg-gray-200'
}

const criterionScoreColor = (c: ScoringCriterionView) => {
  if (c.score === null) return 'border-gray-200 text-gray-400'
  if (c.score > c.max_score) return 'border-danger-300 text-danger-600'
  if (c.score < 0) return 'border-danger-300 text-danger-600'
  return 'border-blue-200 text-blue-700'
}

// ── Recommendations config ─────────────────────────────────────

const recommendations = [
  {
    value: 'approve' as const,
    label: 'evaluator.recommendations.approve',
    icon: ThumbsUp,
    activeClass: 'border-success-300 bg-success-50 text-success-700',
  },
  {
    value: 'supplement' as const,
    label: 'evaluator.recommendations.supplement',
    icon: RotateCcw,
    activeClass: 'border-warning-300 bg-warning-50 text-warning-700',
  },
  {
    value: 'reject' as const,
    label: 'evaluator.recommendations.reject',
    icon: ThumbsDown,
    activeClass: 'border-danger-300 bg-danger-50 text-danger-700',
  },
]

// ── Payload building ───────────────────────────────────────────

const persistEvaluation = async (
  notify = false,
  isFinal = false,
) => {
  if (!application.value) return

  const payload = buildPayload(isFinal)
  const evaluationId = currentEvaluation.value?.id

  const saved = evaluationId
    ? await updateEvaluation(
        application.value.id,
        evaluationId,
        payload,
      )
    : await submitEvaluation(
        application.value.id,
        payload,
      )

  if (saved) {
    currentEvaluation.value = saved
  }

  const refreshed = await fetchApplicationDetail(
    application.value.id,
  )

  if (refreshed) {
    application.value = mapApplication(refreshed)

    currentEvaluation.value =
      (refreshed as any).evaluation ??
      currentEvaluation.value

    syncScoringForm(refreshed)
  }

  if (notify) {
    addToast({
      message: isFinal
        ? 'Hodnotenie bolo úspešne odoslané.'
        : 'Koncept bol úspešne uložený.',
      type: 'success',
    })
  }
}

// ── Auto-save ──────────────────────────────────────────────────

const { markDirty } = useAutoSave({
  debounceMs: 30_000,
  onSave: async () => {
    try {
      if (!scoringForm.recommendation || isReadOnly.value) return
      await persistEvaluation(false, false)
      lastAutoSaveTime.value = new Date().toLocaleTimeString('sk-SK')
    } catch (err) {
      console.error('Auto-save failed:', err)
    }
  },
})

watch(
  () => scoringForm,
  () => {
    if (!isReadOnly.value && scoringForm.recommendation) markDirty()
  },
  { deep: true },
)

// ── Validation ─────────────────────────────────────────────────

const validate = (): boolean => {
  if (isReadOnly.value) {
    submitError.value = t('evaluator.errors.locked')
    return false
  }
  if (!scoringForm.recommendation) {
    submitError.value = t('evaluator.errors.select_recommendation')
    return false
  }
  const invalid = scoringForm.criteria.find(
    c => c.score === null || c.score < 0 || c.score > c.max_score,
  )
  if (invalid) {
    submitError.value = t('evaluator.errors.invalid_score', { criterion: invalid.name })
    return false
  }
  return true
}

// ── Actions ────────────────────────────────────────────────────

const handleSaveDraft = async () => {
  isSubmitting.value = true
  submitError.value = null
  try {
    if (!validate()) return
    await persistEvaluation(true, false)
    lastAutoSaveTime.value = new Date().toLocaleTimeString('sk-SK')
  } catch (err) {
    submitError.value = err instanceof Error ? err.message : 'Nastala chyba pri ukladaní.'
  } finally {
    isSubmitting.value = false
  }
}

const handleSubmit = async () => {
  if (!validate()) return
  isSubmitting.value = true
  submitError.value = null
  try {
    await persistEvaluation(true, true)
  } catch (err) {
    submitError.value = err instanceof Error ? err.message : 'Nastala chyba pri odosielaní.'
  } finally {
    isSubmitting.value = false
  }
}

const handleStatusChange = async (
  status: 'schvalene' | 'zamietnute' | 'vyziadane_doplnenie',
) => {
  if (!application.value) return
  statusError.value = null
  isUpdatingStatus.value = true
  try {
    await updateApplicationStatus(application.value.id, status)
    await loadApplication()
  } catch (err) {
    statusError.value = err instanceof Error ? err.message : t('evaluator.chair.status_error')
  } finally {
    isUpdatingStatus.value = false
  }
}

// ── Utility ────────────────────────────────────────────────────

const safeLower = (v?: string | null) => v?.toLowerCase() ?? ''

const formatDate = (s?: string | null): string => {
  if (!s) return '—'
  const d = s.length === 10 ? new Date(`${s}T00:00:00`) : new Date(s)
  if (isNaN(d.getTime())) return s
  return new Intl.DateTimeFormat('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

const initials = (name: string) =>
  name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

const updateCriterionScore = (criterion: ScoringCriterionView, event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.value) {
    criterion.score = null
    return
  }
  const n = Number(target.value)
  criterion.score = Number.isFinite(n) ? n : null
}
</script>