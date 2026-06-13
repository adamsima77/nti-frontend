<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-navy mb-1">{{ t('mentor.projects.title') }}</h1>
      <p class="text-gray-500 text-sm">{{ t('mentor.projects.subtitle') }}</p>
    </div>

    <div v-if="loading" class="mb-6 rounded-lg border border-gray-100 bg-white p-4 text-sm text-gray-500">
      {{ t('mentor.projects.loading') }}
    </div>

    <div v-else-if="error" class="mb-6 rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700">
      {{ error }}
    </div>

    <div class="flex flex-wrap gap-3 mb-6">
      <div class="flex gap-2">
        <button
          v-for="f in statusFilters"
          :key="f.value"
          @click="handleStatusFilterChange(f.value)"
          class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
          :class="
            filterStatus === f.value
              ? 'bg-purple-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300'
          "
        >
          {{ f.label }}
         
        </button>
      </div>
      
      <select
        v-model="filterProgram"
        @change="handleFilterChange"
        class="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <option value="">{{ t('mentor.projects.filters.allPrograms') }}</option>
        <option v-for="prog in programTypes" :key="prog.id" :value="prog.id">
          {{ prog.name }}
        </option>
      </select>
    </div>

    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <p class="text-2xl font-bold text-purple-600">{{ totalItems }}</p>
        <p class="text-xs text-gray-500 mt-0.5">{{ t('mentor.projects.stats.projects') }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <p class="text-2xl font-bold text-warning-500">{{ totalPendingMilestones }}</p>
        <p class="text-xs text-gray-500 mt-0.5">{{ t('mentor.projects.stats.pendingMilestones') }}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <p class="text-2xl font-bold text-navy">{{ totalConsultations }}</p>
        <p class="text-xs text-gray-500 mt-0.5">{{ t('mentor.projects.stats.consultations') }}</p>
      </div>
    </div>

    <div class="space-y-4">
      <div
        v-for="project in projects"
        :key="project.id"
        class="bg-white rounded-lg border border-gray-100 p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold text-navy text-base">{{ project.name }}</h3>
              <UiStatusBadge :status="project.status" />
              <span class="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-50 text-purple-600">
                {{ project.program }}
              </span>
            </div>
            <p class="text-sm text-gray-500">
              {{ project.teamName }} · {{ t('mentor.dashboard.assignedAt', { date: project.assignedAt }) }}
            </p>
          </div>
          <NuxtLink
            :to="localePath(`/mentor/projekty/${project.id}`)"
            class="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {{ t('mentor.projects.open') }} <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </div>

        <div class="mb-3">
          <div class="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>{{ t('mentor.projects.milestoneProgress') }}</span>
            <span>{{ project.milestonesCompleted }}/{{ project.milestonesTotal }}</span>
          </div>
          <div class="bg-gray-100 rounded-full h-1.5">
            <div
              class="h-1.5 rounded-full bg-purple-500 transition-all"
              :style="{ width: `${milestoneProgressPercent(project)}%` }"
            />
          </div>
        </div>

        <div class="flex items-center justify-between text-sm text-gray-400">
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1">
              <Users class="w-4 h-4" /> {{ project.teamSize }} {{ t('mentor.projects.members') }}
            </span>
            <span class="flex items-center gap-1">
              <MessageSquare class="w-4 h-4" /> {{ project.consultationsCount }} {{ t('mentor.projects.stats.consultations') }}
            </span>
            <span v-if="project.nextMilestone" class="flex items-center gap-1 text-warning-500">
              <Flag class="w-4 h-4" /> {{ project.nextMilestone }}
            </span>
          </div>
          <span
            v-if="project.pendingMilestone"
            class="inline-flex items-center gap-1 text-xs font-medium text-warning-600 bg-warning-50 px-2.5 py-1 rounded-full"
          >
            <Clock class="w-3.5 h-3.5" /> {{ t('mentor.projects.pendingApproval') }}
          </span>
        </div>
      </div>

      <div v-if="!projects.length && !loading" class="text-center py-16 bg-white rounded-lg border border-gray-100">
        <BookOpen class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">{{ t('mentor.projects.noProjects') }}</p>
        <p class="text-sm text-gray-400 mt-1">{{ t('mentor.projects.tryFilters') }}</p>
      </div>
    </div>

    <div v-if="totalPages > 1" class="flex justify-center mt-8">
      <UiPagination v-slot:current-page="currentPage" :current-page="currentPage" :total-pages="totalPages" @update:current-page="currentPage = $event" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Users, MessageSquare, Flag, Clock, ChevronRight, BookOpen } from 'lucide-vue-next'


const { t } = useI18n()

type Project = {
  id: number
  name: string
  teamName: string
  program: string
  status: string
  assignedAt: string
  teamSize: number
  consultationsCount: number
  milestonesCompleted: number
  milestonesTotal: number
  nextMilestone: string | null
  pendingMilestone: boolean
}

type LaravelPaginationResponse = {
  current_page: number
  data: Project[]
  last_page: number
  per_page: number
  total: number
}

definePageMeta({
  layout: 'portal',
  roles: ['mentor'],
})

useHead({ title: t('mentor.projects.pageTitle') })
const api = useApi()

const localePath = useLocalePath()

// Filtre a Stavy tabuľky
const filterStatus = ref('all')
const filterProgram = ref('')
const projects = ref<Project[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Stránkovanie State (Backend)
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)

// Globálna cache pre naplnenie filtrov nezávisle od aktuálnej stránky
const staticFilterMetaProjects = ref<Project[]>([])

const loadProjects = async () => {
  loading.value = true
  error.value = null

  try {
    const res = await api.get<LaravelPaginationResponse>('/mentor/projects', {
      params: {
        page: currentPage.value,
        status: filterStatus.value !== 'all' ? filterStatus.value : undefined,
        program: filterProgram.value || undefined,
      },
    })

    if (res && 'data' in res) {
      projects.value = res.data
      currentPage.value = res.current_page
      totalPages.value = res.last_page
      totalItems.value = res.total
    }
  } catch (err) {
    error.value = (err as { data?: { message?: string }; message?: string } | null)?.data?.message ?? t('mentor.projects.loading')
  } finally {
    loading.value = false
  }
}

// Načítanie kompletnej sady dát bez filtrov IBA pre vybudovanie statických možností vo filtroch
const loadStaticFilterMeta = async () => {
  try {
    const res = await api.get<LaravelPaginationResponse>('/mentor/projects', { params: { page: 1 } })
    if (res && 'data' in res) {
      staticFilterMetaProjects.value = res.data
    }
  } catch (e) {
    console.error('Nepodarilo sa načítať metadáta pre filtre', e)
  }
}

onMounted(async () => {
  await loadStaticFilterMeta()
  await loadProjects()
})

// Sledovanie stránkovania
watch(currentPage, () => {
  loadProjects()
})

const handleFilterChange = () => {
  currentPage.value = 1
  loadProjects()
}

const handleStatusFilterChange = (status: string) => {
  filterStatus.value = status
  handleFilterChange()
}

// Dynamické počty pre filtre (počítajú sa z úvodnej sady dát, aby nemizli)
const statusFilters = computed(() => {
  const source = staticFilterMetaProjects.value.length ? staticFilterMetaProjects.value : projects.value
  return [
    { label: t('mentor.projects.filters.all'), value: 'all', count: filterStatus.value === 'all' ? totalItems.value : source.length },
    { label: t('mentor.projects.filters.active'), value: '9', count: source.filter((p) => p.status === 'active').length },
    { label: t('mentor.projects.filters.paused'), value: '7', count: source.filter((p) => p.status === 'paused').length },
  ]
})

const programTypes = ref([])

onMounted(async () => {
   programTypes.value = await api.get('/program-types')
})

// Súhrnné štatistiky z aktuálnej stránky
const totalPendingMilestones = computed(() => projects.value.filter((p) => p.pendingMilestone).length)
const totalConsultations = computed(() => projects.value.reduce((s, p) => s + (p.consultationsCount ?? 0), 0))

const milestoneProgressPercent = (project: Project) => {
  const completed = project.milestonesCompleted ?? 0
  const total = project.milestonesTotal ?? 1
  return Math.round((completed / total) * 100)
}
</script>