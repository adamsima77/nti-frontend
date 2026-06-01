<!-- pages/hodnotenie/zoznam.vue -->
<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-navy mb-1">Všetky hodnotenia</h1>
      <p class="text-gray-500 text-sm">Prihlášky priradené vašej komisii</p>
    </div>

    <div
      v-if="calls.length"
      class="flex gap-2 mb-6 overflow-x-auto pb-1"
    >
      <button
        v-for="call in calls"
        :key="call.id"
        @click="selectCall(call.id)"
        class="shrink-0 px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
        :class="selectedCallId === call.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'"
      >
        <span>{{ call.name }}</span>
        <span class="ml-2 text-xs opacity-70">{{ call.applications_pending }} čaká</span>
      </button>
    </div>

    <div
      v-if="selectedCall"
      class="grid grid-cols-3 gap-4 mb-6"
    >
      <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">{{ selectedCall.applications_total }}</p>
        <p class="text-xs text-gray-500 mt-0.5">Prihlášok</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <p class="text-2xl font-bold text-navy">{{ selectedCall.applications_evaluated }}</p>
        <p class="text-xs text-gray-500 mt-0.5">Ohodnotených</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <p class="text-2xl font-bold text-navy">{{ avgMyScore !== null ? avgMyScore : '—' }}</p>
        <p class="text-xs text-gray-500 mt-0.5">Váš priemerný skór</p>
      </div>
    </div>

    <div
      v-if="loading.applications[selectedCallId ?? 0]"
      class="bg-white rounded-lg border border-gray-100 p-6 text-sm text-gray-500"
    >
      Načítavam prihlášky...
    </div>

    <div class="space-y-3">
      <div
        v-for="app in selectedCallApplications"
        :key="app.id"
        class="bg-white rounded-lg border border-gray-100 p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <h3 class="font-semibold text-navy text-base">{{ app.projectName ?? `Prihláška #${app.id}` }}</h3>
              <UiStatusBadge :status="app.status" />
              <span
                v-if="app.program"
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="app.program === 'A' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'"
              >
                Program {{ app.program }}
              </span>
            </div>
            <p class="text-sm text-gray-500 mb-3">
              {{ app.teamName ?? app.team.name }} · Podané {{ app.submitted_at }}
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
                <span class="text-sm font-semibold text-navy">{{ app.my_score }}/100</span>
                <span class="text-xs text-gray-400">váš skór</span>
              </div>
              <div v-if="app.avgScore !== null" class="flex items-center gap-1.5">
                <span class="text-xs text-gray-400">·</span>
                <span class="text-sm text-gray-500">priemer komisie: <strong class="text-navy">{{ app.avgScore }}/100</strong></span>
              </div>
            </div>
          </div>
          <div class="shrink-0">
            <NuxtLink
              :to="`/hodnotenie/${app.id}`"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
            >
              <ClipboardCheck class="w-4 h-4" />
              Hodnotiť
            </NuxtLink>
          </div>
        </div>
      </div>

      <div
        v-if="!selectedCallApplications.length"
        class="text-center py-16 bg-white rounded-lg border border-gray-100"
      >
        <ClipboardCheck class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">Žiadne prihlášky</p>
        <p class="text-sm text-gray-400 mt-1">Táto výzva ešte nemá priradené prihlášky</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Star, ClipboardCheck } from 'lucide-vue-next'
import { useEvaluatorDashboard } from '~/composables/useEvaluatorDashboard'

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['evaluator'],
})

useHead({ title: 'Hodnotenia | NTI Komisia' })

const route = useRoute()
const { calls, applicationsByCallId, loading, fetchDashboard, fetchCalls, fetchApplications } = useEvaluatorDashboard()

const selectedCallId = ref<number | null>(null)

const activeCallId = computed(() => selectedCallId.value ?? calls.value[0]?.id ?? null)

const selectedCall = computed(() => {
  if (activeCallId.value == null) return null
  return calls.value.find(call => call.id === activeCallId.value) ?? calls.value[0] ?? null
})

const selectedCallApplications = computed(() => {
  if (activeCallId.value == null) return []
  return applicationsByCallId.value[activeCallId.value] ?? []
})

const avgMyScore = computed(() => {
  const scored = selectedCallApplications.value.filter(app => app.my_score !== null)
  if (!scored.length) return null
  return Math.round(scored.reduce((sum, app) => sum + (app.my_score ?? 0), 0) / scored.length)
})

const selectCall = async (callId: number) => {
  selectedCallId.value = callId
  if (!applicationsByCallId.value[callId]) {
    await fetchApplications(callId)
  }
}

const initPage = async () => {
  await Promise.all([fetchDashboard(), fetchCalls()])

  const queryCall = Number(route.query.call)
  const initialCall = Number.isFinite(queryCall) && queryCall > 0
    ? queryCall
    : calls.value[0]?.id ?? null

  if (initialCall != null) {
    await selectCall(initialCall)
  }
}

onMounted(initPage)

watch(
  () => route.query.call,
  async (callId) => {
    const parsed = Number(callId)
    if (Number.isFinite(parsed) && parsed > 0) {
      await selectCall(parsed)
    }
  },
)

</script>
