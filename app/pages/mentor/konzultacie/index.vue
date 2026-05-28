<!-- pages/mentor/konzultacie/index.vue -->
<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-navy mb-1">{{ t('mentor.consultations.title') }}</h1>
        <p class="text-gray-500 text-sm">{{ t('mentor.consultations.subtitle') }}</p>
      </div>
      <NuxtLink
        to="/mentor/konzultacie/nova"
        class="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
      >
        <Plus class="w-4 h-4" /> {{ t('mentor.consultations.new') }}
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-6">
      <!-- Project filter -->
      <select
        v-model="filterProject"
        class="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <option value="">{{ t('mentor.consultations.filters.allProjects') }}</option>
        <option
          v-for="p in projectOptions"
          :key="p.value"
          :value="p.value"
        >
          {{ p.label }}
        </option>
      </select>
      <!-- Type filter -->
      <select
        v-model="filterType"
        class="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <option value="">{{ t('mentor.consultations.filters.allTypes') }}</option>
        <option value="online">{{ t('mentor.consultations.filters.online') }}</option>
        <option value="personal">{{ t('mentor.consultations.filters.personal') }}</option>
        <option value="written">{{ t('mentor.consultations.filters.written') }}</option>
      </select>
      <!-- Month filter -->
      <select
        v-model="filterMonth"
        class="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <option value="">{{ t('mentor.consultations.filters.allMonths') }}</option>
        <option value="2026-04">{{ t('mentor.consultations.months.april2026') }}</option>
        <option value="2026-03">{{ t('mentor.consultations.months.march2026') }}</option>
        <option value="2026-02">{{ t('mentor.consultations.months.february2026') }}</option>
      </select>
    </div>

    <div
      v-if="loading"
      class="mb-6 rounded-lg border border-gray-100 bg-white p-4 text-sm text-gray-500"
    >
      {{ t('mentor.consultations.loading') }}
    </div>

    <div
      v-else-if="error"
      class="mb-6 rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700"
    >
      {{ error }}
    </div>

    <!-- Summary bar -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <p class="text-2xl font-bold text-purple-600">{{ filteredConsultations.length }}</p>
        <p class="text-xs text-gray-500 mt-0.5">{{ t('mentor.consultations.stats.consultations') }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <p class="text-2xl font-bold text-navy">{{ totalTime }}</p>
        <p class="text-xs text-gray-500 mt-0.5">{{ t('mentor.consultations.stats.minutesTotal') }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <p class="text-2xl font-bold text-navy">{{ totalActionItems }}</p>
        <p class="text-xs text-gray-500 mt-0.5">{{ t('mentor.consultations.stats.tasks') }}</p>
      </div>
    </div>

    <!-- Consultations list -->
    <div class="space-y-3">
      <div
        v-for="c in filteredConsultations"
        :key="c.id"
        class="bg-white rounded-lg border border-gray-100 p-5 hover:shadow-sm transition-shadow"
      >
        <div class="flex items-start justify-between gap-3 mb-2">
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              <h3 class="font-semibold text-navy text-sm">{{ c.title }}</h3>
              <span
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="typeClass(c.type)"
                >{{ typeLabel(c.type) }}</span
              >
            </div>
            <p class="text-xs text-gray-400">
              <NuxtLink
                :to="`/mentor/projekty/${c.projectId}`"
                class="text-purple-600 hover:underline"
                >{{ c.projectName }}</NuxtLink
              >
              · {{ c.date }} · {{ c.duration }} min
            </p>
          </div>
          <NuxtLink
            :to="`/mentor/projekty/${c.projectId}`"
            class="shrink-0 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <ExternalLink class="w-4 h-4" />
          </NuxtLink>
        </div>
        <p class="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">{{ c.summary }}</p>
        <div
          v-if="c.actionItems.length"
          class="flex flex-wrap gap-1.5"
        >
          <span
            v-for="item in c.actionItems"
            :key="item"
            class="inline-flex items-center gap-1 text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded"
          >
            <ArrowRight class="w-3 h-3 text-purple-400" /> {{ item }}
          </span>
        </div>
      </div>

      <div
        v-if="!filteredConsultations.length"
        class="text-center py-16 bg-white rounded-lg border border-gray-100"
      >
        <MessageSquare class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">{{ t('mentor.consultations.noEntries') }}</p>
        <p class="text-sm text-gray-400 mt-1">{{ t('mentor.consultations.tryFilters') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, ExternalLink, ArrowRight, MessageSquare } from 'lucide-vue-next'
import type { Consultation as BaseConsultation } from '../../../types/mentor'

const { t } = useI18n()

type Consultation = BaseConsultation & {
  projectId: number
  projectName: string
}

definePageMeta({
  layout: 'portal',
  //middleware: 'auth',
  roles: ['mentor'],
})

useHead({ title: t('mentor.consultations.pageTitle') })
const api = useApi()

const filterProject = ref('')
const filterType = ref('')
const filterMonth = ref('')
const consultations = ref<Consultation[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const projectOptions = computed(() => {
  const options = new Map<string, { value: string; label: string }>()

  for (const consultation of consultations.value) {
    options.set(String(consultation.projectId), {
      value: String(consultation.projectId),
      label: consultation.projectName,
    })
  }

  return Array.from(options.values())
})

const fetchConsultations = async () => {
  loading.value = true
  error.value = null

  try {
    const res = await api.get('/mentor/consultations')
    consultations.value = Array.isArray(res) ? (res as Consultation[]) : []
  } catch (err) {
    error.value = (err as { data?: { message?: string }; message?: string } | null)?.data?.message
      ?? (err as { message?: string } | null)?.message
      ?? t('mentor.consultations.loading')
  } finally {
    loading.value = false
  }
}

onMounted(fetchConsultations)

const toMonthKey = (date: string) => {
  const match = date.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (!match) return ''
  return `${match[3]}-${match[2]}`
}

const normalizeConsultationType = (type: string) => {
  if (type === 'online' || type === 'Online (videohovor)') return 'online'
  if (type === 'personal' || type === 'Osobne') return 'personal'
  return 'written'
}

const filteredConsultations = computed(() =>
  consultations.value.filter((c: Consultation) => {
    if (filterProject.value && String(c.projectId) !== filterProject.value) return false
    if (filterMonth.value && toMonthKey(String(c.date)) !== filterMonth.value) return false
    if (filterType.value) {
      if (normalizeConsultationType(c.type) !== filterType.value) return false
    }
    return true
  }),
)

const totalTime = computed(() => filteredConsultations.value.reduce((sum: number, c: Consultation) => sum + c.duration, 0))
const totalActionItems = computed(() => filteredConsultations.value.reduce((sum: number, c: Consultation) => sum + c.actionItems.length, 0))

const typeClass = (type: string) => {
  const normalizedType = normalizeConsultationType(type)
  if (normalizedType === 'online') return 'bg-blue-50 text-blue-600'
  if (normalizedType === 'personal') return 'bg-purple-50 text-purple-600'
  return 'bg-gray-100 text-gray-500'
}

const typeLabel = (type: string) => {
  const normalizedType = normalizeConsultationType(type)
  if (normalizedType === 'online') return t('mentor.consultations.types.online')
  if (normalizedType === 'personal') return t('mentor.consultations.types.personal')
  return t('mentor.consultations.types.written')
}
</script>
