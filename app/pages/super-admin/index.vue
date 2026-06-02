<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <!-- Header -->
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-navy">{{ $t('superadmin_dashboard.title') }}</h1>
        <p class="text-gray-500 mt-1">{{ $t('superadmin_dashboard.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-3">
       
      </div>
    </div>

    <!-- Global Platform Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div
        v-for="stat in stats"
        :key="stat.labelKey"
        class="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-4 relative min-h-[90px]"
      >
        <div v-if="loadingStats" class="absolute inset-0 flex items-center justify-center">
          <UiLoader class="!min-h-0 scale-75" />
        </div>
        <template v-else>
          <div class="w-1 h-12 rounded-full" :class="stat.borderColor" />
          <div>
            <p class="text-sm text-gray-500">{{ $t(stat.labelKey) }}</p>
            <p class="text-2xl font-bold text-navy">{{ stat.value }}</p>
          </div>
        </template>
      </div>
    </div>

    <!-- Single Column Stack Layout -->
    <div class="space-y-8">

      <!-- 1. System Audit Logs & Security Oversight Section -->
      <div class="bg-white rounded-lg border border-gray-200 p-6 relative min-h-[200px]">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-2">
          <h2 class="text-lg font-semibold text-navy flex items-center gap-2">
            <ShieldAlert class="w-5 h-5 text-red-600" />
            {{ $t('superadmin_dashboard.auditLogs.title') }}
          </h2>
          <NuxtLink
            :to="localePath('/superadmin/audit-logs')"
            class="text-xs font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-0.5"
          >
            {{ $t('superadmin_dashboard.auditLogs.viewAll') }}
            <ChevronRight class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>

        <div v-if="loadingAudit" class="py-10 flex justify-center items-center">
          <UiLoader class="!min-h-0" />
        </div>

        <template v-else>
          <div v-if="auditLogs.length" class="border border-gray-100 rounded-md overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-100 bg-gray-50">
                    <th class="text-left px-5 py-3 font-medium text-gray-500 whitespace-nowrap">
                      {{ $t('superadmin_dashboard.auditLogs.columns.actor') }}
                    </th>
                    <th class="text-left px-5 py-3 font-medium text-gray-500 whitespace-nowrap">
                      {{ $t('superadmin_dashboard.auditLogs.columns.source') }}
                    </th>
                    <th class="text-left px-5 py-3 font-medium text-gray-500 whitespace-nowrap">
                      {{ $t('superadmin_dashboard.auditLogs.columns.type') }}
                    </th>
                    <th class="text-left px-5 py-3 font-medium text-gray-500 whitespace-nowrap">
                      {{ $t('superadmin_dashboard.auditLogs.columns.severity') }}
                    </th>
                    <th class="text-left px-5 py-3 font-medium text-gray-500 whitespace-nowrap">
                      {{ $t('superadmin_dashboard.auditLogs.columns.message') }}
                    </th>
                    <th class="text-left px-5 py-3 font-medium text-gray-500 whitespace-nowrap">
                      {{ $t('superadmin_dashboard.auditLogs.columns.object') }}
                    </th>
                    <th class="text-left px-5 py-3 font-medium text-gray-500 whitespace-nowrap">
                      {{ $t('superadmin_dashboard.auditLogs.columns.ipAddress') }}
                    </th>
                    <th class="text-left px-5 py-3 font-medium text-gray-500 whitespace-nowrap">
                      {{ $t('superadmin_dashboard.auditLogs.columns.timestamp') }}
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr
                    v-for="log in auditLogs"
                    :key="`${log.source}-${log.id}`"
                    class="hover:bg-gray-50/60 transition-colors"
                  >
                    <!-- Actor -->
                    <td class="px-5 py-3 font-medium text-navy whitespace-nowrap">
                      <div class="flex items-center gap-1.5">
                        <User2 class="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{{ log.user?.email ?? 'System' }}</span>
                      </div>
                    </td>

                    <!-- Source badge -->
                    <td class="px-5 py-3 whitespace-nowrap">
                      <span
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                        :class="log.source === 'audit_event'
                          ? 'bg-purple-50 text-purple-700 border-purple-100'
                          : 'bg-orange-50 text-orange-700 border-orange-100'"
                      >
                        <span
                          class="w-1.5 h-1.5 rounded-full"
                          :class="log.source === 'audit_event' ? 'bg-purple-500' : 'bg-orange-500'"
                        />
                        {{ log.source === 'audit_event' ? 'Audit' : 'System' }}
                      </span>
                    </td>

                    <!-- Type -->
                    <td class="px-5 py-3 whitespace-nowrap">
                      <span class="text-xs font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                        {{ log.type ?? '—' }}
                      </span>
                    </td>

                    <!-- Severity / Result badge -->
                    <td class="px-5 py-3 whitespace-nowrap">
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border"
                        :class="getSeverityClass(log.severity)"
                      >
                        {{ log.severity ?? '—' }}
                      </span>
                    </td>

                    <!-- Message -->
                    <td class="px-5 py-3 text-gray-600 max-w-[220px] truncate" :title="log.message">
                      {{ log.message ?? '—' }}
                    </td>

                    <!-- Object type + id (audit only) -->
                    <td class="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                      <template v-if="log.object_type">
                        <span class="font-medium text-gray-700">{{ log.object_type }}</span>
                        <span class="text-gray-400"> #{{ log.object_id }}</span>
                      </template>
                      <span v-else class="text-gray-300">—</span>
                    </td>

                    <!-- IP -->
                    <td class="px-5 py-3 text-gray-400 font-mono text-xs whitespace-nowrap">
                      {{ log.ip ?? '—' }}
                    </td>

                    <!-- Timestamp -->
                    <td class="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {{ formatDate(log.created_at) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div
              v-if="auditMeta.last_page > 1"
              class="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50"
            >
              <p class="text-xs text-gray-400">
                {{ $t('superadmin_dashboard.auditLogs.page', { current: auditMeta.current_page, total: auditMeta.last_page }) }}
              </p>
              <div class="flex items-center gap-1">
                <button
                  class="p-1.5 rounded hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  :disabled="auditMeta.current_page <= 1"
                  @click="changeAuditPage(auditMeta.current_page - 1)"
                >
                  <ChevronLeft class="w-4 h-4 text-gray-600" />
                </button>
                <button
                  class="p-1.5 rounded hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  :disabled="auditMeta.current_page >= auditMeta.last_page"
                  @click="changeAuditPage(auditMeta.current_page + 1)"
                >
                  <ChevronRight class="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-10 border border-dashed border-gray-200 rounded-md bg-gray-50/20">
            <ShieldAlert class="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p class="text-sm text-gray-400">{{ $t('superadmin_dashboard.auditLogs.empty') }}</p>
          </div>
        </template>
      </div>

      <!-- 2. Two-Column System Status Block -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <!-- GDPR Compliance & Automated Retention Status -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 relative min-h-[180px]">
          <h2 class="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <Fingerprint class="w-5 h-5 text-purple-600" />
            {{ $t('superadmin_dashboard.gdprOversight.title') }}
          </h2>

          <div v-if="loadingCompliance" class="py-6 flex justify-center items-center">
            <UiLoader class="!min-h-0" />
          </div>

          <template v-else>
            <div class="space-y-4 text-sm">
              <div class="p-3 bg-gray-50 rounded-md border border-gray-100 flex items-center justify-between">
                <div>
                  <p class="font-medium text-navy">{{ $t('superadmin_dashboard.gdprOversight.retentionPruning') }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ $t('superadmin_dashboard.gdprOversight.lastExecution') }}: {{ complianceStatus.lastRun || '—' }}</p>
                </div>
                <span
                  class="inline-flex items-center px-2 py-1 rounded text-xs font-medium border"
                  :class="complianceStatus.status === 'WARNING'
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    : 'bg-green-50 text-green-700 border-green-200'"
                >
                  {{ complianceStatus.status === 'WARNING'
                    ? $t('superadmin_dashboard.status.warning')
                    : $t('superadmin_dashboard.status.active') }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="border border-gray-100 rounded-md p-3 bg-gray-50/30">
                  <p class="text-xs text-gray-500">{{ $t('superadmin_dashboard.gdprOversight.pendingAnonymization') }}</p>
                  <p class="text-xl font-bold text-navy mt-1">{{ complianceStatus.awaitingAnonymization ?? 0 }}</p>
                </div>
                <div class="border border-gray-100 rounded-md p-3 bg-gray-50/30">
                  <p class="text-xs text-gray-500">{{ $t('superadmin_dashboard.gdprOversight.expiredDataPruned') }}</p>
                  <p class="text-xl font-bold text-navy mt-1">{{ complianceStatus.deletedExpiredRecords ?? 0 }}</p>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Infrastructure & Services Integrations Status -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 relative min-h-[180px]">
          <h2 class="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <ServerCrash class="w-5 h-5 text-blue-600" />
            {{ $t('superadmin_dashboard.integrations.title') }}
          </h2>

          <div v-if="loadingIntegrations" class="py-6 flex justify-center items-center">
            <UiLoader class="!min-h-0" />
          </div>

          <template v-else>
            <div class="divide-y divide-gray-100">
              <div
                v-for="service in integrations"
                :key="service.name"
                class="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-sm"
              >
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-2 h-2 rounded-full"
                    :class="{
                      'bg-green-500': service.status === 'OK',
                      'bg-yellow-400': service.status === 'WARNING',
                      'bg-red-500': service.status === 'ERROR',
                    }"
                  />
                  <span class="font-medium text-gray-700 capitalize">{{ service.name }}</span>
                </div>
                <span class="text-xs font-mono text-gray-400">{{ service.message }}</span>
              </div>
            </div>
          </template>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ShieldAlert,
  Users,
  ChevronRight,
  ChevronLeft,
  Fingerprint,
  ServerCrash,
  Cpu,
  Database,
  Lock,
  Bell,
  Settings,
  User2,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
  roles: ['nti_superadmin'],
})

useHead({ title: 'Dashboard — Super Admin | NTI' })

const api = useApi()
const localePath = useLocalePath()

// ── Loading states ────────────────────────────────────────
const loadingStats       = ref(true)
const loadingAudit       = ref(true)
const loadingCompliance  = ref(true)
const loadingIntegrations = ref(true)

// ── Stat counters ─────────────────────────────────────────
const globalUsersCount    = ref<any>(null)
const organizationsCount  = ref<any>(null)
const systemErrorsCount   = ref<any>(null)
const securityAlertsCount = ref<any>(null)

// ── Audit logs ────────────────────────────────────────────
const auditLogs = ref<any[]>([])
const auditMeta = ref({
  current_page: 1,
  last_page:    1,
  per_page:     15,
  total:        0,
})

// ── GDPR / integrations ───────────────────────────────────
const complianceStatus = ref<Record<string, any>>({})
const integrations     = ref<{ name: string; status: string; message: string }[]>([])

// ── Computed stats ────────────────────────────────────────
const stats = computed(() => [
  {
    labelKey:    'superadmin_dashboard.stats.totalUsers',
    value:       globalUsersCount.value?.count ?? 0,
    borderColor: 'bg-blue-500',
  },
  {
    labelKey:    'superadmin_dashboard.stats.totalOrganizations',
    value:       organizationsCount.value?.count ?? 0,
    borderColor: 'bg-green-500',
  },
  {
    labelKey:    'superadmin_dashboard.stats.systemErrors',
    value:       systemErrorsCount.value?.count ?? 0,
    borderColor: 'bg-orange-500',
  },
  {
    labelKey:    'superadmin_dashboard.stats.securityAlerts',
    value:       securityAlertsCount.value?.count ?? 0,
    borderColor: 'bg-red-500',
  },
])

// ── Helpers ───────────────────────────────────────────────

/**
 * Returns Tailwind classes for severity / result values.
 * Handles both SystemEvent severities (ERROR, WARNING, INFO)
 * and AuditCompliance results (SUCCESS, FAILURE, etc.).
 */
const getSeverityClass = (severity: string | null): string => {
  switch (severity?.toUpperCase()) {
    case 'ERROR':
    case 'FAILURE':
    case 'CRITICAL':
      return 'bg-red-50 text-red-700 border-red-100'
    case 'WARNING':
      return 'bg-yellow-50 text-yellow-700 border-yellow-100'
    case 'INFO':
    case 'SUCCESS':
      return 'bg-green-50 text-green-700 border-green-100'
    default:
      return 'bg-gray-50 text-gray-600 border-gray-100'
  }
}

const formatDate = (value: string | null): string => {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

const normalizeServices = (raw: Record<string, any>) =>
  Object.entries(raw).map(([name, data]) => ({
    name,
    status:  data.status as 'OK' | 'WARNING' | 'ERROR',
    message: data.message ?? '',
  }))

// ── Data fetching ─────────────────────────────────────────

const fetchAuditLogs = async (page = 1) => {
  loadingAudit.value = true
  try {
    const res = await api.get('/logs', { params: { page, per_page: auditMeta.value.per_page } })
    auditLogs.value = res.data ?? []
    auditMeta.value = {
      current_page: res.current_page,
      last_page:    res.last_page,
      per_page:     res.per_page,
      total:        res.total,
    }
  } catch (err) {
    console.error('Failed to fetch audit logs:', err)
    auditLogs.value = []
  } finally {
    loadingAudit.value = false
  }
}

const changeAuditPage = (page: number) => {
  fetchAuditLogs(page)
}

// ── Lifecycle ─────────────────────────────────────────────
onMounted(() => {
  // 1. Platform stats (parallel)
  Promise.allSettled([
    api.get('/users-count').then(res => { globalUsersCount.value = res }),
    api.get('/organizations-count').then(res => { organizationsCount.value = res }),
    api.get('/active-problems').then(res => { systemErrorsCount.value = res }),
    api.get('/security-alerts').then(res => { securityAlertsCount.value = res }),
  ]).finally(() => { loadingStats.value = false })

  // 2. Audit logs
  fetchAuditLogs()

  // 3. GDPR compliance
  api.get('/gdpr-prune')
    .then(res => { complianceStatus.value = res })
    .catch(console.error)
    .finally(() => { loadingCompliance.value = false })

  // 4. Services heartbeat
  api.get('/status-of-services')
    .then(res => { integrations.value = normalizeServices(res.services ?? {}) })
    .catch(console.error)
    .finally(() => { loadingIntegrations.value = false })
})
</script>