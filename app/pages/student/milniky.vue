<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-6 py-10">

      <div class="mb-10">
       
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">
          {{ t('student_dashboard.home.milestone_title') }}
        </h1>
        <p class="mt-2 text-sm text-gray-500">
          Prehľad míľnikov pre vaše aktívne projekty.
        </p>
      </div>

      <div v-if="loading" class="space-y-6">
        <div
          v-for="n in 2"
          :key="n"
          class="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse"
        >
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-3" />
          <div class="h-3 bg-gray-100 rounded w-1/4 mb-6" />
          <div class="space-y-4">
            <div v-for="m in 3" :key="m" class="flex gap-4">
              <div class="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
              <div class="flex-1 space-y-2 pt-1">
                <div class="h-3 bg-gray-200 rounded w-2/5" />
                <div class="h-3 bg-gray-100 rounded w-3/5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-2xl p-6 text-sm text-red-700"
      >
        Nepodarilo sa načítať míľniky. Skúste obnoviť stránku.
      </div>

      <div
        v-else-if="!calls.length"
        class="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center"
      >
        <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
        </div>
        <p class="font-semibold text-gray-700 mb-1">Žiadne aktívne projekty</p>
        <p class="text-sm text-gray-400">Momentálne nemáte žiadne výzvy s míľnikmi.</p>
      </div>

      <div v-else class="space-y-8">
        <div
          v-for="call in calls"
          :key="call.id"
          class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div class="px-6 pt-6 pb-5 border-b border-gray-100 flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1">
               
                  
                  <UiStatusBadge :status = "call.status_of_call?.name"/>
              
              </div>
              <h2 class="text-lg font-semibold text-gray-900 truncate">{{ call.name }}</h2>
              <p v-if="call.description" class="mt-0.5 text-sm text-gray-500 line-clamp-1">
                {{ call.description }}
              </p>
            </div>
            <div class="shrink-0 text-right">
              <p class="text-xs text-gray-400 mb-0.5">Míľniky</p>
              <p class="text-2xl font-bold text-gray-900 leading-none">
                {{ call.milestones?.length ?? 0 }}
              </p>
            </div>
          </div>

          <div class="px-6 py-5">
            <div
              v-if="!call.milestones?.length"
              class="text-sm text-gray-400 italic py-2"
            >
              Táto výzva nemá žiadne míľniky.
            </div>

            <div v-else class="relative">
              <div
                v-if="call.milestones.length > 1"
                class="absolute left-[15px] top-5 bottom-5 w-px bg-gray-200"
              />

              <div class="space-y-5">
                <div
                  v-for="(milestone, index) in call.milestones"
                  :key="milestone.id"
                  class="relative flex gap-4"
                >
                  <div class="relative z-10 shrink-0">
                    <div
                      class="w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white"
                      :class="milestoneNodeClass(milestone)"
                    >
                      <svg
                        v-if="milestone.milestone_status_id === 4 || milestone.milestone_status?.name === 'Schválené'"
                        class="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      
                      <svg
                        v-else-if="milestone.milestone_status_id === 3 || milestone.milestone_status?.name === 'Dokončené'"
                        class="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75l3 3m0 0l6-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>

                      <svg
                        v-else-if="milestone.milestone_status_id === 5 || milestone.milestone_status?.name === 'Zamietnuté'"
                        class="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>

                      <svg
                        v-else-if="milestone.milestone_status_id === 6 || milestone.milestone_status?.name === 'Vrátené na doplnenie'"
                        class="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>

                      <span
                        v-else
                        class="text-xs font-bold text-gray-500"
                        :class="{ 'text-white': milestone.milestone_status_id === 2 || milestone.milestone_status?.name === 'V riešení' }"
                      >
                        {{ index + 1 }}
                      </span>
                    </div>
                  </div>

                  <div
                    class="flex-1 min-w-0 rounded-xl px-4 py-3 border transition-colors"
                    :class="milestoneCardClass(milestone)"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <div class="min-w-0">
                        <p class="font-semibold text-sm text-gray-900 truncate">
                          {{ milestone.name ?? `Míľnik ${index + 1}` }}
                        </p>
                        <p
                          v-if="milestone.description"
                          class="mt-0.5 text-xs text-gray-500 line-clamp-2"
                        >
                          {{ milestone.description }}
                        </p>
                      </div>
                      <span
                        class="shrink-0 inline-flex text-xs font-medium px-2 py-0.5 rounded-md whitespace-nowrap"
                        :class="milestoneStatusBadgeClass(milestone)"
                      >
                        {{ milestoneStatusLabel(milestone) }}
                      </span>
                    </div>

                    <div
                      v-if="milestone.deadline"
                      class="mt-2 flex items-center gap-1.5 text-xs text-gray-400"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                      </svg>
                      Termín: {{ formatDate(milestone.deadline) }}
                      <span
                        v-if="isOverdue(milestone)"
                        class="ml-1 text-red-500 font-medium"
                      >
                        · Po termíne
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="call.milestones?.length"
            class="px-6 pb-5"
          >
            <div class="flex items-center justify-between text-xs text-gray-400 mb-1.5">
              <span>Postup</span>
              <span>
                {{ completedCount(call.milestones) }} / {{ call.milestones.length }} dokončených
              </span>
            </div>
            <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-indigo-500 rounded-full transition-all duration-500"
                :style="{ width: progressPercent(call.milestones) + '%' }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n()

useHead({
  title: t('student_dashboard.home.milestone_title'),
})

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
  roles: ['student'],
})

// ─── Types ───────────────────────────────────────────────────────────────────

interface MilestoneStatusRelation {
  id?: number
  name: string
}

interface Milestone {
  id: number
  name?: string
  description?: string
  deadline?: string
  milestone_status_id: number // Opravené podľa tvojho JSON z backendu
  milestone_status?: MilestoneStatusRelation // Pre prípad, že Laravel vráti aj model vzťahu
}

interface CallStatus {
  name: string
}

interface Call {
  id: number
  name: string
  description?: string
  status_of_call?: CallStatus
  milestones?: Milestone[]
}

const api = useApi()

// ─── State ───────────────────────────────────────────────────────────────────

const calls = ref<Call[]>([])
const loading = ref(true)
const error = ref(false)

// ─── Fetch ───────────────────────────────────────────────────────────────────

async function fetchMilestones() {
  loading.value = true
  error.value = false
  try {
    const data = await api.get('/fetch-student-milestones') 
    console.log("Data received successfully:", data)
    calls.value = data ?? []
  } catch (err) {
    console.error("Chyba pri sťahovaní míľnikov:", err)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(fetchMilestones)

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getStatusKey(milestone: Milestone): string | number {
  if (milestone.milestone_status?.name) {
    return milestone.milestone_status.name.trim()
  }
  return milestone.milestone_status_id ?? 1
}

function isOverdue(milestone: Milestone): boolean {
  if (!milestone.deadline) return false
  const key = getStatusKey(milestone)
  // Ak je Schválené (4) alebo Dokončené (3), nie je po termíne
  if (key === 4 || key === 'Schválené') return false
  if (key === 3 || key === 'Dokončené') return false
  return new Date(milestone.deadline) < new Date()
}

function completedCount(milestones: Milestone[]): number {
  return milestones.filter(m => {
    const key = getStatusKey(m)
    return key === 4 || key === 'Schválené'
  }).length
}

function progressPercent(milestones: Milestone[]): number {
  if (!milestones.length) return 0
  return Math.round((completedCount(milestones) / milestones.length) * 100)
}

// ─── Styling helpers ─────────────────────────────────────────────────────────

function callStatusClass(call: Call): string {
  const name = call.status_of_call?.name
  if (name === 'V realizácii') return 'bg-indigo-50 text-indigo-700'
  if (name === 'Uzavreté')     return 'bg-gray-100 text-gray-600'
  return 'bg-gray-100 text-gray-500'
}

function callStatusDot(call: Call): string {
  const name = call.status_of_call?.name
  if (name === 'V realizácii') return 'bg-indigo-500'
  if (name === 'Uzavreté')     return 'bg-gray-400'
  return 'bg-gray-300'
}

function milestoneNodeClass(milestone: Milestone): string {
  const key = getStatusKey(milestone)
  
  switch (key) {
    case 4:
    case 'Schválené': 
      return 'bg-emerald-500'
    case 3:
    case 'Dokončené': 
      return 'bg-teal-500'
    case 5:
    case 'Zamietnuté': 
      return 'bg-red-500'
    case 6:
    case 'Vrátené na doplnenie': 
      return 'bg-amber-500'
    case 2:
    case 'V riešení': 
      return 'bg-indigo-500'
    case 1:
    case 'Plánované':
    default: 
      return 'bg-gray-200'
  }
}

function milestoneCardClass(milestone: Milestone): string {
  const key = getStatusKey(milestone)
  
  switch (key) {
    case 4:
    case 'Schválené': 
      return 'border-emerald-200 bg-emerald-50/40'
    case 3:
    case 'Dokončené': 
      return 'border-teal-200 bg-teal-50/40'
    case 5:
    case 'Zamietnuté': 
      return 'border-red-200 bg-red-50/30'
    case 6:
    case 'Vrátené na doplnenie': 
      return 'border-amber-200 bg-amber-50/40'
    case 2:
    case 'V riešení': 
      return 'border-indigo-200 bg-indigo-50/30'
    case 1:
    case 'Plánované':
    default: 
      return 'border-gray-200 bg-gray-50/60'
  }
}

function milestoneStatusBadgeClass(milestone: Milestone): string {
  const key = getStatusKey(milestone)
  
  switch (key) {
    case 4:
    case 'Schválené': 
      return 'bg-emerald-100 text-emerald-700'
    case 3:
    case 'Dokončené': 
      return 'bg-teal-100 text-teal-700'
    case 5:
    case 'Zamietnuté': 
      return 'bg-red-100 text-red-700'
    case 6:
    case 'Vrátené na doplnenie': 
      return 'bg-amber-100 text-amber-800'
    case 2:
    case 'V riešení': 
      return 'bg-indigo-100 text-indigo-700'
    case 1:
    case 'Plánované':
    default: 
      return 'bg-gray-100 text-gray-500'
  }
}

function milestoneStatusLabel(milestone: Milestone): string {
  const key = getStatusKey(milestone)
  
  if (typeof key === 'string') return key

  switch (key) {
    case 1: return 'Plánované'
    case 2: return 'V riešení'
    case 3: return 'Dokončené'
    case 4: return 'Schválené'
    case 5: return 'Zamietnuté'
    case 6: return 'Vrátené na doplnenie'
    default: return 'Neznámy'
  }
}
</script>