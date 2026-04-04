<!-- pages/mentor/konzultacie/index.vue -->
<template>
  <div class="max-w-4xl mx-auto px-6 py-10">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-navy mb-1">Konzultácie</h1>
        <p class="text-gray-500 text-sm">História všetkých zápisov z mentoringových konzultácií</p>
      </div>
      <NuxtLink
        to="/mentor/konzultacie/nova"
        class="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
      >
        <Plus class="w-4 h-4" /> Nová konzultácia
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-6">
      <!-- Project filter -->
      <select
        v-model="filterProject"
        class="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <option value="">Všetky projekty</option>
        <option v-for="p in projectOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
      </select>
      <!-- Type filter -->
      <select
        v-model="filterType"
        class="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <option value="">Všetky typy</option>
        <option value="online">Online</option>
        <option value="personal">Osobne</option>
        <option value="written">Písomná</option>
      </select>
      <!-- Month filter -->
      <select
        v-model="filterMonth"
        class="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <option value="">Všetky mesiace</option>
        <option value="2026-04">Apríl 2026</option>
        <option value="2026-03">Marec 2026</option>
        <option value="2026-02">Február 2026</option>
      </select>
    </div>

    <!-- Summary bar -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <p class="text-2xl font-bold text-purple-600">{{ filteredConsultations.length }}</p>
        <p class="text-xs text-gray-500 mt-0.5">Konzultácií</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <p class="text-2xl font-bold text-navy">{{ totalTime }}</p>
        <p class="text-xs text-gray-500 mt-0.5">Minút celkom</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <p class="text-2xl font-bold text-navy">{{ totalActionItems }}</p>
        <p class="text-xs text-gray-500 mt-0.5">Úloh zadaných</p>
      </div>
    </div>

    <!-- Consultations list -->
    <div class="space-y-3">
      <div
        v-for="c in filteredConsultations"
        :key="c.id"
        class="bg-white rounded-lg border border-gray-100 p-5 hover:shadow-sm transition-shadow"
      >
        <div class="flex items-start justify-between gap-3 mb-2">
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              <h3 class="font-semibold text-navy text-sm">{{ c.title }}</h3>
              <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="typeClass(c.type)">{{ c.type }}</span>
            </div>
            <p class="text-xs text-gray-400">
              <NuxtLink :to="`/mentor/${c.projectId}`" class="text-purple-600 hover:underline">{{ c.projectName }}</NuxtLink>
              · {{ c.date }} · {{ c.duration }} min
            </p>
          </div>
          <NuxtLink
            :to="`/mentor/projekty/${c.projectId}`"
            class="shrink-0 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <ExternalLink class="w-4 h-4" />
          </NuxtLink>
        </div>
        <p class="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">{{ c.summary }}</p>
        <div v-if="c.actionItems.length" class="flex flex-wrap gap-1.5">
          <span
            v-for="item in c.actionItems"
            :key="item"
            class="inline-flex items-center gap-1 text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded"
          >
            <ArrowRight class="w-3 h-3 text-purple-400" /> {{ item }}
          </span>
        </div>
      </div>

      <div v-if="!filteredConsultations.length" class="text-center py-16 bg-white rounded-lg border border-gray-100">
        <MessageSquare class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">Žiadne záznamy</p>
        <p class="text-sm text-gray-400 mt-1">Skúste zmeniť filtre alebo pridajte novú konzultáciu</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, ExternalLink, ArrowRight, MessageSquare } from 'lucide-vue-next'

definePageMeta({ 
  layout: 'portal', 
  //middleware: 'auth', 
  roles: ['mentor'] 
})

useHead({ title: 'Konzultácie | NTI Mentor' })

const authStore = useAuthStore()

// TODO: remove when backend is available
if (!authStore.user) {
  authStore.user = { 
    id: 10, 
    email: 'mentor@nti.sk', 
    first_name: 'Matej', 
    last_name: 'Novotný', 
    role: 'mentor' 
  }
  authStore.token = 'mock-token'
}

const filterProject = ref('')
const filterType    = ref('')
const filterMonth   = ref('')

const projectOptions = [
  { value: '1', label: 'EcoTrack' },
  { value: '2', label: 'AI chatbot' },
  { value: '3', label: 'StudyBuddy' },
]

// TODO: fetch from API
const allConsultations = [
  { id: 1, projectId: 2, projectName: 'AI chatbot', title: 'Sprint review #2',           type: 'online',   date: '01.04.2026', duration: 45, summary: 'Tím predviedol MVP chatbota. Kvalita odpovedí je dobrá, chýba handling edge-case otázok.', actionItems: ['Otestovať edge cases', 'Pripraviť dokumentáciu pre Salesforce integráciu'] },
  { id: 2, projectId: 1, projectName: 'EcoTrack',   title: 'Review databázovej schémy',  type: 'online',   date: '28.03.2026', duration: 60, summary: 'Diskusia o optimalizácii dotazov pre veľké datasety. Rozhodnutie použiť TimescaleDB.', actionItems: ['Prepísať migrácie na TimescaleDB', 'Benchmarky dotazov'] },
  { id: 3, projectId: 2, projectName: 'AI chatbot', title: 'Review architektúry',        type: 'online',   date: '22.03.2026', duration: 60, summary: 'Diskusia o voľbe LLM providera. Rozhodnutie: OpenAI pre MVP, self-hosted pre produkciu.', actionItems: ['Pridať rate limiting', 'Dokumentovať fallback scenáre'] },
  { id: 4, projectId: 1, projectName: 'EcoTrack',   title: 'Kick-off',                   type: 'personal', date: '16.02.2026', duration: 90, summary: 'Úvodné stretnutie. Definícia cieľov, roadmapa, rozdelenie rolí v tíme.',              actionItems: ['Nastaviť repo a CI/CD', 'Vypracovať tech spec'] },
  { id: 5, projectId: 2, projectName: 'AI chatbot', title: 'Kick-off konzultácia',       type: 'personal', date: '05.03.2026', duration: 90, summary: 'Predstavenie projektu a zadania firmy. Dohodnutý spôsob komunikácie.',                actionItems: ['Vytvoriť repo', 'Pripraviť tech spec do 10.03.'] },
]

const filteredConsultations = computed(() =>
  allConsultations.filter(c => {
    if (filterProject.value && String(c.projectId) !== filterProject.value) return false
    if (filterType.value) {
      const map: Record<string, string> = { online: 'online', personal: 'personal', written: 'written' }
      const typeKey = c.type === 'Online (videohovor)' ? 'online' : c.type === 'Osobne' ? 'personal' : 'written'
      if (typeKey !== map[filterType.value]) return false
    }
    return true
  })
)

const totalTime        = computed(() => filteredConsultations.value.reduce((s, c) => s + c.duration, 0))
const totalActionItems = computed(() => filteredConsultations.value.reduce((s, c) => s + c.actionItems.length, 0))

const typeClass = (type: string) => {
  if (type === 'online' || type === 'Online (videohovor)') return 'bg-blue-50 text-blue-600'
  if (type === 'personal' || type === 'Osobne') return 'bg-purple-50 text-purple-600'
  return 'bg-gray-100 text-gray-500'
}
</script>