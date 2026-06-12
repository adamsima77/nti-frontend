<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-navy mb-1">{{ t('mentor.consultations.title') }}</h1>
        <p class="text-gray-500 text-sm">{{ t('mentor.consultations.subtitle') }}</p>
      </div>
      <NuxtLink
        :to="localePath('/mentor/konzultacie/nova')"
        class="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
      >
        <Plus class="w-4 h-4" /> {{ t('mentor.consultations.new') }}
      </NuxtLink>
    </div>

    <div class="flex flex-wrap gap-3 mb-6">
      <select
        v-model="filterProject"
        @change="handleFilterChange"
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

      <select
        v-model="filterType"
        @change="handleFilterChange"
        class="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <option value="">{{ t('mentor.consultations.filters.allTypes') }}</option>
        <option value="online">{{ t('mentor.consultations.filters.online') }}</option>
        <option value="offline">{{ t('mentor.consultations.filters.personal') }}</option>
      </select>

      <select
        v-model="filterMonth"
        @change="handleFilterChange"
        class="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <option value="">{{ t('mentor.consultations.filters.allMonths') }}</option>
        <option
          v-for="m in monthOptions"
          :key="m.value"
          :value="m.value"
        >
          {{ m.label }}
        </option>
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

    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <p class="text-2xl font-bold text-purple-600">{{ totalItems }}</p>
        <p class="text-xs text-gray-500 mt-0.5">{{ t('mentor.consultations.stats.consultations') }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <p class="text-2xl font-bold text-navy">{{ totalTime }} min</p>
        <p class="text-xs text-gray-500 mt-0.5">{{ t('mentor.consultations.stats.minutesTotal') }}</p>
      </div>
    </div>

    <div class="space-y-3 mb-6">
      <div
        v-for="c in consultations"
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
              >
                {{ typeLabel(c.type) }}
              </span>
            </div>
            <p class="text-xs text-gray-400">
              <NuxtLink
                :to="`/mentor/projekty/${c.projectId}`"
                class="text-purple-600 hover:underline"
              >
                {{ c.projectName }}
              </NuxtLink>
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
        <p class="text-sm text-gray-600 leading-relaxed mb-1 line-clamp-2">{{ c.summary }}</p>
      </div>

      <div
        v-if="!consultations.length && !loading"
        class="text-center py-16 bg-white rounded-lg border border-gray-100"
      >
        <MessageSquare class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">{{ t('mentor.consultations.noEntries') }}</p>
        <p class="text-sm text-gray-400 mt-1">{{ t('mentor.consultations.tryFilters') }}</p>
      </div>
    </div>

    <div v-if="totalPages > 1" class="flex  mt-8">
      <UiPagination
        v-model:current-page="currentPage"
        :total-pages="totalPages"
        :max-visible="5"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Plus, ExternalLink, MessageSquare } from 'lucide-vue-next'

const localePath = useLocalePath()
const { t } = useI18n()

type Consultation = {
  id: number
  projectId: number
  projectName: string
  title: string
  type: 'online' | 'offline'
  date: string
  duration: number
  summary: string
  actionItems: string[]
}

// Laravel Paginator interface
type PaginationResponse = {
  current_page: number
  data: Consultation[]
  last_page: number
  per_page: number
  total: number
}

definePageMeta({
  layout: 'portal',
  roles: ['mentor'],
})

useHead({ title: t('mentor.consultations.pageTitle') })
const api = useApi()

// Filtre & Stav
const filterProject = ref('')
const filterType = ref('')
const filterMonth = ref('')

const consultations = ref<Consultation[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Stránkovanie State (riadené backendom)
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)

// Zoznamy pre filtre napĺňame z prvej sady dát (aby mentor videl len relevantné možnosti)
const allKnownConsultations = ref<Consultation[]>([])

const fetchConsultations = async () => {
  loading.value = true
  error.value = null

  try {
    // Posielame filtre a aktuálnu stránku na backend
    const res = await api.get<PaginationResponse>('/mentor/consultations', {
      params: {
        page: currentPage.value,
        project_id: filterProject.value || undefined,
        type: filterType.value || undefined,
        month: filterMonth.value || undefined,
      },
    })

    if (res && 'data' in res) {
      consultations.value = res.data
      currentPage.value = res.current_page
      totalPages.value = res.last_page
      totalItems.value = res.total

      // Ak ešte nemáme zoznam pre lokálne filtre, uložíme si úvodné dáta
      if (allKnownConsultations.value.length === 0 && res.data.length > 0) {
        allKnownConsultations.value = [...res.data]
      }
    }
  } catch (err) {
    error.value = (err as { data?: { message?: string }; message?: string } | null)?.data?.message
      ?? (err as { message?: string } | null)?.message
      ?? t('mentor.consultations.loading')
  } finally {
    loading.value = false
  }
}

// Spustenie pri mounte
onMounted(fetchConsultations)

// Sledujeme zmenu stránky - pri zmene okamžite ťaháme dáta
watch(currentPage, () => {
  fetchConsultations()
})

// Pri zmene akéhokoľvek filtra skočíme na stranu 1 a načítame dáta
const handleFilterChange = () => {
  currentPage.value = 1
  fetchConsultations()
}

// Pomocná funkcia na získanie YYYY-MM z formátu d.m.Y
const toMonthKey = (dateStr: string) => {
  const parts = dateStr.split('.')
  if (parts.length !== 3) return ''
  return `${parts[2]}-${parts[1].padStart(2, '0')}`
}

// Možnosti pre výber projektu vo filtri
const projectOptions = computed(() => {
  const options = new Map<string, { value: string; label: string }>()
  const source = allKnownConsultations.value.length ? allKnownConsultations.value : consultations.value
  
  for (const c of source) {
    options.set(String(c.projectId), {
      value: String(c.projectId),
      label: c.projectName,
    })
  }
  return Array.from(options.values())
})

// Možnosti pre výber mesiaca vo filtri
const monthOptions = computed(() => {
  const options = new Map<string, string>()
  const source = allKnownConsultations.value.length ? allKnownConsultations.value : consultations.value

  for (const c of source) {
    const key = toMonthKey(c.date)
    if (key) {
      const [year, month] = key.split('-')
      options.set(key, `${month}/${year}`)
    }
  }

  return Array.from(options.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([value, label]) => ({ value, label }))
})

// Vypočítaný celkový čas (suma trvaní na aktuálne vybranej stránke alebo globálne)
const totalTime = computed(() => {
  return consultations.value.reduce((sum: number, c: Consultation) => sum + (c.duration || 0), 0)
})

// Tailwind triedy pre odznaky typov
const typeClass = (type: string) => {
  return type === 'online' 
    ? 'bg-blue-50 text-blue-600' 
    : 'bg-purple-50 text-purple-600'
}

// Label pre typy
const typeLabel = (type: string) => {
  return type === 'online' 
    ? t('mentor.consultations.filters.online') 
    : t('mentor.consultations.filters.personal')
}
</script>