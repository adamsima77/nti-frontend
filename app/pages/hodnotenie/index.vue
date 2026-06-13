<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="mb-10 flex items-start justify-between">
      <ClientOnly>
      <div>
        <h1 class="text-3xl font-bold text-navy mb-1">{{ $t('evaluator.welcome', { name: userDisplayName }) }}</h1>
        <p class="text-gray-500">{{ $t('evaluator.subtitle') }}</p>
      </div>
      </ClientOnly>

   
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-blue-600 p-5">
        <div class="text-3xl font-bold text-blue-600">{{ stats.total }}</div>
        <p class="text-sm text-gray-500 mt-1">{{ $t('evaluator.stats.total') }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-amber-500 p-5">
        <div class="text-3xl font-bold text-warning-500">{{ stats.pending }}</div>
        <p class="text-sm text-gray-500 mt-1">{{ $t('evaluator.stats.pending') }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-green-600 p-5">
        <div class="text-3xl font-bold text-success-500">{{ stats.evaluated }}</div>
        <p class="text-sm text-gray-500 mt-1">{{ $t('evaluator.stats.evaluated') }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-gray-400 p-5">
        <div class="text-3xl font-bold text-gray-600">{{ stats.decided }}</div>
        <p class="text-sm text-gray-500 mt-1">{{ $t('evaluator.stats.decided') }}</p>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="!loading.dashboard && !assignedCalls.length && !recentApplications.length"
      class="bg-white rounded-xl border border-gray-100 py-16 text-center"
    >
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <ClipboardCheck class="w-8 h-8 text-gray-400" />
      </div>
      <p class="font-semibold text-navy mb-1">Zatiaľ žiadne pridelené prihlášky</p>
      <p class="text-sm text-gray-400">Administrátor vám pridelí prihlášky na hodnotenie.</p>
    </div>

    <div
      v-if="assignedCalls.length"
      class="mb-8"
    >
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-navy">{{ $t('evaluator.apps') }}</h2>
        <NuxtLink
          :to="localePath('/hodnotenie/zoznam')"
          class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          {{ $t('evaluator.go_to_list') }} <ChevronRight class="w-4 h-4" />
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          v-for="call in assignedCalls"
          :key="call.id"
          class="bg-white rounded-lg border border-gray-100 p-5 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between gap-3 mb-3">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <h3 class="font-semibold text-navy text-base">{{ call.name }}</h3>
                <span
                  class="text-xs px-2 py-0.5 rounded-full font-medium"
                  :class="call.program === 'A' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'"
                >
                  Program {{ call.program }}
                </span>
              </div>
            </div>
            <span class="text-xs text-gray-400">{{ call.applications_pending ?? 0 }} nehodnotených</span>
          </div>

          <div class="bg-gray-100 rounded-full h-2 mb-2">
            <div
              class="h-2 rounded-full bg-blue-600"
              :style="{ width: `${call.applications_total ? Math.min((call.applications_evaluated / call.applications_total) * 100, 100) : 0}%` }"
            />
          </div>

          <div class="flex justify-between text-xs text-gray-500 mb-4">
            <span>Ohodnotené: {{ call.applications_evaluated }}/{{ call.applications_total }}</span>
            <span>Stav: {{ call.status }}</span>
          </div>

          <NuxtLink
            :to="localePath(`/hodnotenie/zoznam?call=${call.id}`)"
            class="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {{ $t('evaluator.open_applications') }} <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <div
      v-if="urgentApplications.length"
      class="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-5"
    >
      <div class="flex items-center gap-2 mb-3">
        <AlertTriangle class="w-5 h-5 text-amber-600" />
        <h2 class="text-lg font-semibold text-amber-800">{{ $t('evaluator.urgent_header') }}</h2>
      </div>
      <ul class="space-y-2">
        <li
          v-for="app in urgentApplications"
          :key="app.id"
          class="flex items-center justify-between"
        >
          <span class="text-sm text-amber-700">{{ app.projectName }} — {{ app.teamName }}</span>
          <NuxtLink
            :to="`/hodnotenie/${app.id}`"
            class="text-sm font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1"
          >
            {{ $t('evaluator.action.evaluate') }} <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </li>
      </ul>
    </div>

    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-navy">{{ $t('evaluator.recent_applications') }}</h2>
        <NuxtLink
          :to="localePath('/hodnotenie/zoznam')"
          class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          {{ $t('evaluator.view_all') }} <ChevronRight class="w-4 h-4" />
        </NuxtLink>
      </div>

      <div class="space-y-3">
        <div
          v-for="app in recentApplications"
          :key="app.id"
          class="bg-white rounded-lg border border-gray-100 p-5 hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <h3 class="font-semibold text-navy text-base">{{ app.projectName }}</h3>
                <UiStatusBadge :status="app.status" />
                <span
                  class="text-xs px-2 py-0.5 rounded-full font-medium"
                  :class="app.program === 'A' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'"
                >
                  Program {{ app.program }}
                </span>
              </div>
              <p class="text-sm text-gray-500 mb-3">
                {{ app.teamName }} · Podané {{ app.submitted_at }}
              </p>
              
              <div
                v-if="app.my_score !== null"
                class="flex items-center gap-3"
              >
                <div class="flex items-center gap-1.5">
                  <Star class="w-4 h-4 text-warning-500" />
                  <span class="text-sm font-semibold text-navy">{{ app.my_score }}/{{ app.max_score }}</span>
                  <span class="text-xs text-gray-400">váš skór</span>
                </div>
                <div
                  v-if="app.avgScore !== null"
                  class="flex items-center gap-1.5"
                >
                  </div>
              </div>
            </div>
            
            <div class="shrink-0">
              <NuxtLink
                :to="`/hodnotenie/${app.id}`"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="
  app.my_submitted_at == null && ['evaluating', 'submitted', 'under_review'].includes(app.status)
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
"
              >
                <ClipboardCheck
  v-if="app.my_submitted_at == null && ['evaluating', 'submitted', 'under_review'].includes(app.status)"
  class="w-4 h-4"
/>
                <Eye
                  v-else
                  class="w-4 h-4"
                />
               {{ app.my_submitted_at == null && ['evaluating', 'submitted', 'under_review'].includes(app.status) ? 'Hodnotiť' : 'Detail' }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { ChevronRight, AlertTriangle, Star, ClipboardCheck, Eye } from 'lucide-vue-next'
import { useEvaluatorDashboard } from '~/composables/useEvaluatorDashboard'
import { useAuthStore } from '~/stores/auth'

const localePath = useLocalePath()
const { setLocale, locale } = useI18n()
const authStore = useAuthStore()
const { dashboard, loading, fetchDashboard } = useEvaluatorDashboard()

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['evaluator'],
})

useHead({ title: 'Dashboard | NTI Komisia' })

const userDisplayName = computed(() => {
  const u = authStore.user
  if (!u) return 'Hodnotiteľ'
  const fullName = [u.name, u.surname].filter(Boolean).join(' ').trim()
  return fullName || u.email
})

const transformedApplications = computed(() => {
  const rawApps = dashboard.value?.applications ?? []
  const callsList = dashboard.value?.calls ?? []

  return rawApps.map((app: any) => {
    const matchingCall = callsList.find((c: any) => c.id === app.call_id)
    let maxScore = 40
    if (matchingCall?.criteria?.length > 0) {
      maxScore = matchingCall.criteria.length * 20
    }
    return { ...app, max_score: maxScore }
  })
})

const assignedCalls = computed(() => {
  const calls = dashboard.value?.calls ?? []
  const apps = transformedApplications.value

  return calls.map((call: any) => {
    const callApps = apps.filter((app: any) => app.call_id === call.id)
    const evaluated = callApps.filter((app: any) => app.my_submitted_at != null).length
    const pending = callApps.filter((app: any) => app.my_submitted_at == null).length

    return {
      ...call,
      applications_evaluated: evaluated,
      applications_total: callApps.length,
      applications_pending: pending,
    }
  })
})

const recentApplications = computed(() => {
  return transformedApplications.value.slice(0, 3)
})

const urgentApplications = computed(() => {
  const direct = dashboard.value?.urgentApplications ?? []
  if (direct.length) return direct

  return transformedApplications.value.filter((app: any) =>
    app.my_submitted_at == null &&
    ['evaluating', 'submitted', 'under_review'].includes(app.status)
  )
})

const stats = computed(() => {
  const s = dashboard.value?.stats ?? {}
  const apps = transformedApplications.value

  return {
    total: s.total ?? apps.length,
    pending: s.pending ?? apps.filter((app: any) => app.my_submitted_at == null).length,
    evaluated: s.evaluated ?? apps.filter((app: any) => app.my_submitted_at != null).length,
    decided: s.decided ?? 0,
  }
})

onMounted(async () => {
  await fetchDashboard()
})
</script>