<!-- pages/firma/zadania/index.vue -->
<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-navy mb-1">Zadania</h1>
        <p class="text-gray-500">Správa zadaní pre tímy NTI programov</p>
      </div>
      <NuxtLink
        to="/firma/zadania/nove"
        class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
      >
        <Plus class="w-4 h-4" />
        Nové zadanie
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="f in filters"
        :key="f.value"
        @click="activeFilter = f.value"
        class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
        :class="
          activeFilter === f.value
            ? 'bg-blue-600 text-white'
            : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
        "
      >
        {{ f.label }}
        <span class="ml-1 opacity-60">{{ f.count }}</span>
      </button>
    </div>

    <!-- Tasks list -->
    <div class="space-y-4">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold text-navy text-base">{{ task.title }}</h3>
              <UiStatusBadge :status="task.status" />
            </div>
            <p class="text-sm text-gray-500">{{ task.program }} · Pridané {{ task.createdAt }}</p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-lg font-bold text-navy">{{ formatCurrency(task.budget) }}</p>
            <p class="text-xs text-gray-400">rozpočet</p>
          </div>
        </div>

        <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ task.description }}</p>

        <!-- Budget bar -->
        <div class="mb-4">
          <div class="flex justify-between text-xs text-gray-500 mb-1">
            <span>Čerpanie rozpočtu</span>
            <span>{{ formatCurrency(task.spent) }} / {{ formatCurrency(task.budget) }}</span>
          </div>
          <div class="bg-gray-100 rounded-full h-1.5">
            <div
              class="h-1.5 rounded-full transition-all"
              :class="budgetBarColor(task.spent / task.budget)"
              :style="{ width: `${Math.min((task.spent / task.budget) * 100, 100)}%` }"
            />
          </div>
        </div>

        <!-- Meta row -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4 text-sm text-gray-400">
            <span class="flex items-center gap-1">
              <Users class="w-4 h-4" />
              {{ task.teamsCount }} {{ task.teamsCount === 1 ? 'tím' : 'tímy' }}
            </span>
            <span class="flex items-center gap-1">
              <FileText class="w-4 h-4" />
              {{ task.applicationsCount }} prihlášok
            </span>
            <span
              v-if="task.deadline"
              class="flex items-center gap-1"
            >
              <Calendar class="w-4 h-4" />
              {{ task.deadline }}
            </span>
          </div>
          <NuxtLink
            :to="`/firma/zadania/${task.id}`"
            class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Detail
            <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="!filteredTasks.length"
        class="text-center py-16 bg-white rounded-lg border border-gray-100"
      >
        <ClipboardList class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">Žiadne zadania</p>
        <p class="text-sm text-gray-400 mt-1">Vytvorte prvé zadanie pre tímy</p>
        <NuxtLink
          to="/firma/zadania/nove"
          class="inline-flex items-center gap-2 mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus class="w-4 h-4" />
          Nové zadanie
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Users, FileText, Calendar, ChevronRight, Plus, ClipboardList } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['partner'],
})

useHead({
  title: 'Zadania | NTI Firma',
})

const authStore = useAuthStore()

// TODO: remove when backend is available
if (!authStore.user) {
  authStore.user = {
    id: 2,
    email: 'info@techfirma.sk',
    organization_name: 'TechFirma s.r.o.',
    role: 'company',
  }
  authStore.token = 'mock-token'
}

const activeFilter = ref('all')

const mockTasks = [
  {
    id: 1,
    title: 'AI chatbot pre zákaznícku podporu',
    program: 'Program A',
    description:
      'Vyvíjate inteligentného chatbota schopného riešiť bežné otázky zákazníkov, integrovať sa s CRM systémom a eskalovať komplexné prípady na živého operátora.',
    budget: 8000,
    spent: 3200,
    status: 'active',
    createdAt: '10.01.2026',
    deadline: '30.06.2026',
    teamsCount: 1,
    applicationsCount: 3,
  },
  {
    id: 2,
    title: 'Optimalizácia logistického softvéru',
    program: 'Program B',
    description:
      'Analýza a zefektívnenie existujúceho softvéru pre správu skladových zásob a plánovanie prepravy s cieľom znížiť prevádzkové náklady o 20 %.',
    budget: 12000,
    spent: 9800,
    status: 'active',
    createdAt: '15.01.2026',
    deadline: '31.05.2026',
    teamsCount: 1,
    applicationsCount: 2,
  },
  {
    id: 3,
    title: 'Mobilná aplikácia pre HR',
    program: 'Program A',
    description:
      'Mobilná aplikácia umožňujúca zamestnancom spravovať dovolenky, dochádzku a benefity priamo zo smartfónu.',
    budget: 6000,
    spent: 6000,
    status: 'completed',
    createdAt: '05.11.2025',
    deadline: '28.02.2026',
    teamsCount: 1,
    applicationsCount: 5,
  },
  {
    id: 4,
    title: 'Dashboard pre analýzu predajov',
    program: 'Program B',
    description:
      'Interaktívny dashboard zobrazujúci kľúčové predajné metriky v reálnom čase s možnosťou filtrovania podľa regiónu, produktu a obchodného zástupcu.',
    budget: 5000,
    spent: 0,
    status: 'draft',
    createdAt: '28.03.2026',
    deadline: null,
    teamsCount: 0,
    applicationsCount: 2,
  },
]

const filters = computed(() => [
  { label: 'Všetky', value: 'all', count: mockTasks.length },
  { label: 'Aktívne', value: 'active', count: mockTasks.filter((t) => t.status === 'active').length },
  { label: 'Dokončené', value: 'completed', count: mockTasks.filter((t) => t.status === 'completed').length },
  { label: 'Drafty', value: 'draft', count: mockTasks.filter((t) => t.status === 'draft').length },
])

const filteredTasks = computed(() =>
  activeFilter.value === 'all' ? mockTasks : mockTasks.filter((t) => t.status === activeFilter.value),
)

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)

const budgetBarColor = (ratio: number) => {
  if (ratio >= 1) return 'bg-danger-500'
  if (ratio >= 0.8) return 'bg-warning-500'
  return 'bg-blue-500'
}
</script>
