<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="mb-10 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-bold text-navy mb-1">{{ $t('evaluator.welcome', { name: userDisplayName }) }}</h1>
        <p class="text-gray-500">{{ $t('evaluator.subtitle') }}</p>
      </div>

      <div class="hidden md:flex items-center gap-1 ml-4">
        <button
          :class="[
            'px-2 py-1 text-xs font-medium rounded transition-colors duration-200',
            locale === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
          :title="$t('locale.en_title')"
          @click="setLocale('en')"
        >
          EN
        </button>
        <button
          :class="[
            'px-2 py-1 text-xs font-medium rounded transition-colors duration-200',
            locale === 'sk' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
          :title="$t('locale.sk_title')"
          @click="setLocale('sk')"
        >
          SK
        </button>
      </div>
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
              <p class="text-sm text-gray-500">{{ $t('evaluator.deadline_label') }}: {{ call.deadline }}</p>
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
                <span
                  v-if="app.deadline"
                  class="ml-2 text-warning-500 font-medium"
                >
                  · Deadline: {{ app.deadline }}
                </span>
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
                  app.my_score === null && ['evaluating', 'submitted', 'under_review'].includes(app.status)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                "
              >
                <ClipboardCheck
                  v-if="app.my_score === null && ['evaluating', 'submitted', 'under_review'].includes(app.status)"
                  class="w-4 h-4"
                />
                <Eye
                  v-else
                  class="w-4 h-4"
                />
                {{ app.my_score === null && ['evaluating', 'submitted', 'under_review'].includes(app.status) ? 'Hodnotiť' : 'Detail' }}
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
const { dashboard, fetchDashboard } = useEvaluatorDashboard()

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

const assignedCalls = computed(() => {
  return dashboard.value?.calls ?? []
})

// Centralizovaná transformácia dát, ktorá spočíta max_score na základe priradenej výzvy a jej kritérií
const transformedApplications = computed(() => {
  const rawApps = dashboard.value?.applications ?? []
  const callsList = assignedCalls.value

  return rawApps.map((app: any) => {
    // Nájdeme prislúchajúcu výzvu pre túto aplikáciu, aby sme získali zoznam kritérií
    const matchingCall = callsList.find((c: any) => c.id === app.call_id)
    
    let maxScore = 40 // Východzí fallback
    if (matchingCall && matchingCall.criteria && matchingCall.criteria.length > 0) {
      maxScore = matchingCall.criteria.length * 20
    }

    return {
      ...app,
      max_score: maxScore
    }
  })
})

const recentApplications = computed(() => {
  // Ak backend vracia špecifické pole recentApplications, namapujeme ho rovnako
  const fromDashboard = dashboard.value?.recentApplications ?? dashboard.value?.applications ?? []
  const callsList = assignedCalls.value

  return fromDashboard.slice(0, 3).map((app: any) => {
    const matchingCall = callsList.find((c: any) => c.id === app.call_id)
    let maxScore = 40
    if (matchingCall && matchingCall.criteria && matchingCall.criteria.length > 0) {
      maxScore = matchingCall.criteria.length * 20
    }
    return { ...app, max_score: maxScore }
  })
})

const urgentApplications = computed(() => {
  const direct = dashboard.value?.urgentApplications ?? []
  if (direct.length) return direct
  
  return transformedApplications.value.filter(app => 
    ['evaluating', 'submitted', 'under_review'].includes(app.status) && app.my_score === null
  )
})

const stats = computed(() => {
  const s = dashboard.value?.stats ?? {}
  const applications = transformedApplications.value
  
  return {
    total: s.total ?? applications.length,
    pending: s.pending ?? applications.filter(app => app.my_score === null).length,
    evaluated: s.evaluated ?? applications.filter(app => app.my_score !== null).length,
    decided: s.decided ?? 0, 
  }
})

onMounted(async () => {
  await fetchDashboard()
})
</script>