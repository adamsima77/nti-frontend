<!-- pages/hodnotenie/[id].vue -->
<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <div class="flex items-start justify-between mb-6">
      <!-- Back -->
      <NuxtLink
        :to="localePath('/hodnotenie/zoznam')"
        class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors"
      >
        <ChevronLeft class="w-4 h-4" /> {{ $t('evaluator.back_to_list') }}
      </NuxtLink>

      <!-- Locale Switcher (copied pattern) -->
      <div class="hidden md:flex items-center gap-1 ml-4">
        <button
          :class="[
            'px-2 py-1 text-xs font-medium rounded transition-colors duration-200',
            locale === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
          :title="$t('locale.en_title')"
          @click="setLocale('en')"
        >
          EN
        </button>
        <button
          :class="[
            'px-2 py-1 text-xs font-medium rounded transition-colors duration-200',
            locale === 'sk' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
          :title="$t('locale.sk_title')"
          @click="setLocale('sk')"
        >
          SK
        </button>
      </div>
    </div>

    <template v-if="application">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <h1 class="text-2xl font-bold text-navy">{{ application.projectName }}</h1>
            <UiStatusBadge :status="application.status" />
            <span
              v-if="application.category"
              class="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700"
            >
              {{ application.category.name }}
            </span>
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium"
              :class="application.program === 'A' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'"
            >
              {{ $t('evaluator.program_label') }} {{ application.program }}
            </span>
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium"
              :class="academicFlagBadgeClass"
            >
              {{ academicFlagLabel }}
            </span>
          </div>
          <p class="text-gray-500 text-sm">{{ application.teamName }} · {{ $t('evaluator.submitted_label') }} {{ formatDate(application.submittedAt) }}</p>
          <div class="mt-4 sm:mt-2">
            <NuxtLink
              :to="localePath(`/hodnotenie/detail/${application.id}`)"
              class="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {{ $t('evaluator.view_application_detail') }}
            </NuxtLink>
          </div>
        </div>
        <!-- Overall commission score if available -->
          <div
            v-if="application.avgScore !== null"
            class="shrink-0 text-center bg-white border border-gray-100 rounded-lg px-5 py-3"
          >
            <p class="text-3xl font-bold text-navy">{{ application.avgScore }}</p>
            <p class="text-xs text-gray-400">{{ $t('evaluator.commission_avg') }}</p>
          </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: application info + scoring -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Application info -->
          <div class="bg-white rounded-lg border border-gray-100 p-6">
            <h2 class="text-base font-semibold text-navy mb-4 flex items-center gap-2">
              <FileText class="w-4 h-4 text-blue-500" /> {{ $t('evaluator.application_label') }}
            </h2>
            <div class="space-y-3 text-sm">
              <p class="text-gray-700 leading-relaxed">{{ application.description }}</p>
              <div class="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
                <div
                  v-for="doc in application.documents"
                  :key="doc.name"
                >
                  <a
                    :href="doc.url"
                    target="_blank"
                    class="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-xs"
                  >
                    <Paperclip class="w-3.5 h-3.5" /> {{ doc.name }}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Evaluator section ── -->
          <div class="mb-4">
            <h2 class="text-lg font-semibold text-navy">Vaše hodnotenie</h2>
          </div>

          <!-- ── Scoring form ── -->
          <div class="bg-white rounded-lg border border-gray-100 p-6">
            <h2 class="text-base font-semibold text-navy mb-1 flex items-center gap-2">
              <Star class="w-4 h-4 text-warning-500" /> {{ $t('evaluator.scoring_form') }}
            </h2>
            <p class="text-xs text-gray-400 mb-5">{{ $t('evaluator.scoring_instructions') }}</p>

            <div class="space-y-5">
              <div
                v-for="criterion in scoringForm.criteria"
                :key="criterion.id"
                class="border border-gray-100 rounded-lg p-4"
              >
                <div class="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p class="font-medium text-navy text-sm">{{ criterion.name }}</p>
                  </div>
                  <div class="shrink-0 text-right">
                    <span class="text-xs text-gray-400">{{ $t('evaluator.max_points', { n: criterion.max_score }) }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-3 mb-3">
                  <input
                    type="number"
                    :min="0"
                    :max="criterion.max_score"
                    :value="criterion.score ?? ''"
                    :disabled="isReadOnly"
                    @input="updateCriterionScore(criterion, $event)"
                    class="w-24 px-2 py-1 rounded border border-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50"
                  />
                  <span class="text-xs text-gray-400">/ {{ criterion.max_score }}</span>
                </div>

                <textarea
                  v-model="criterion.comment"
                  :disabled="isReadOnly"
                  :placeholder="t('evaluator.comment_placeholder', { criterion: safeLower(criterion.name) })"
                  rows="2"
                  class="w-full px-3 py-2 rounded-md border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>

            <!-- Total score -->
            <div class="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">{{ $t('evaluator.total_score') }}</p>
                <div class="flex items-baseline gap-1">
                  <span
                    class="text-3xl font-bold"
                    :class="totalScoreColor"
                  >{{ totalScore }}</span>
                  <span class="text-gray-400 text-sm">/ {{ maxTotalScore }} {{ $t('evaluator.points') }}</span>
                </div>
              </div>
              <div class="text-right">
                <div
                  class="text-2xl font-bold"
                  :class="totalScoreColor"
                >
                  {{ totalScorePercent }}%
                </div>
                <p
                  class="text-xs"
                  :class="totalScoreColor"
                >
                  {{ $t(`evaluator.scoring_label.${scoringLabelKey()}`) }}
                </p>
              </div>
            </div>
          </div>

          <!-- General comment + recommendation -->
          <div class="bg-white rounded-lg border border-gray-100 p-6">
            <h2 class="text-base font-semibold text-navy mb-4 flex items-center gap-2">
              <MessageSquare class="w-4 h-4 text-blue-500" /> {{ $t('evaluator.overall_comment') }}
            </h2>
            <div class="space-y-4">
              <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('evaluator.internal_note_label') }}</label>
                  <textarea
                    v-model="scoringForm.internalNote"
                    :disabled="isReadOnly"
                    :placeholder="$t('evaluator.internal_note_placeholder')"
                    rows="3"
                    class="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none disabled:bg-gray-50"
                  />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('evaluator.recommendation_label') }}</label>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    v-for="rec in recommendations"
                    :key="rec.value"
                    type="button"
                    :disabled="isReadOnly"
                    @click="scoringForm.recommendation = rec.value"
                    class="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="
                      scoringForm.recommendation === rec.value
                        ? rec.activeClass
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    "
                  >
                    <component
                      :is="rec.icon"
                      class="w-4 h-4"
                    />
                    {{ $t(rec.label) }}</button>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Decision section ── -->
          <div
            v-if="!isSubmitted"
            class="bg-white rounded-lg border border-gray-100 p-6"
          >
            <h2 class="text-base font-semibold text-navy mb-4 flex items-center gap-2">
              <Gavel class="w-4 h-4 text-blue-500" /> {{ $t('evaluator.submit_section') }}
            </h2>

            <!-- Request supplement option -->
            <div class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label class="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="scoringForm.requestSupplement"
                  :disabled="isReadOnly"
                  class="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <div>
                  <p class="text-sm font-medium text-navy">{{ $t('evaluator.request_supplement') }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ $t('evaluator.supplement_hint') }}</p>
                </div>
              </label>
                <div
                  v-if="scoringForm.requestSupplement"
                  class="mt-3 ml-7"
                >
                  <textarea
                    v-model="scoringForm.supplementNote"
                    :disabled="isReadOnly"
                    :placeholder="t('evaluator.supplement_placeholder')"
                    rows="2"
                    class="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                </div>
            </div>

            <div
              v-if="submitError"
              class="mb-4 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
            >
              <AlertCircle class="w-4 h-4 shrink-0" /> {{ submitError }}
            </div>

            <div
              v-if="lastAutoSaveTime"
              class="mb-4 text-xs text-gray-500 text-center"
            >
                {{ $t('evaluator.auto_saved') }}: {{ lastAutoSaveTime }}
            </div>

            <div class="flex flex-col sm:flex-row gap-3">
              <button
                @click="handleSaveDraft"
                :disabled="isSubmitting || isReadOnly"
                class="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {{ $t('evaluator.save_draft') }}
              </button>
              <button
                @click="handleSubmit"
                :disabled="isSubmitting || isReadOnly || hasSubmittedEvaluation || !scoringForm.recommendation"
                class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg
                  v-if="isSubmitting"
                  class="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                  />
                </svg>
                {{ isSubmitting ? $t('evaluator.submitting') : hasSubmittedEvaluation ? 'Hodnotenie už bolo odoslané.' : $t('evaluator.submit') }}
              </button>
            </div>
            <p
              v-if="!scoringForm.recommendation"
              class="text-xs text-gray-400 mt-2 text-center"
            >
              {{ $t('evaluator.error.select_recommendation') }}
            </p>
          </div>

          <!-- Submitted state -->
          <div
            v-else
            class="bg-success-50 border border-success-200 rounded-lg p-5 flex items-center gap-3"
          >
            <CheckCircle class="w-5 h-5 text-success-500 shrink-0" />
            <div>
              <p class="font-medium text-success-700">{{ $t('evaluator.submitted_title') }}</p>
                <p class="text-xs text-success-600 mt-0.5">
                  {{ $t('evaluator.submitted_message') }}
                </p>
            </div>
          </div>
        </div>

        <!-- Right sidebar -->
        <div class="space-y-4">
          <!-- Commission overview -->
          <div class="bg-white rounded-lg border border-gray-100 p-5">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{{ $t('evaluator.sidebar.commission') }}</h3>
            <div class="space-y-3">
              <div
                v-for="member in application.commissionMembers"
                :key="member.id"
                class="flex items-center justify-between"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500"
                  >
                    {{
                      member.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                    }}
                  </div>
                  <span class="text-sm text-navy">{{ member.name }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span
                    v-if="member.score !== null"
                    class="text-sm font-semibold text-navy"
                  >{{ member.score }}</span>
                  <span
                    v-else
                    class="text-xs text-gray-400 italic"
                  >{{ $t('evaluator.waiting') }}</span>
                </div>
              </div>
            </div>
            <div
              v-if="application.avgScore !== null"
              class="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm"
            >
              <span class="text-gray-500">{{ $t('evaluator.sidebar.average') }}</span>
              <span class="font-bold text-navy">{{ application.avgScore }}/100</span>
            </div>
          </div>

          <!-- Team info -->
          <div class="bg-white rounded-lg border border-gray-100 p-5">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{{ $t('evaluator.sidebar.team') }}</h3>
            <div class="space-y-2">
              <div
                v-for="member in application.teamMembers"
                :key="member.id"
              >
                <p class="text-sm font-medium text-navy">{{ member.name }}</p>
                <p class="text-xs text-gray-400">{{ member.role }}</p>
              </div>
            </div>
          </div>

          <!-- Application meta -->
          <div class="bg-white rounded-lg border border-gray-100 p-5 space-y-3">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">{{ $t('evaluator.sidebar.info') }}</h3>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">{{ $t('evaluator.sidebar.program') }}</span>
              <span class="font-medium text-navy">{{ $t('evaluator.program_label') }} {{ application.program }}</span>
            </div>
            <div v-if="application.category" class="flex justify-between text-sm">
              <span class="text-gray-500">{{ $t('evaluator.category') }}</span>
              <span class="font-medium text-navy">{{ application.category.name }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">{{ $t('evaluator.sidebar.submitted') }}</span>
              <span class="font-medium text-navy">{{ formatDate(application.submittedAt) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">{{ $t('evaluator.sidebar.evaluation_deadline') }}</span>
              <span class="font-medium text-warning-500">{{ formatDate(application.evaluationDeadline) }}</span>
            </div>
            <div class="flex items-center justify-between text-sm gap-3">
              <span class="text-gray-500">{{ $t('evaluator.sidebar.academic_criteria') }}</span>
              <label class="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  :checked="application.academic_flag === true"
                  disabled
                  class="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <span
                  class="text-xs px-2 py-0.5 rounded-full font-medium"
                  :class="academicFlagBadgeClass"
                >
                  {{ academicFlagLabel }}
                </span>
              </label>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">{{ $t('evaluator.sidebar.documents') }}</span>
              <span class="font-medium text-navy">{{ application.documents.length }}</span>
            </div>
          </div>

          <div v-if="isCommissionChair" class="bg-white rounded-lg border border-gray-100 p-5 space-y-4">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Rozhodnutie predsedu komisie</h3>
            <p class="text-sm text-gray-600">{{ $t('evaluator.chair.instructions') }}</p>
            <div class="grid gap-2">
              <button
                type="button"
                @click="handleStatusChange('schvalene')"
                :disabled="isUpdatingStatus"
                class="w-full px-3 py-2 rounded-lg text-sm font-medium text-white bg-success-600 hover:bg-success-700 disabled:opacity-50"
              >
                {{ $t('evaluator.chair.approve') }}
              </button>
              <button
                type="button"
                @click="handleStatusChange('zamietnute')"
                :disabled="isUpdatingStatus"
                class="w-full px-3 py-2 rounded-lg text-sm font-medium text-white bg-danger-600 hover:bg-danger-700 disabled:opacity-50"
              >
                {{ $t('evaluator.chair.reject') }}
              </button>
              <button
                type="button"
                @click="handleStatusChange('vyziadane_doplnenie')"
                :disabled="isUpdatingStatus"
                class="w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                {{ $t('evaluator.chair.request_supplement') }}
              </button>
            </div>
            <div v-if="statusError" class="text-sm text-danger-600">{{ statusError }}</div>
            <div v-if="allEvaluations.length" class="pt-4 border-t border-gray-100">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">{{ $t('evaluator.chair.evaluations_title') }}</h4>
              <div class="space-y-3">
                <div
                  v-for="evaluation in allEvaluations"
                  :key="evaluation.id"
                  class="rounded-lg border border-gray-100 p-3"
                >
                  <div class="flex items-center justify-between text-sm">
                    <div>
                      <p class="font-medium text-navy">{{ evaluation.evaluator.name }}</p>
                      <p class="text-xs text-gray-500">{{ formatDate(evaluation.submitted_at) }}</p>
                    </div>
                    <span class="text-sm font-semibold text-navy">{{ evaluation.total_score }}</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-2">{{ $t(`evaluator.recommendations.${evaluation.recommendation}`) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div
      v-else
      class="py-16 text-center text-sm text-gray-500"
    >
      {{ $t('evaluator.loading_detail') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import {
  ChevronLeft,
  FileText,
  Star,
  MessageSquare,
  Gavel,
  CheckCircle,
  AlertCircle,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useEvaluatorDashboard } from '~/composables/useEvaluatorDashboard'
import type { ApplicationDetail, Evaluation, EvaluationCriterion } from '~/types/evaluator'

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['evaluator', 'predseda_komisie'],
})

const localePath = useLocalePath()
const { setLocale, locale, t } = useI18n()
const { addToast } = useToast()
const auth = useAuthStore()
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

const route = useRoute()
const router = useRouter()

useHead({ title: 'Hodnotenie prihlášky | NTI Komisia' })

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
  documents: { name: string; url: string }[]
  teamMembers: { id: number; name: string; role: string }[]
  commissionMembers: { id: number; name: string; score: number | null }[]
  academic_flag: boolean | null
  category?: { id: number; name: string } | null
}

type ScoringCriterionView = {
  id: number
  name: string
  max_score: number
  score: number | null
  comment: string
}

const application = ref<EvaluatorApplicationView | null>(null)

const scoringForm = reactive({
  criteria: [] as ScoringCriterionView[],
  internalNote: '',
  recommendation: '' as '' | 'approve' | 'reject' | 'supplement',
  requestSupplement: false,
  supplementNote: '',
})

const fallbackCriteria = [
  { id: 1, name: 'Inovatívnosť', max_score: 20, score: null, comment: '' },
  { id: 2, name: 'Technická realizovateľnosť', max_score: 20, score: null, comment: '' },
  { id: 3, name: 'Biznis potenciál', max_score: 20, score: null, comment: '' },
  { id: 4, name: 'Tímová pripravenosť', max_score: 20, score: null, comment: '' },
]

const currentEvaluation = ref<Evaluation | null>(null)
const isSubmitted = computed(() => currentEvaluation.value?.locked ?? false)
const isReadOnly = computed(() => isSubmitted.value || hasSubmittedEvaluation.value)
const isCommissionChair = computed(() => auth.hasRole('predseda_komisie'))
const isSubmitting = ref(false)
const isUpdatingStatus = ref(false)
const submitError = ref<string | null>(null)
const statusError = ref<string | null>(null)
const lastAutoSaveTime = ref<string | null>(null)

const mapApplication = (detail: ApplicationDetail): EvaluatorApplicationView => ({
  id: detail.id,
  projectName: detail.projectName ?? detail.teamName ?? `Prihláška #${detail.id}`,
  teamName: detail.teamName ?? detail.team.name,
  program: detail.program ?? detail.call?.program ?? '',
  status: detail.status,
  submittedAt: detail.submitted_at,
  evaluationDeadline: detail.deadline ?? detail.call?.deadline ?? '',
  avgScore: detail.avgScore ?? detail.evaluation?.total_score ?? null,
  description: detail.description ?? '',
  documents: detail.documents.map(document => ({ name: document.type, url: document.url })),
  teamMembers: (detail.teamMembers ?? []).map(member => ({ id: member.id, name: member.name, role: member.role })),
  commissionMembers: (detail.commissionMembers ?? []).map(member => ({ id: member.id, name: member.name, score: member.score })),
  academic_flag: detail.academic_flag ?? null,
  category: detail.category ?? null,
})

const syncScoringForm = (detail: ApplicationDetail) => {
  const criteriaSource = detail.evaluation?.criteria?.length
    ? detail.evaluation.criteria
    : detail.call?.criteria?.length
      ? detail.call.criteria
      : fallbackCriteria

  scoringForm.criteria = criteriaSource.map((criterion, index) => ({
    id: index + 1,
    name: criterion.name,
    max_score: criterion.max_score,
    score: criterion.score ?? null,
    comment: criterion.comment ?? '',
  }))
  scoringForm.internalNote = detail.evaluation?.internal_note ?? ''
  scoringForm.recommendation = detail.evaluation?.recommendation ?? ''
  scoringForm.requestSupplement = false
  scoringForm.supplementNote = ''
}

const loadApplication = async () => {
  const applicationId = Number(route.params.id)
  const detail = await fetchApplicationDetail(applicationId)
  if (!detail) return

  application.value = mapApplication(detail)
  currentEvaluation.value = detail.evaluation ?? null
  syncScoringForm(detail)

  if (isCommissionChair.value) {
    await fetchAllEvaluations(applicationId)
  }
}

const buildPayload = () => ({
  criteria: scoringForm.criteria.map(criterion => ({
    name: criterion.name,
    max_score: criterion.max_score,
    score: criterion.score,
    comment: criterion.comment,
  })),
  internal_note: scoringForm.internalNote,
  recommendation: scoringForm.recommendation,
})

const persistEvaluation = async (notify = false) => {
  if (isReadOnly.value || !application.value) return

  const shouldRequestSupplement = scoringForm.requestSupplement
  const supplementReason = scoringForm.supplementNote.trim()
  const payload = buildPayload()
  const evaluationId = currentEvaluation.value?.id
  const saved = evaluationId
    ? await updateEvaluation(application.value.id, evaluationId, payload)
    : await submitEvaluation(application.value.id, payload)

  if (saved) {
    currentEvaluation.value = saved
  }

  const refreshed = await fetchApplicationDetail(application.value.id)
  if (refreshed) {
    application.value = mapApplication(refreshed)
    currentEvaluation.value = refreshed.evaluation ?? currentEvaluation.value
    syncScoringForm(refreshed)
  }

  if (shouldRequestSupplement) {
    if (supplementReason.length < 20) {
      throw new Error('Zadajte čo má tím doplniť aspoň v rozsahu 20 znakov.')
    }
    await requestSupplement(application.value.id, supplementReason)
  }

  if (notify) {
    addToast({
      message: 'Hodnotenie bolo uložené.',
      type: 'success',
    })
  }
}

// Setup debounced auto-save (30 seconds)
const { markDirty } = useAutoSave({
  debounceMs: 30000,
  onSave: async () => {
    try {
      if (!scoringForm.recommendation) return
      await persistEvaluation(false)
      lastAutoSaveTime.value = new Date().toLocaleTimeString('sk-SK')
    } catch (error) {
      console.error('Failed to save draft:', error)
    }
  },
})

// Watch for changes to trigger auto-save
watch(
  () => scoringForm,
  () => {
    if (!isReadOnly.value && scoringForm.recommendation) {
      markDirty()
    }
  },
  { deep: true },
)

onMounted(async () => {
  await loadApplication()
})

// ── Computed ─────────────────────────────────────────────────
const totalScore = computed(() => scoringForm.criteria.reduce((s, c) => s + (c.score ?? 0), 0))
const maxTotalScore = computed(() => scoringForm.criteria.reduce((s, c) => s + c.max_score, 0))
const totalScorePercent = computed(() => (maxTotalScore.value > 0 ? Math.round((totalScore.value / maxTotalScore.value) * 100) : 0))

const scoringLabelKey = () => {
  const p = totalScorePercent.value
  if (p >= 80) return 'excellent'
  if (p >= 65) return 'good'
  if (p >= 50) return 'sufficient'
  return 'insufficient'
}

const totalScoreColor = computed(() => {
  const p = totalScorePercent.value
  if (p >= 80) return 'text-success-500'
  if (p >= 65) return 'text-blue-600'
  if (p >= 50) return 'text-warning-500'
  return 'text-danger-500'
})

// ── Helpers ──────────────────────────────────────────────────
const safeLower = (value?: string | null) => value?.toLowerCase() ?? ''

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '—'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${date.getFullYear()}`
}

const updateCriterionScore = (criterion: ScoringCriterionView, event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.value) {
    criterion.score = null
    return
  }

  const nextValue = Number(target.value)
  criterion.score = Number.isFinite(nextValue) ? nextValue : null
}

const academicFlagLabel = computed(() => {
  if (!application.value) return t('evaluator.academic_flag.unverified')
  if (application.value.academic_flag === true) return t('evaluator.academic_flag.meets')
  if (application.value.academic_flag === false) return t('evaluator.academic_flag.not_meet')
  return t('evaluator.academic_flag.unverified')
})

const academicFlagBadgeClass = computed(() => {
  if (!application.value || application.value.academic_flag == null) return 'bg-gray-100 text-gray-600'
  return application.value.academic_flag ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'
})

const recommendations: {
  value: '' | 'approve' | 'reject' | 'supplement'
  label: string
  icon: any
  activeClass: string
}[] = [
  {
    value: 'approve',
    label: 'evaluator.recommendations.approve',
    icon: ThumbsUp,
    activeClass: 'border-success-300 bg-success-50 text-success-700',
  },
  {
    value: 'supplement',
    label: 'evaluator.recommendations.supplement',
    icon: RotateCcw,
    activeClass: 'border-warning-300 bg-warning-50 text-warning-700',
  },
  {
    value: 'reject',
    label: 'evaluator.recommendations.reject',
    icon: ThumbsDown,
    activeClass: 'border-danger-300 bg-danger-50 text-danger-700',
  },
]

// ── Actions ───────────────────────────────────────────────────
const validate = () => {
  if (hasSubmittedEvaluation.value) {
    submitError.value = 'Hodnotenie už bolo odoslané.'
    return false
  }

  if (isReadOnly.value) {
    submitError.value = t('evaluator.errors.locked')
    return false
  }

  if (!scoringForm.recommendation) {
    submitError.value = t('evaluator.errors.select_recommendation')
    return false
  }
  if (scoringForm.requestSupplement && !scoringForm.supplementNote.trim()) {
    submitError.value = t('evaluator.errors.supplement_empty')
    return false
  }

  const invalidCriterion = scoringForm.criteria.find(criterion => criterion.score === null || criterion.score < 0 || criterion.score > criterion.max_score)
  if (invalidCriterion) {
    submitError.value = t('evaluator.errors.invalid_score', { criterion: invalidCriterion.name })
    return false
  }

  return true
}

const handleSaveDraft = async () => {
  isSubmitting.value = true
  submitError.value = null
  try {
    if (!validate()) return
    await persistEvaluation(true)
    lastAutoSaveTime.value = new Date().toLocaleTimeString('sk-SK')
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : 'Nastala chyba pri ukladaní. Skúste znova.'
  } finally {
    isSubmitting.value = false
  }
}

const handleSubmit = async () => {
  if (!validate()) return
  isSubmitting.value = true
  submitError.value = null
  try {
    await persistEvaluation(true)
    if (application.value) {
      application.value.status = 'evaluating'
      application.value.avgScore = totalScore.value
    }
  } catch {
    submitError.value = 'Nastala chyba pri odosielaní. Skúste znova.'
  } finally {
    isSubmitting.value = false
  }
}

const handleStatusChange = async (status: 'schvalene' | 'zamietnute' | 'vyziadane_doplnenie') => {
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
</script>
