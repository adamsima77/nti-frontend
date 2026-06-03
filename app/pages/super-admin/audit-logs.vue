<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 antialiased text-slate-800">
    <!-- Header Section -->
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
      <div>
        <div class="flex items-center gap-2.5">
          <div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <ShieldAlert class="w-5 h-5" />
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">{{ $t('superadmin_dashboard.auditLogs.title_1') }}</h1>
        </div>
        <p class="text-sm text-slate-500 mt-1.5 ml-0 sm:ml-9">{{ $t('superadmin_dashboard.auditLogs.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-3" />
    </div>

    <div class="space-y-6">
      <!-- Filter Card Panel -->
      <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <div class="flex flex-col lg:flex-row items-stretch lg:items-end gap-5">
          
          <!-- Year Selector -->
          <div class="flex-1 min-w-[160px] space-y-2">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {{ $t('filters.year') }}
            </label>
            <div class="relative rounded-lg border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/80 transition-all flex items-center px-3 py-2">
              <CalendarDays class="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <select 
                v-model="filters.year" 
                class="w-full bg-transparent text-sm text-slate-700 font-medium focus:outline-none cursor-pointer appearance-none pr-6"
              >
                <option value="">{{ $t('filters.any') }}</option>
                <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
              </select>
              <ChevronDown class="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>

          <!-- Day Selector -->
          <div class="flex-1 min-w-[180px] space-y-2">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {{ $t('filters.day') }}
            </label>
            <div class="relative rounded-lg border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/80 transition-all flex items-center px-3 py-2">
              <Calendar class="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input 
                v-model="filters.day" 
                type="date" 
                class="w-full bg-transparent text-sm text-slate-700 font-medium focus:outline-none cursor-pointer scheme-light" 
              />
            </div>
          </div>

          <!-- Time Range Selectors -->
          <div class="flex-[1.5] min-w-[280px] space-y-2">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {{ $t('filters.time') }}
            </label>
            <div class="flex items-center gap-2">
              <!-- Time From -->
              <div class="flex-1 relative rounded-lg border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/80 transition-all flex items-center px-2.5 py-2">
                <Clock class="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                <input 
                  v-model="filters.time_from" 
                  type="time" 
                  class="w-full bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer" 
                />
              </div>
              
              <div class="text-slate-300 font-bold shrink-0 px-0.5">—</div>
              
              <!-- Time To -->
              <div class="flex-1 relative rounded-lg border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/80 transition-all flex items-center px-2.5 py-2">
                <Clock class="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                <input 
                  v-model="filters.time_to" 
                  type="time" 
                  class="w-full bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer" 
                />
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2.5 pt-4 lg:pt-0 shrink-0">
            <button 
              @click="clearFilters" 
              class="px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 active:bg-slate-100 transition-all shadow-xs whitespace-nowrap"
            >
              {{ $t('filters.clear') }}
            </button>
            <button 
              @click="applyFilters" 
              class="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Filter class="w-4 h-4" />
              {{ $t('filters.apply') }}
            </button>
          </div>

        </div>
      </div>

      <!-- Main Logs Container -->
      <div class="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div v-if="loading" class="py-24 flex flex-col justify-center items-center gap-3">
          <UiLoader />
          <p class="text-xs text-slate-400 animate-pulse">Loading system activities...</p>
        </div>

        <template v-else>
          <div v-if="auditLogs.length">
            <div class="overflow-x-auto">
              <table class="w-full text-sm border-collapse">
                <thead>
                  <tr class="border-b border-slate-100 bg-slate-50/75">
                    <th class="text-left px-6 py-4 font-bold text-slate-500 whitespace-nowrap tracking-wider text-xs uppercase">{{ $t('superadmin_dashboard.auditLogs.columns.actor') }}</th>
                    <th class="text-left px-6 py-4 font-bold text-slate-500 whitespace-nowrap tracking-wider text-xs uppercase">{{ $t('superadmin_dashboard.auditLogs.columns.source') }}</th>
                    <th class="text-left px-6 py-4 font-bold text-slate-500 whitespace-nowrap tracking-wider text-xs uppercase">{{ $t('superadmin_dashboard.auditLogs.columns.type') }}</th>
                    <th class="text-left px-6 py-4 font-bold text-slate-500 whitespace-nowrap tracking-wider text-xs uppercase">{{ $t('superadmin_dashboard.auditLogs.columns.severity') }}</th>
                    <th class="text-left px-6 py-4 font-bold text-slate-500 whitespace-nowrap tracking-wider text-xs uppercase">{{ $t('superadmin_dashboard.auditLogs.columns.message') }}</th>
                    <th class="text-left px-6 py-4 font-bold text-slate-500 whitespace-nowrap tracking-wider text-xs uppercase">{{ $t('superadmin_dashboard.auditLogs.columns.object') }}</th>
                    <th class="text-left px-6 py-4 font-bold text-slate-500 whitespace-nowrap tracking-wider text-xs uppercase">{{ $t('superadmin_dashboard.auditLogs.columns.ipAddress') }}</th>
                    <th class="text-left px-6 py-4 font-bold text-slate-500 whitespace-nowrap tracking-wider text-xs uppercase">{{ $t('superadmin_dashboard.auditLogs.columns.timestamp') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="log in auditLogs" :key="`${log.source}-${log.id}`" class="hover:bg-slate-50/60 transition-colors">
                    
                    <!-- Actor Column -->
                    <td class="px-6 py-4 font-medium whitespace-nowrap">
                      <div class="flex items-center gap-2.5">
                        <div class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <User2 class="w-3.5 h-3.5" />
                        </div>
                        <span class="text-slate-700 font-medium tracking-tight text-sm">{{ log.user?.email ?? 'System' }}</span>
                      </div>
                    </td>

                    <!-- Source Badge Column -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-xs" :class="log.source === 'audit_event' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-amber-50 text-amber-700 border-amber-100'">
                        <span class="w-1.5 h-1.5 rounded-full" :class="log.source === 'audit_event' ? 'bg-purple-500' : 'bg-amber-500'" />
                        {{ log.source === 'audit_event' ? 'Audit' : 'System' }}
                      </span>
                    </td>

                    <!-- Type Column -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/70">{{ log.type ?? '—' }}</span>
                    </td>

                    <!-- Severity Column -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border shadow-xs" :class="getSeverityClass(log.severity)">
                        {{ log.severity ?? '—' }}
                      </span>
                    </td>

                    <!-- Message Column -->
                    <td class="px-6 py-4 text-slate-600 max-w-[280px] truncate font-medium text-sm" :title="log.message">
                      {{ log.message ?? '—' }}
                    </td>

                    <!-- Object Type & ID Column -->
                    <td class="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                      <template v-if="log.object_type">
                        <div class="flex flex-col gap-0.5">
                          <span class="font-bold text-slate-700">{{ log.object_type }}</span>
                          <span class="text-slate-400 font-mono tracking-tight text-[11px]">ID: #{{ log.object_id }}</span>
                        </div>
                      </template>
                      <span v-else class="text-slate-300">—</span>
                    </td>

                    <!-- IP Column -->
                    <td class="px-6 py-4 text-slate-500 font-mono text-xs whitespace-nowrap tracking-tight">
                      {{ log.ip ?? '—' }}
                    </td>

                    <!-- Timestamp Column -->
                    <td class="px-6 py-4 text-slate-500 text-xs whitespace-nowrap font-medium">
                      {{ formatDate(log.created_at) }}
                    </td>

                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination Layout -->
            <div v-if="meta.last_page > 1" class="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <p class="text-xs text-slate-400 font-semibold tracking-wide uppercase">
                {{ $t('superadmin_dashboard.auditLogs.page', { current: meta.current_page, total: meta.last_page }) }}
              </p>
              <div class="flex items-center gap-2">
                <button 
                  class="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs" 
                  :disabled="meta.current_page <= 1" 
                  @click="changePage(meta.current_page - 1)"
                >
                  <ChevronLeft class="w-4 h-4" />
                </button>
                <button 
                  class="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs" 
                  :disabled="meta.current_page >= meta.last_page" 
                  @click="changePage(meta.current_page + 1)"
                >
                  <ChevronRight class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-20 bg-white text-slate-400">
            <div class="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <ShieldAlert class="w-6 h-6 opacity-80" />
            </div>
            <p class="text-sm font-semibold text-slate-600">{{ $t('superadmin_dashboard.auditLogs.empty') }}</p>
            <p class="text-xs text-slate-400 mt-1">Try modifying your filtering parameters.</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ShieldAlert, ChevronLeft, ChevronRight, User2, CalendarDays, Calendar, Clock, Filter, ChevronDown } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
  roles: ['nti_superadmin'],
})

useHead({ title: 'Audit Logs — Super Admin | NTI' })

const api = useApi()

const loading = ref(true)
const auditLogs = ref<any[]>([])
const meta = ref({ current_page: 1, last_page: 1, per_page: 15, total: 0 })

const filters = ref({ year: '', day: '', time_from: '', time_to: '' })

const years = computed(() => {
  const y = new Date().getFullYear()
  const list: number[] = []
  for (let i = 0; i < 6; i++) list.push(y - i)
  return list
})

const getSeverityClass = (severity: string | null): string => {
  switch (severity?.toUpperCase()) {
    case 'ERROR':
    case 'FAILURE':
    case 'CRITICAL':
      return 'bg-rose-50 text-rose-700 border-rose-100'
    case 'WARNING':
      return 'bg-amber-50 text-amber-700 border-amber-100'
    case 'INFO':
    case 'SUCCESS':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100'
    default:
      return 'bg-slate-50 text-slate-600 border-slate-100'
  }
}

const formatDate = (value: string | null): string => {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

const buildParams = (page = 1) => {
  const p: Record<string, any> = { page, per_page: meta.value.per_page }
  if (filters.value.year) p.year = filters.value.year
  if (filters.value.day) p.day = filters.value.day
  if (filters.value.time_from) p.time_from = filters.value.time_from
  if (filters.value.time_to) p.time_to = filters.value.time_to
  return p
}

const fetchAuditLogs = async (page = 1) => {
  loading.value = true
  try {
    const res = await api.get('/fetch-all-logs', { params: buildParams(page) })
    auditLogs.value = res.data ?? []
    meta.value = {
      current_page: res.current_page,
      last_page: res.last_page,
      per_page: res.per_page,
      total: res.total,
    }
  } catch (err) {
    console.error('Failed to fetch audit logs:', err)
    auditLogs.value = []
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => fetchAuditLogs(page)

const applyFilters = () => fetchAuditLogs(1)
const clearFilters = () => {
  filters.value = { year: '', day: '', time_from: '', time_to: '' }
  fetchAuditLogs(1)
}

onMounted(() => {
  fetchAuditLogs()
})
</script>