<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-navy">{{ $t('admin_dashboard.title') }}</h1>
      <p class="text-gray-500 mt-1">{{ $t('admin_dashboard.subtitle') }}</p>
    </div>

    <!-- Stats cards -->
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
          <div
            class="w-1 h-12 rounded-full"
            :class="stat.borderColor"
          />
          <div>
            <p class="text-sm text-gray-500">{{ $t(stat.labelKey) }}</p>
            <p class="text-2xl font-bold text-navy">{{ stat.value }}</p>
          </div>
        </template>
      </div>
    </div>

    <!-- Single Column Stack Layout -->
    <div class="space-y-8">
      
      <!-- 1. Active calls Section -->
      <div class="bg-white rounded-lg border border-gray-200 p-6 relative min-h-[150px]">
        <h2 class="text-lg font-semibold text-navy mb-4">{{ $t('admin_dashboard.activeCalls.title') }}</h2>
        
        <div v-if="loadingCalls" class="py-8 flex justify-center items-center">
          <UiLoader class="!min-h-0" />
        </div>

        <template v-else>
          <div v-if="activecalls && activecalls.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="call in activecalls"
              :key="call.name"
              class="border border-gray-100 rounded-md p-4 bg-gray-50/30"
            >
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium text-navy truncate mr-2">{{ call.name }}</h3>
                <UiStatusBadge :status="statusMap[call.current_status_history?.status?.name] || 'draft'" class="shrink-0"/>
              </div>
              <p class="text-sm text-gray-500 truncate">{{ call.program }}</p>
              <div class="flex items-center justify-between mt-3 text-xs text-gray-400">
                <span>{{ $t('admin_dashboard.activeCalls.applicationsCount', { count: call.applications_count }) }}</span>
                <span>{{ $t('admin_dashboard.activeCalls.deadline') }}: {{ new Date(call.application_deadline).toISOString().split('T')[0] }}</span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 border border-dashed border-gray-200 rounded-md bg-gray-50/20">
            <p class="text-sm text-gray-400">{{ $t('admin_dashboard.activeCalls.empty') }}</p>
          </div>
        </template>
      </div>

      <!-- 2. Pending Approvals Section -->
      <div class="bg-white rounded-lg border border-gray-200 p-6 relative min-h-[150px]">
        <h2 class="text-lg font-semibold text-navy mb-4">{{ $t('admin_dashboard.pendingApprovals.title') }}</h2>
        
        <div v-if="loadingApprovals" class="py-8 flex justify-center items-center">
          <UiLoader class="!min-h-0" />
        </div>

        <template v-else>
          <div v-if="pendingApprovals && pendingApprovals.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="user in pendingApprovals"
              :key="user.id"
              class="border border-gray-100 rounded-md p-4 bg-gray-50/30 flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-medium text-navy truncate mr-2">
                    {{ user.name }} {{ user.surname }}
                  </h3>
                  <UiStatusBadge status="pending_approval" class="shrink-0"/>
                </div>
                <p class="text-sm font-semibold text-gray-700 truncate">
                  {{ user.organizations?.[0]?.name || $t('admin_dashboard.pendingApprovals.noOrganization') }}
                </p>
                <p class="text-xs text-gray-500 truncate mt-0.5">
                  {{ user.job_position || $t('admin_dashboard.pendingApprovals.noPosition') }}
                </p>
              </div>
              <div class="flex items-center justify-between mt-4 text-xs text-gray-400 border-t border-gray-100 pt-2">
                <span class="truncate max-w-[160px]">{{ user.email }}</span>
                <span>{{ $t('admin_dashboard.pendingApprovals.registration') }}: {{ user.created_at?.slice(0, 10) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 border border-dashed border-gray-200 rounded-md bg-gray-50/20">
            <p class="text-sm text-gray-400">{{ $t('admin_dashboard.pendingApprovals.empty') }}</p>
          </div>
        </template>
      </div>

      <!-- 3. Content overview table -->
      <div class="bg-white rounded-lg border border-gray-200 p-6 relative min-h-[200px]">
        <h2 class="text-lg font-semibold text-navy mb-4">{{ $t('cmsDashboard.overview.title') }}</h2>
        
        <div v-if="loadingOverview" class="py-12 flex justify-center items-center">
          <UiLoader class="!min-h-0" />
        </div>

        <template v-else>
          <div v-if="contentSections && contentSections.length" class="border border-gray-100 rounded-md overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-100 bg-gray-50">
                    <th class="text-left px-5 py-3 font-medium text-gray-500">{{ $t('cmsDashboard.overview.columns.section') }}</th>
                    <th class="text-left px-5 py-3 font-medium text-gray-500">{{ $t('cmsDashboard.overview.columns.published') }}</th>
                    <th class="text-left px-5 py-3 font-medium text-gray-500">{{ $t('cmsDashboard.overview.columns.drafts') }}</th>
                    <th class="text-left px-5 py-3 font-medium text-gray-500">{{ $t('cmsDashboard.overview.columns.lastEdited') }}</th>
                    <th class="text-left px-5 py-3 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr
                    v-for="section in contentSections"
                    :key="section.id"
                    class="hover:bg-gray-50 transition-colors"
                  >
                    <td class="px-5 py-4">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-md flex items-center justify-center" :class="section.iconBg">
                          <component :is="section.icon" class="w-4 h-4" :class="section.iconColor" />
                        </div>
                        <span class="font-medium text-navy">{{ $t(section.nameKey) }}</span>
                      </div>
                    </td>
                    <td class="px-5 py-4 text-gray-600">{{ section.published }}</td>
                    <td class="px-5 py-4">
                      <span
                        v-if="section.drafts > 0"
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700"
                      >
                        {{ section.drafts }}
                      </span>
                      <span v-else class="text-gray-400">—</span>
                    </td>
                    <td class="px-5 py-4 text-gray-500 text-xs">{{ section.lastEdited }}</td>
                    <td class="px-5 py-4 text-right">
                      <NuxtLink
                        :to="section.link"
                        class="text-xs font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-0.5"
                      >
                        {{ $t('cmsDashboard.overview.manage') }}
                        <ChevronRight class="w-3.5 h-3.5" />
                      </NuxtLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="text-center py-12 border border-dashed border-gray-200 rounded-md bg-gray-50/20">
            <p class="text-sm text-gray-400">{{ $t('admin_dashboard.cmsOverview.empty') }}</p>
          </div>
        </template>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  FileText, 
  Users, 
  ChevronRight,
  HelpCircle,
  Image,
  Newspaper,
  Layout
} from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
  roles: ['nti_admin', 'nti_superadmin'] 
})

useHead({ title: 'Dashboard — Admin | NTI' })

const api = useApi()
const localePath = useLocalePath()

const statusMap: Record<string, string> = {
  'Draft': 'draft',
  'Publikované': 'published',
  'V párovaní': 'matching',
  'Pridelené': 'assigned',
  'V realizácii': 'in_progress',
  'Uzavreté': 'closed',
}

// ── Scoped Loading States ─────────────────────────────────
const loadingStats = ref(true)
const loadingCalls = ref(true)
const loadingApprovals = ref(true)
const loadingOverview = ref(true)

// ── Admin Dashboard State ─────────────────────────────────
const applicationCount = ref<any>(null)
const activeChallengesCount = ref<any>(null)
const usersCount = ref<any>(null)
const teamsCount = ref<any>(null)
const activecalls = ref([])
const pendingApprovals = ref([])

// ── CMS Content Overview State ─────────────────────────────
const contentOverview = ref<Record<string, any>>({})

const sectionMeta: Record<string, { nameKey: string; link: string; icon: any; iconBg: string; iconColor: string }> = {
  news:               { nameKey: 'cmsDashboard.sections.news',              link: localePath('/cms/management?tab=clanky'),             icon: Newspaper,  iconBg: 'bg-blue-50',   iconColor: 'text-blue-600' },
  partners:           { nameKey: 'cmsDashboard.sections.partners',           link: localePath('/cms/management?tab=partneri'),           icon: Users,      iconBg: 'bg-green-50',  iconColor: 'text-green-600' },
  faq:                { nameKey: 'cmsDashboard.sections.faq',                link: localePath('/cms/management?tab=faq'),                icon: HelpCircle, iconBg: 'bg-amber-50',  iconColor: 'text-amber-600' },
  hero_banners:       { nameKey: 'cmsDashboard.sections.heroBanners',        link: localePath('/cms/management?tab=bannery'),            icon: Image,      iconBg: 'bg-pink-50',   iconColor: 'text-pink-600' },
  meta_tags:          { nameKey: 'cmsDashboard.sections.metaTags',           link: localePath('/cms/management?tab=meta_tags'),          icon: Layout,     iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  partner_references: { nameKey: 'cmsDashboard.sections.partnerReferences',  link: localePath('/cms/management?tab=partner_references'), icon: FileText,   iconBg: 'bg-gray-100',  iconColor: 'text-gray-600' },
}

const contentSections = computed(() => {
  if (!contentOverview.value || Object.keys(contentOverview.value).length === 0) return []
  
  return Object.entries(sectionMeta).map(([key, meta], i) => {
    const data = contentOverview.value[key] ?? {}
    return {
      id:         i + 1,
      nameKey:    meta.nameKey,
      published:  data.published ?? 0,
      drafts:     data.concepts  ?? 0,
      lastEdited: data.last_updated?.updated_at?.slice(0, 10) ?? '—',
      link:       meta.link,
      icon:       meta.icon,
      iconBg:     meta.iconBg,
      iconColor:  meta.iconColor,
    }
  })
})

// ── Computeds & Mount Fetching ─────────────────────────────
const stats = computed(() => [
  { 
    labelKey: 'admin_dashboard.stats.applications', 
    value: applicationCount.value?.count ?? 0, 
    borderColor: 'bg-blue-500' 
  },
  { 
    labelKey: 'admin_dashboard.stats.activeCalls', 
    value: activeChallengesCount.value?.count ?? 0,     
    borderColor: 'bg-green-500' 
  },
  { 
    labelKey: 'admin_dashboard.stats.users', 
    value: usersCount.value?.count ?? 0,            
    borderColor: 'bg-purple-500' 
  },
  { 
    labelKey: 'admin_dashboard.stats.teams', 
    value: teamsCount.value?.count ?? 0,                 
    borderColor: 'bg-orange-500' 
  },
])

onMounted(() => {
  // 1. Fetch Top Counters in Parallel
  Promise.allSettled([
    api.get('/admin/application-count').then(res => applicationCount.value = res),
    api.get('/admin/fetch-active-calls-count').then(res => activeChallengesCount.value = res),
    api.get('/admin/fetch-user-count').then(res => usersCount.value = res),
    api.get('/admin/fetch-team-count').then(res => teamsCount.value = res)
  ]).catch(console.error).finally(() => {
    loadingStats.value = false
  })
  
  // 2. Fetch Active Calls List
  api.get('/admin/fetch-active-calls')
    .then(res => { activecalls.value = res })
    .catch(console.error)
    .finally(() => { loadingCalls.value = false })

  // 3. Fetch Pending Approvals
  api.get('/admin/fetch-pending-approval')
    .then(res => { pendingApprovals.value = res })
    .catch(console.error)
    .finally(() => { loadingApprovals.value = false })

  // 4. Fetch CMS Content Overview
  api.get('/content-overview')
    .then(res => { contentOverview.value = res as Record<string, any> })
    .catch(error => { console.error('Failed to fetch content overview:', error) })
    .finally(() => { loadingOverview.value = false })
})
</script>