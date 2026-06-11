<!-- pages/firma/zadania/index.vue -->
<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-navy mb-1">Zadania</h1>
        <p class="text-gray-500">Správa zadaní pre tímy NTI programov</p>
      </div>
      <NuxtLink
        to="/firma/zadania/nove"
        class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
      >
        <Plus class="w-4 h-4" />
        Nové zadanie
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="f in filters"
        :key="f.value"
        @click="activeFilter = f.value"
        class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
        :class="
          activeFilter === f.value
            ? 'bg-blue-600 text-white'
            : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
        "
      >
        {{ f.label }}
        <span class="ml-1 opacity-60">{{ f.count }}</span>
      </button>
    </div>

    <!-- Tasks list -->
    <div class="space-y-4">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold text-navy text-base">{{ task.title }}</h3>
              <UiStatusBadge :status="task.rawStatus" />
            </div>
            <p class="text-sm text-gray-500">{{ task.program }} · Pridané {{ task.createdAt }}</p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-lg font-bold text-navy">{{ formatCurrency(task.budget) }}</p>
            <p class="text-xs text-gray-400">rozpočet</p>
          </div>
        </div>

        <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ task.description }}</p>

        <!-- Meta row -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4 text-sm text-gray-400">
            <span class="flex items-center gap-1">
              <FileText class="w-4 h-4" />
              {{ task.applicationsCount }} prihlášok
            </span>
            <span
              v-if="task.deadline"
              class="flex items-center gap-1"
            >
              <Calendar class="w-4 h-4" />
              {{ task.deadline }}
            </span>
          </div>
          <NuxtLink
            :to="`/firma/zadania/${task.id}`"
            class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Detail
            <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="!filteredTasks.length"
        class="text-center py-16 bg-white rounded-lg border border-gray-100"
      >
        <ClipboardList class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">Žiadne zadania</p>
        <p class="text-sm text-gray-400 mt-1">Vytvorte prvé zadanie pre tímy</p>
        <NuxtLink
          to="/firma/zadania/nove"
          class="inline-flex items-center gap-2 mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus class="w-4 h-4" />
          Nové zadanie
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Users, FileText, Calendar, ChevronRight, Plus, ClipboardList } from 'lucide-vue-next'
import { normalizeTaskStatus } from '~/composables/useTaskStatus'

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['partner'],
})

useHead({
  title: 'Zadania | NTI Firma',
})

const orgDashboard = useOrgDashboard()
await orgDashboard.load()
if (orgDashboard.myRole.value !== 'organization_admin') {
  await navigateTo(useLocalePath()('/firma'))
}

const api = useApi()
const authStore = useAuthStore()

const tasks = ref<any[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const activeFilter = ref('all')

const loadTasks = async () => {
  isLoading.value = true
  error.value = null

  try {
    await authStore.getCurrentUser()
    const response = await api.get('/v1/admin/calls', { params: { per_page: 100 } }) as any
    const items = response?.data ?? []
    tasks.value = items.map((call: any) => ({
      id: call.id,
      title: call.name,
      program: call.program?.name ?? 'Program',
      description: call.description ?? '',
      budget: call.budget ? Number(call.budget) : null,
      spent: 0,
      status: normalizeTaskStatus(call.status?.name ?? ''),
      rawStatus: call.status?.name ?? '',
      createdAt: call.created_at ? call.created_at.slice(0, 10).split('-').reverse().join('. ') : '',
      deadline: call.application_deadline ? call.application_deadline.slice(0, 10).split('-').reverse().join('. ') : null,
      teamsCount: 0,
      applicationsCount: Number(call.applicants_count ?? 0),
    }))
  } catch (err: any) {
    error.value = err?.data?.message ?? err?.message ?? 'Nastala chyba pri načítaní zadaní.'
    tasks.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(loadTasks)

const getStatusCategory = (statusName: string) => {
  if (!statusName) return 'draft'
  
  const s = statusName.toLowerCase()
  
  if (['publikované', 'v párovaní', 'pridelené', 'v realizácii'].includes(s)) {
    return 'active'
  }
  if (['uzavreté'].includes(s)) {
    return 'closed'
  }
  if (['draft', 'čaká na schválenie'].includes(s)) {
    return 'draft'
  }
  return 'draft'
}

const filters = computed(() => [
  { 
    label: 'Všetky', 
    value: 'all', 
    count: tasks.value.length 
  },
  { 
    label: 'Aktívne', 
    value: 'active', 
    count: tasks.value.filter(t => getStatusCategory(t.rawStatus) === 'active').length 
  },
  { 
    label: 'Dokončené', 
    value: 'closed', 
    count: tasks.value.filter(t => getStatusCategory(t.rawStatus) === 'closed').length 
  },
  { 
    label: 'Drafty / Na schválenie', 
    value: 'draft', 
    count: tasks.value.filter(t => getStatusCategory(t.rawStatus) === 'draft').length 
  },
])

const filteredTasks = computed(() => {
  if (activeFilter.value === 'all') return tasks.value
  return tasks.value.filter(t => getStatusCategory(t.rawStatus) === activeFilter.value)
})

const formatCurrency = (val: number | null | undefined) =>
  typeof val === 'number'
    ? new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
    : '—'

const budgetBarColor = (ratio: number) => {
  if (ratio >= 1) return 'bg-danger-500'
  if (ratio >= 0.8) return 'bg-warning-500'
  return 'bg-blue-500'
}
</script>
