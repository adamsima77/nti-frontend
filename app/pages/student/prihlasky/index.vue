<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Moje žiadosti</h1>
          <p class="mt-1 text-sm text-gray-500">Prehľad všetkých vašich žiadostí o program</p>
        </div>
        <NuxtLink
          :to="localePath('/student/prihlasky/nova')"
          class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap shadow-sm"
        >
          <Plus class="w-4 h-4" />
          Nová žiadosť
        </NuxtLink>
      </div>
 
      <!-- Filters -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
        <div class="flex flex-col sm:flex-row gap-3">
 
          <!-- Search -->
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Hľadať podľa názvu výzvy…"
              class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
 
          <!-- Program type -->
          <div class="relative sm:w-56">
            <LayoutGrid class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              v-model="filters.program_type_id"
              class="w-full appearance-none pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Všetky programy</option>
              <option
                v-for="pt in programTypes"
                :key="pt.id"
                :value="pt.id"
              >
                {{ pt.name }}
              </option>
            </select>
            <ChevronDown class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
 
          <!-- Status -->
          <div class="relative sm:w-52">
            <Tag class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              v-model="filters.status_id"
              class="w-full appearance-none pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Všetky stavy</option>
              <option
                v-for="s in statuses"
                :key="s.id"
                :value="s.id"
              >
                {{ s.name }}
              </option>
            </select>
            <ChevronDown class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
 
          <!-- Clear -->
          <button
            v-if="hasActiveFilters"
            class="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
            @click="clearFilters"
          >
            <X class="w-4 h-4" />
            Zrušiť filtre
          </button>
        </div>
      </div>
 
      <!-- Table -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
 
        <!-- Loading overlay -->
        <div
          v-if="loading"
          class="flex items-center justify-center py-24"
        >
          <div class="flex flex-col items-center gap-3">
            <Loader2 class="w-7 h-7 text-blue-500 animate-spin" />
            <span class="text-sm text-gray-400">Načítavam žiadosti…</span>
          </div>
        </div>
 
        <!-- Empty state -->
        <div
          v-else-if="!applications.length"
          class="flex flex-col items-center justify-center py-24 px-4 text-center"
        >
          <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FileX class="w-6 h-6 text-gray-400" />
          </div>
          <p class="text-sm font-medium text-gray-700">Žiadne žiadosti nenájdené</p>
          <p class="text-xs text-gray-400 mt-1">
            {{ hasActiveFilters ? 'Skúste upraviť filtre' : 'Zatiaľ ste nepodali žiadnu žiadosť' }}
          </p>
        </div>
 
        <!-- Table content -->
        <template v-else>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 bg-gray-50/60">
                  <th class="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Application ID</th>
                  <th class="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Výzva</th>
                  <th class="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Tím</th>
                  <th class="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Stav</th>
                  <th class="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Vytvorené</th>
                  <th class="px-5 py-3" />
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr
                  v-for="app in applications"
                  :key="app.id"
                  class="hover:bg-gray-50/70 transition-colors group"
                >
                  <td class="px-5 py-4 text-gray-400 font-mono text-xs">
                    {{ app.reference }}
                  </td>
                  <td class="px-5 py-4">
                    <span class="font-medium text-gray-900">{{ app.call?.name ?? '—' }}</span>
                  </td>
                  <td class="px-5 py-4 text-gray-600">
                    {{ app.team?.name ?? '—' }}
                  </td>
                  
                  <td class="px-5 py-4">
                    <UiStatusBadge :status="normalizeStatusProp(app.status?.name)" />
                  </td>
                  <td class="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
  {{ formatDate(app.submitted_at) }}
</td>
                  <td class="px-5 py-4">
                   <NuxtLink
  :to="localePath(`/student/prihlasky/${app.id}`)"
  class="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-opacity"
>
  Detail
  <ArrowRight class="w-3 h-3" />
</NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
 
          <!-- Footer: count + pagination -->
          <div class="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/40">
            <p class="text-xs text-gray-400">
              {{ paginationMeta.from }}–{{ paginationMeta.to }} z {{ paginationMeta.total }} žiadostí
            </p>
            <UiPagination
              :current-page="currentPage"
              :total-pages="totalPages"
              :max-visible="5"
              @update:current-page="currentPage = $event"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
 
<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import {
  Search,
  LayoutGrid,
  Tag,
  ChevronDown,
  X,
  Loader2,
  FileX,
  ArrowRight,
  Plus,
} from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'

const localePath = useLocalePath()

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
   roles: ['student'],
})
 
// ─── Types ───────────────────────────────────────────────────────────────────
 
interface ProgramType {
  id: number
  name: string
}
 
interface ApplicationStatus {
  id: number
  name: string
}
 
interface Application {
  id: number
  submitted_at: string       
  last_update: string
  reference: string
  academic_flag: boolean
  call?: { id: number; name: string }
  status?: { id: number; name: string }
  team?: { id: number; name: string }
  documents?: { id: number; name: string; uploaded_at: string }[]
  category: {
    id: number
    categoryTranslations?: { id: number; category_id: number; language_id: number; name: string }[]
  } | null                   // Explicitly allow null to prevent runtime type crashes
}
 
interface PaginationMeta {
  from: number
  to: number
  total: number
  last_page: number
}
 
// ─── State ───────────────────────────────────────────────────────────────────
 
const api = useApi()
 
const programTypes = ref<ProgramType[]>([])
const statuses = ref<ApplicationStatus[]>([])
const applications = ref<Application[]>([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const paginationMeta = reactive<PaginationMeta>({ from: 0, to: 0, total: 0, last_page: 1 })
 
const filters = reactive({
  search: '',
  program_type_id: '' as number | '',
  status_id: '' as number | '',
})
 
// ─── Computed ─────────────────────────────────────────────────────────────────
 
const hasActiveFilters = computed(
  () => filters.search !== '' || filters.program_type_id !== '' || filters.status_id !== '',
)
 
// ─── Helpers ─────────────────────────────────────────────────────────────────
 
function categoryName(app: Application): string {
  const translation = app.category?.categoryTranslations?.[0]
  return translation?.name ?? '—'
}
 
function formatDate(iso?: string): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(iso),
  )
}
 
function clearFilters() {
  filters.search = ''
  filters.program_type_id = ''
  filters.status_id = ''
  currentPage.value = 1
}
 
// ─── Fetch helpers ────────────────────────────────────────────────────────────
 
async function fetchLookups() {
  const [ptRes, stRes] = await Promise.all([
    api.get('/program-types'),
    api.get('/status-of-applications'),
  ])
  programTypes.value = ptRes ?? []
  statuses.value = stRes.statuses ?? []
}
 
async function fetchApplications() {
  loading.value = true
  try {
    const params: Record<string, string | number> = {
      per_page: 15,
      page: currentPage.value,
    }
    if (filters.search) params.search = filters.search
    if (filters.program_type_id !== '') params.program_type_id = filters.program_type_id
    if (filters.status_id !== '') params.status_id = filters.status_id
 
    const res = await api.get<any>('/applications', { params })
 
    // Secure binding fallback depending on whether useApi unpacks the network response wrapper
    const rawPayload = res.data && res.meta ? res : res.data;
    
    applications.value = rawPayload?.data ?? []
 
    const meta = rawPayload?.meta ?? {}
    paginationMeta.from = meta.from ?? 0
    paginationMeta.to = meta.to ?? 0
    paginationMeta.total = meta.total ?? 0
    paginationMeta.last_page = meta.last_page ?? 1
    totalPages.value = meta.last_page ?? 1
  } catch (error) {
    console.error("Failed fetching applications:", error)
  } finally {
    loading.value = false
  }
}
 
// Immediate filter changes — reset page then fetch
watch([() => filters.program_type_id, () => filters.status_id], () => {
  currentPage.value = 1
  fetchApplications()
})
 
// Page change
watch(currentPage, fetchApplications)
 
// ─── Init ─────────────────────────────────────────────────────────────────────
 
onMounted(async () => {
  await fetchLookups()
  await fetchApplications()
})

const dbStatusMap: Record<string, string> = {
  'Draft': 'draft',
  'Podané': 'submitted',
  'V hodnotení': 'evaluating',
  'Vyžiadané doplnenie': 'pending', // Reuses pending styles (amber/warning colors)
  'Schválené': 'approved',
  'Zamietnuté': 'rejected',
  'Pozastavené': 'paused',
  'Onboarding': 'pending_onboarding', // Maps to user onboarding style variations cleanly
  'Aktívny projekt': 'active',
  'Ukončené': 'completed',
}

function normalizeStatusProp(dbStatusName?: string): string {
  if (!dbStatusName) return 'draft'
  return dbStatusMap[dbStatusName] ?? dbStatusName.toLowerCase()
}
</script>