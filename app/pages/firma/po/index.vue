<template>
  <div class="max-w-5xl mx-auto px-6 py-10">

    <div v-if="isLoading" class="flex justify-center py-20">
      <UiLoader />
    </div>

    <div v-else-if="!call" class="text-center py-20 text-gray-400">
      <Briefcase class="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p class="font-medium text-gray-500">Nemáte priradené žiadne zadanie</p>
      <p class="text-sm mt-1">Kontaktujte NTI administrátora</p>
    </div>

    <template v-else>
      <!-- Vitajte -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-navy mb-1">Vitajte, {{ userDisplayName }}!</h1>
        <p class="text-gray-500 text-sm">Prehľad vášho zadania a míľnikov</p>
      </div>

      <!-- Header -->
      <div class="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-medium text-gray-300 uppercase tracking-widest mb-2">Zadanie</p>
            <h1 class="text-2xl font-bold text-navy leading-snug mb-1">{{ call.name }}</h1>
            <p class="text-sm text-gray-400">{{ call.organization }} · {{ call.program }}</p>
          </div>
          <UiStatusBadge :status="call.status ?? ''" class="shrink-0 mt-1" />
        </div>
        <p v-if="call.description" class="mt-4 pt-4 border-t border-gray-50 text-sm text-gray-500 leading-relaxed line-clamp-3">
          {{ call.description }}
        </p>
      </div>

      <!-- Štatistiky -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow-sm border-l-4 border-green-600 p-5">
          <div class="text-3xl font-bold text-green-600">{{ stats.open_milestones }}</div>
          <p class="text-sm text-gray-500 mt-1">Otvorené míľniky</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm border-l-4 border-purple-500 p-5">
          <div class="text-3xl font-bold text-purple-600">{{ stats.done_milestones }}</div>
          <p class="text-sm text-gray-500 mt-1">Dokončené míľniky</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm border-l-4 border-amber-500 p-5">
          <div class="text-3xl font-bold text-amber-600">{{ stats.pending_approvals }}</div>
          <p class="text-sm text-gray-500 mt-1">Čakajú na schválenie</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm border-l-4 border-blue-400 p-5">
          <div class="text-3xl font-bold text-blue-500">{{ stats.documents_count }}</div>
          <p class="text-sm text-gray-500 mt-1">Dokumenty</p>
        </div>
      </div>

      <!-- Vyžadovaná akcia: čakajúce schválenia míľnikov -->
      <NuxtLink
        v-if="stats.pending_approvals > 0"
        :to="localePath('/firma/po/milniky') + '?tab=approvals'"
        class="mt-8 flex items-start gap-4 bg-amber-50 border border-amber-300 rounded-xl p-5 hover:bg-amber-100 transition-colors group"
      >
        <div class="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertTriangle class="w-5 h-5 text-amber-600" />
        </div>
        <div class="flex-1">
          <p class="font-semibold text-amber-900 group-hover:underline">Vyžadovaná akcia</p>
          <p class="text-sm text-amber-700 mt-0.5">
            {{ stats.pending_approvals }} {{ stats.pending_approvals === 1 ? 'míľnik čaká' : 'míľniky čakajú' }} na vaše schválenie.
            Kliknite pre prechod na schvaľovanie.
          </p>
        </div>
        <ChevronRight class="w-5 h-5 text-amber-500 self-center flex-shrink-0" />
      </NuxtLink>

      <!-- Priradený tím -->
      <div v-if="team" class="mt-6 bg-green-50 border border-green-100 rounded-lg p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <Users class="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p class="text-xs font-semibold text-green-700 uppercase tracking-wide mb-0.5">Priradený tím</p>
          <p class="text-sm font-semibold text-green-900">{{ team.name }}</p>
          <p class="text-xs text-green-600 mt-0.5">{{ team.members?.join(', ') }}</p>
        </div>
      </div>
      <div v-else class="mt-6 bg-gray-50 border border-dashed border-gray-200 rounded-lg p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <Users class="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Priradený tím</p>
          <p class="text-sm text-gray-400">Zatiaľ nebol priradený žiadny tím</p>
        </div>
      </div>

      <!-- Blížiace sa termíny -->
      <div v-if="upcomingDeadlines.length" class="mt-8">
        <h2 class="text-lg font-bold text-navy mb-4">Blížiace sa termíny</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="d in upcomingDeadlines"
            :key="d.label"
            class="bg-white rounded-lg border border-gray-100 shadow-sm p-5 flex items-center gap-4"
          >
            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Calendar class="w-6 h-6 text-blue-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-navy truncate">{{ d.label }}</p>
              <p class="text-sm text-gray-500">{{ d.date }}</p>
            </div>
            <div class="text-right flex-shrink-0">
              <span class="text-2xl font-bold text-blue-600">{{ d.daysLeft }}</span>
              <p class="text-xs text-gray-500">dní zostáva</p>
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Briefcase, Users, Calendar, AlertTriangle, ChevronRight } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['partner'],
})

useHead({ title: 'Product Owner Dashboard | NTI' })

const api = useApi()
const localePath = useLocalePath()
const authStore = useAuthStore()

const userDisplayName = computed(() => {
  const u = authStore.user
  if (!u) return ''
  return [u.name, u.surname].filter(Boolean).join(' ') || u.email || ''
})

const call = ref<any>(null)
const team = ref<any>(null)
const stats = ref({ open_milestones: 0, done_milestones: 0, pending_approvals: 0, documents_count: 0 })
const isLoading = ref(true)

async function loadDashboard() {
  isLoading.value = true
  try {
    const res = await api.get('/po/dashboard') as any
    call.value = res.call ?? null
    team.value = res.team ?? null
    stats.value = res.stats ?? stats.value
  } catch {
    call.value = null
  } finally {
    isLoading.value = false
  }
}

const upcomingDeadlines = computed(() => {
  if (!call.value) return []
  const today = new Date().toISOString().slice(0, 10)
  const entries = [
    { label: 'Uzávierka prihlášok', date: call.value.application_deadline },
    { label: 'Začiatok projektu',   date: call.value.project_start },
    { label: 'Koniec projektu',     date: call.value.project_end },
  ]
  return entries
    .filter(e => e.date && e.date >= today)
    .sort((a, b) => (a.date! > b.date! ? 1 : -1))
    .map(e => {
      const diff = Math.ceil((new Date(e.date!).getTime() - new Date(today).getTime()) / 86_400_000)
      return { label: e.label, date: e.date, daysLeft: diff }
    })
})

onMounted(loadDashboard)
</script>
