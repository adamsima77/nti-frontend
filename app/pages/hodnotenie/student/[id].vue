<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <div class="flex items-center justify-between gap-4 mb-8">
      <div>
        <NuxtLink
          :to="localePath('/hodnotenie/zoznam')"
          class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-navy transition-colors"
        >
          <ChevronLeft class="w-4 h-4" />
          {{ t('evaluator.back_to_list') }}
        </NuxtLink>
        <h1 class="text-2xl font-bold text-navy mt-4">{{ t('evaluator.student_profile') }}</h1>
      </div>
    </div>

    <template v-if="isLoading">
      <div class="py-16 text-center text-sm text-gray-500">{{ t('evaluator.loading_detail') }}</div>
    </template>

    <template v-else-if="student">
      <div class="space-y-6">
        <div class="bg-white rounded-lg border border-gray-100 p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p class="text-sm text-gray-500">{{ student.user?.email ?? '—' }}</p>
              <h2 class="text-xl font-semibold text-navy">{{ student.user?.name ?? '' }} {{ student.user?.surname ?? '' }}</h2>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div class="bg-white rounded-lg border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-navy mb-4">{{ t('student_dashboard.profile.student_profile') }}</h2>
            <dl class="grid gap-4">
              <div>
                <dt class="text-sm text-gray-500">{{ t('student_dashboard.profile.university') }}</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ student.university?.name ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">{{ t('student_dashboard.profile.study_program') }}</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ student.studyProgram?.studyProgramTranslations?.[0]?.name ?? student.studyProgram?.name ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">{{ t('student_dashboard.profile.study_year') }}</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ student.studyYear?.studyYearTranslations?.[0]?.name ?? student.studyYear?.name ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">{{ t('student_dashboard.profile.portfolio') }}</dt>
                <dd class="mt-1 text-sm text-blue-600 break-all">
                  <a v-if="student.portfolio_url" :href="student.portfolio_url" target="_blank" rel="noopener noreferrer">
                    {{ student.portfolio_url }}
                  </a>
                  <span v-else class="text-gray-500">—</span>
                </dd>
              </div>
            </dl>
          </div>

          <div class="bg-white rounded-lg border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-navy mb-4">{{ t('student_dashboard.academic_record.title') }}</h2>
            <div class="space-y-4 text-sm text-gray-700">
              <div>
                <p class="font-medium text-gray-900">{{ t('evaluator.academic_record.honor_declaration') }}</p>
                <p>
                  <span v-if="student.academicRecord?.honor_declaration">✅ {{ $t('evaluator.academic_record.yes') }}</span>
                  <span v-else>❌ {{ $t('evaluator.academic_record.no') }}</span>
                </p>
                <p v-if="student.academicRecord?.honor_declaration && student.academicRecord?.honor_declaration_signed_at" class="text-xs text-gray-500 mt-1">
                  {{ $t('evaluator.academic_record.signed_at') }} {{ formatDate(student.academicRecord?.honor_declaration_signed_at) }}
                </p>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ $t('evaluator.academic_record.transcript') }}</p>
                <div v-if="student.academicRecord?.transcript_file">
                  <a
                    :href="student.academicRecord.transcript_file"
                    class="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ $t('evaluator.academic_record.download') }}
                  </a>
                </div>
                <div v-else class="text-gray-500">{{ $t('evaluator.academic_record.not_uploaded') }}</div>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ t('student_dashboard.profile.university') }}</p>
                <p class="mt-1 text-sm text-gray-900">{{ student.university?.name ?? '—' }}</p>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ t('student_dashboard.profile.study_program') }}</p>
                <p class="mt-1 text-sm text-gray-900">{{ student.studyProgram?.studyProgramTranslations?.[0]?.name ?? student.studyProgram?.name ?? '—' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="py-16 text-center text-sm text-gray-500">{{ errorMessage ?? 'Študent nebol nájdený.' }}</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ChevronLeft } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['evaluator', 'predseda_komisie'],
})

const api = useApi()
const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()

const student = ref<Record<string, any> | null>(null)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const studentId = Number(route.params.id)

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '—'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${date.getFullYear()}`
}

const loadStudent = async () => {
  if (!studentId) {
    errorMessage.value = 'Neplatné ID študenta.'
    return
  }

  isLoading.value = true
  errorMessage.value = null

  try {
    const res = await api.get(`/students/${studentId}`) as { student?: Record<string, any> }
    student.value = res.student ?? null
    if (!student.value) {
      errorMessage.value = 'Študent nebol nájdený.'
    }
  } catch (err: unknown) {
    const errObj = err as { data?: { message?: string }; message?: string }
    errorMessage.value = errObj?.data?.message ?? errObj?.message ?? 'Nepodarilo sa načítať študenta.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadStudent)
</script>
