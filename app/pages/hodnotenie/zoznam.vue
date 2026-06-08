<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-navy mb-1">Všetky hodnotenia</h1>
      <p class="text-gray-500 text-sm">Prihlášky priradené vašej komisii</p>
    </div>

    <div v-if="loading.calls" class="flex items-center gap-2 text-sm text-gray-400 mb-6">
      <Loader2 class="w-4 h-4 animate-spin" />
      Načítavam výzvy...
    </div>

    <div
      v-else-if="!calls.length"
      class="text-center py-20 bg-white rounded-xl border border-gray-100"
    >
      <ClipboardCheck class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 font-medium">Nemáte priradené žiadne výzvy</p>
      <p class="text-sm text-gray-400 mt-1">Kontaktujte administrátora portálu</p>
    </div>

    <template v-else>
      <div class="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button
          v-for="call in calls"
          :key="call.id"
          @click="selectCall(call.id)"
          class="shrink-0 px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
          :class="
            activeCallId === call.id
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
          "
        >
          <span>{{ call.name }}</span>
          <span
            v-if="call.applications_pending > 0"
            class="ml-2 text-xs"
            :class="activeCallId === call.id ? 'opacity-80' : 'text-orange-500 font-semibold'"
          >
            {{ call.applications_pending }} čaká
          </span>
          <span v-else class="ml-2 text-xs opacity-60">hotovo</span>
        </button>
      </div>

      <div v-if="selectedCall" class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
          <p class="text-2xl font-bold text-blue-600">{{ selectedCall.applications_total }}</p>
          <p class="text-xs text-gray-500 mt-0.5">Celkom prihlášok</p>
        </div>
        <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
          <p class="text-2xl font-bold text-green-600">{{ selectedCall.applications_evaluated }}</p>
          <p class="text-xs text-gray-500 mt-0.5">Ohodnotených</p>
        </div>
      </div>

      <div v-if="selectedCallCategories.length" class="flex flex-wrap items-center gap-3 mb-6">
        <label class="text-sm font-medium text-gray-700" for="category-filter">
          {{ t('evaluator.filter_by_category') }}
        </label>
        <select
          id="category-filter"
          v-model="selectedCategoryId"
          class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
        >
          <option :value="null">{{ t('evaluator.all_categories') }}</option>
          <option
            v-for="category in selectedCallCategories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
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
                <h3 class="font-semibold text-navy text-base">
                  {{ app.projectName }}
                </h3>
                <UiStatusBadge :status="app.status" />
                <span
                  v-if="app.category"
                  class="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-700"
                >
                  {{ app.category.name }}
                </span>
                <span
                  v-if="app.program && app.program !== '—'"
                  class="text-xs px-2 py-0.5 rounded-full font-medium"
                  :class="app.program === 'A' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'"
                >
                  Program {{ app.program }}
                </span>
              </div>

              <p class="text-sm text-gray-500 mb-3">
                {{ app.teamName }}
                <span v-if="app.submitted_at"> · Podané {{ app.submitted_at }}</span>
              </p>

              <div v-if="app.my_score !== null" class="flex items-center gap-3">
                <div class="flex items-center gap-1.5">
                  <Star class="w-4 h-4 text-yellow-400" />
                  <span class="text-sm font-semibold text-navy">{{ app.my_score }}/{{ app.max_score }}</span>
                  <span class="text-xs text-gray-400">váš skór</span>
                </div>
                
                <div v-if="app.avgScore !== null" class="flex items-center gap-1.5">
                  <span class="text-xs text-gray-400">·</span>
                  <span class="text-sm text-gray-500">
                    priemer komisie: <strong class="text-navy">{{ app.avgScore }}/{{ app.max_score }}</strong>
                  </span>
                </div>
              </div>

              <div v-else class="flex items-center gap-1.5">
                <span class="inline-block w-2 h-2 rounded-full bg-orange-400"></span>
                <span class="text-xs text-gray-400">Ešte neohodnotené</span>
              </div>
            </div>

            <div class="shrink-0">
              <NuxtLink
                :to="`/hodnotenie/${app.id}`"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="
                  app.my_score !== null
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                "
              >
                <ClipboardCheck class="w-4 h-4" />
                {{ app.my_score !== null ? 'Upraviť' : 'Hodnotiť' }}
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
          <p class="text-sm text-gray-400 mt-1">
            {{
              selectedCategoryId
                ? 'Táto kategória neobsahuje žiadne prihlášky'
                : 'Táto výzva ešte nemá priradené prihlášky na hodnotenie'
            }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Star, ClipboardCheck, Loader2 } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['evaluator'],
})

useHead({ title: 'Hodnotenia | NTI Komisia' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const api = useApi()

// ── Reaktívny Stav ──────────────────────────────────────────────────────────
const rawEvaluations = ref<any[]>([])
const selectedCallId     = ref<number | null>(null)
const selectedCategoryId = ref<number | null>(null)

const loading = ref({
  calls: false
})

// ── 1. Transformácia Výziev pre horné záložky (Tabs) ─────────────────────────
const calls = computed(() => {
  const uniqueCalls = new Map<number, any>()

  rawEvaluations.value.forEach(evalItem => {
    const callData = evalItem.application?.call
    if (!callData) return

    if (!uniqueCalls.has(callData.id)) {
      const pendingCount = rawEvaluations.value.filter(
        e => e.application?.call_id === callData.id && e.submitted_at === null
      ).length

      uniqueCalls.set(callData.id, {
        id: callData.id,
        name: callData.name,
        applications_total: callData.vsetky_moje_na_hodnotenie_count ?? 0,
        applications_evaluated: callData.moje_uz_ohodnotene_count ?? 0,
        applications_pending: pendingCount
      })
    }
  })

  return Array.from(uniqueCalls.values())
})

// ── Aktuálne zvolená výzva (Pre štatistické boxy) ────────────────────────────
const activeCallId = computed(() => selectedCallId.value ?? calls.value[0]?.id ?? null)

const selectedCall = computed(() => {
  if (activeCallId.value == null) return null
  return calls.value.find(c => c.id === activeCallId.value) ?? null
})

const selectedCallApplicationsRaw = computed(() => {
  if (activeCallId.value == null) return []

  return rawEvaluations.value
    .filter(evalItem => evalItem.application?.call_id === activeCallId.value)
    .map(evalItem => {
      const app = evalItem.application
      const hasScores = evalItem.scores && evalItem.scores.length > 0
      
      const totalScore = hasScores
        ? evalItem.scores.reduce((sum: number, s: any) => {
            const numericScore = Number(s.score || s.value || 0)
            return sum + (Number.isNaN(numericScore) ? 0 : numericScore)
          }, 0)
        : null

      const maxPointsPerCriterion = 20 
      const maxScore = hasScores ? evalItem.scores.length * maxPointsPerCriterion : 40 

      let programLabel = '—'
      const programId = app?.call?.program_id ?? app?.program_id
      if (programId === 1) programLabel = 'A'
      if (programId === 2) programLabel = 'B'

      return {
        id: app.id,
        projectName: call_project_name_fallback(app, evalItem),
        status: translate_status(app.active_status),
        category: app.category ?? null,
        program: programLabel, 
        teamName: app.team?.name ?? '—',
        submitted_at: app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('sk-SK') : null,
        deadline: app?.call?.application_deadline 
          ? new Date(app.call.application_deadline).toLocaleDateString('sk-SK') 
          : null,
        my_score: totalScore,
        max_score: maxScore, 
        avgScore: null
      }
    })
})

const call_project_name_fallback = (app: any, evalItem: any) => {
  if (app?.form_data?.project_name) return app.form_data.project_name
  return `${app?.reference ?? 'Prihláška'} #${app?.id ?? evalItem.id}`
}

const translate_status = (statusId: number) => {
  const statuses: Record<number, string> = { 1: 'draft', 2: 'submitted', 3: 'under_review', 4: 'accepted' }
  return statuses[statusId] || 'pending'
}

// ── Kategórie pre filter ─────────────────────────────────────────────────────
const selectedCallCategories = computed(() => {
  const unique = new Map<number, { id: number; name: string }>()
  for (const app of selectedCallApplicationsRaw.value) {
    if (app.category?.id != null && app.category?.name) {
      unique.set(app.category.id, { id: app.category.id, name: app.category.name })
    }
  }
  return Array.from(unique.values())
})

const selectedCallApplications = computed(() => {
  if (selectedCategoryId.value == null) {
    return selectedCallApplicationsRaw.value
  }
  return selectedCallApplicationsRaw.value.filter(
    app => app.category?.id === selectedCategoryId.value
  )
})

// ── Akcie & API Volania ──────────────────────────────────────────────────────
const loadEvaluationsData = async () => {
  loading.value.calls = true
  try {
    const response = await api.get('/evaluator/fetch-for-evaluator')
    rawEvaluations.value = response?.evaluations || response || []
  } catch (error) {
    console.error('Chyba pri načítaní dát hodnotiteľa:', error)
  } finally {
    loading.value.calls = false
  }
}

const selectCall = async (callId: number) => {
  if (selectedCallId.value === callId) return

  selectedCallId.value     = callId
  selectedCategoryId.value = null 

  router.replace({ query: { ...route.query, call: callId } })
}

const initPage = async () => {
  await loadEvaluationsData()

  const queryCall = Number(route.query.call)
  const initialCall =
    Number.isFinite(queryCall) && queryCall > 0
      ? queryCall
      : calls.value[0]?.id ?? null

  if (initialCall != null) {
    selectedCallId.value = initialCall
  }
}

onMounted(initPage)

watch(
  () => route.query.call,
  (callId) => {
    const parsed = Number(callId)
    if (Number.isFinite(parsed) && parsed > 0 && parsed !== selectedCallId.value) {
      selectedCallId.value = parsed
    }
  },
)
</script>