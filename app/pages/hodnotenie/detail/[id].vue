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
        <p class="text-gray-500 text-sm">{{ applicationDetail?.teamName ?? applicationDetail?.team?.name }} · {{ formatDate(applicationDetail?.submitted_at) }}</p>
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
        <div class="lg:col-span-2 space-y-6">
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

          <div class="bg-white rounded-lg border border-gray-100 p-6">
            <h2 class="text-base font-semibold text-navy mb-4">{{ $t('evaluator.application_description') }}</h2>
            <p class="text-gray-700 text-sm leading-relaxed">{{ applicationDetail.description ?? '—' }}</p>
          </div>

          <div class="bg-white rounded-lg border border-gray-100 p-6">
            <h2 class="text-base font-semibold text-navy mb-4">{{ $t('evaluator.form_responses') }}</h2>
            <div class="space-y-4 text-sm text-gray-700">
              <template v-if="applicationDetail.form_fields?.length">
                <div
                  v-for="field in applicationDetail.form_fields"
                  :key="field.name"
                  class="space-y-1"
                >
                  <p class="font-medium text-gray-900">{{ field.label }}</p>
                  <p class="text-sm text-gray-600 break-words">{{ formatFormDataValue(applicationDetail.form_data?.[field.name]) }}</p>
                </div>
              </template>
              <template v-else-if="applicationDetail.form_data && Object.keys(applicationDetail.form_data).length">
                <div
                  v-for="(value, key) in applicationDetail.form_data"
                  :key="key"
                  class="space-y-1"
                >
                  <p class="font-medium text-gray-900">{{ key }}</p>
                  <p class="text-sm text-gray-600 break-words">{{ formatFormDataValue(value) }}</p>
                </div>
              </template>
              <div v-else class="text-xs text-gray-400">{{ $t('evaluator.no_form_responses') }}</div>
            </div>
          </div>

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
                    <div v-if="member.transcript_file">
                      <a
                        :href="member.transcript_file"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-blue-600 hover:underline"
                      >
                        {{ $t('evaluator.academic_record.download') }}
                      </a>
                    </div>
                    <div v-else class="text-gray-500">{{ $t('evaluator.academic_record.not_uploaded') }}</div>
                  </div>
                </div>
              </div>
              <div v-if="!(applicationDetail.teamMembers?.length ?? 0)" class="text-xs text-gray-400">{{ $t('evaluator.no_team_members') }}</div>
            </div>
          </div>

          <div class="bg-white rounded-lg border border-gray-100 p-6">
            <h2 class="text-base font-semibold text-navy mb-4">{{ $t('evaluator.documents') }}</h2>
            <div class="space-y-3">
              <div
                v-for="document in applicationDetail.documents"
                :key="document.id"
                class="text-sm"
              >
                <a
                  :href="document.url"
                  target="_blank"
                  class="text-blue-600 hover:underline"
                >
                  {{ document.type }}
                </a>
              </div>
              <div v-if="!applicationDetail.documents.length" class="text-xs text-gray-400">{{ $t('evaluator.no_documents') }}</div>
            </div>
          </div>
        </div>

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
                <p>{{ applicationDetail.evaluation?.total_score ?? '—' }}</p>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ $t('evaluator.submitted_at') }}</p>
                <p>{{ formatDate(applicationDetail.evaluation?.submitted_at) }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg border border-gray-100 p-5">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{{ $t('evaluator.application_history') }}</h3>
            <div class="space-y-3 text-sm text-gray-700">
              <div v-for="item in applicationDetail.status_history" :key="item.changed_at + item.status" class="border border-gray-100 rounded-lg p-3">
                <div class="flex items-start justify-between gap-3">
                  <UiStatusBadge :status="item.status" class="shrink-0" />
                  <p class="text-xs text-gray-500">{{ formatDate(item.changed_at) }}</p>
                </div>
                <p class="text-sm font-medium text-navy mt-2">{{ item.changed_by }}</p>
                <p v-if="item.note" class="text-sm text-gray-600 mt-1">{{ item.note }}</p>
              </div>
              <div v-if="!applicationDetail.status_history.length" class="text-xs text-gray-400">{{ $t('evaluator.no_history') }}</div>
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
import { ChevronLeft } from 'lucide-vue-next'
import { useEvaluatorDashboard } from '~/composables/useEvaluatorDashboard'
import type { ApplicationDetail } from '~/types/evaluator'

const localePath = useLocalePath()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { applicationDetail, fetchApplicationDetail } = useEvaluatorDashboard()

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['evaluator', 'predseda_komisie'],
})

const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const applicationTitle = computed(() => {
  if (!applicationDetail.value) return t('evaluator.application_detail')
  return applicationDetail.value.projectName ?? applicationDetail.value.teamName ?? applicationDetail.value.team?.name ?? `${t('evaluator.application')} #${applicationDetail.value.id}`
})

const evaluationRecommendation = computed(() => {
  if (!applicationDetail.value?.evaluation?.recommendation) return '—'
  return t(`evaluator.recommendations.${applicationDetail.value.evaluation.recommendation}`)
})

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '—'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${date.getFullYear()}`
}

const formatFormDataValue = (value: unknown): string => {
  if (value == null || value === '') {
    return '—'
  }

  if (typeof value === 'boolean') {
    return value ? t('evaluator.academic_record.yes') : t('evaluator.academic_record.no')
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatFormDataValue(item)).join(', ')
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        const parsed = JSON.parse(trimmed)
        return formatFormDataValue(parsed)
      } catch {
        return trimmed
      }
    }

    return trimmed || '—'
  }

  return String(value)
}

const loadApplication = async () => {
  const applicationId = Number(route.params.id)
  if (!applicationId) return
  isLoading.value = true
  errorMessage.value = null

  try {
    await fetchApplicationDetail(applicationId)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : t('evaluator.loading_detail_error')
  } finally {
    isLoading.value = false
  }
}

const goBackToEvaluation = () => {
  router.push(localePath(`/hodnotenie/${route.params.id}`))
}

onMounted(loadApplication)
</script>
