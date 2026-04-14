<!-- pages/firma/zadania/[id].vue -->
<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <!-- Back -->
    <NuxtLink
      to="/firma/zadania"
      class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors mb-6"
    >
      <ChevronLeft class="w-4 h-4" />
      Späť na zadania
    </NuxtLink>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <h1 class="text-2xl font-bold text-navy">{{ task.title }}</h1>
          <UiStatusBadge :status="task.status" />
        </div>
        <p class="text-gray-500 text-sm">{{ task.program }} · Vytvorené {{ task.createdAt }}</p>
      </div>
      <div class="flex gap-2 shrink-0">
        <NuxtLink
          :to="`/firma/zadania/${task.id}/edit`"
          class="inline-flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <Pencil class="w-4 h-4" />
          Upraviť
        </NuxtLink>
        <button
          v-if="task.status === 'draft'"
          class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Send class="w-4 h-4" />
          Zverejniť
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left column: main info -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Description -->
        <div class="bg-white rounded-lg border border-gray-100 p-6">
          <h2 class="text-base font-semibold text-navy mb-3">Popis zadania</h2>
          <p class="text-sm text-gray-600 leading-relaxed">{{ task.description }}</p>
        </div>

        <!-- Requirements -->
        <div class="bg-white rounded-lg border border-gray-100 p-6">
          <h2 class="text-base font-semibold text-navy mb-3">Požiadavky na tím</h2>
          <ul class="space-y-2">
            <li
              v-for="req in task.requirements"
              :key="req"
              class="flex items-start gap-2 text-sm text-gray-600"
            >
              <CheckCircle class="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              {{ req }}
            </li>
          </ul>
        </div>

        <!-- Applications -->
        <div class="bg-white rounded-lg border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-navy">Prihlášky tímov</h2>
            <span class="text-sm text-gray-400">{{ task.applications.length }} celkom</span>
          </div>

          <div class="space-y-3">
            <div
              v-for="app in task.applications"
              :key="app.id"
              class="border border-gray-100 rounded-lg p-4"
            >
              <div class="flex items-start justify-between mb-2">
                <div>
                  <p class="font-medium text-navy text-sm">{{ app.teamName }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">Podané {{ app.submittedAt }} · {{ app.members }} členov</p>
                </div>
                <UiStatusBadge :status="app.status" />
              </div>
              <p class="text-xs text-gray-500 mb-3 line-clamp-2">{{ app.summary }}</p>
              <div class="flex gap-2">
                <NuxtLink
                  :to="`/firma/prihlasky/${app.id}`"
                  class="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                >
                  Zobraziť prihlášku
                  <ChevronRight class="w-3.5 h-3.5" />
                </NuxtLink>
              </div>
            </div>

            <p
              v-if="!task.applications.length"
              class="text-sm text-gray-400 text-center py-6"
            >
              Žiadne prihlášky zatiaľ
            </p>
          </div>
        </div>
      </div>

      <!-- Right column: stats & budget -->
      <div class="space-y-4">
        <!-- Budget card -->
        <div class="bg-white rounded-lg border border-gray-100 p-5">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Rozpočet</h3>
          <div class="text-3xl font-bold text-navy mb-1">{{ formatCurrency(task.budget) }}</div>
          <p class="text-xs text-gray-400 mb-4">celkový rozpočet</p>

          <div class="bg-gray-100 rounded-full h-2 mb-2">
            <div
              class="h-2 rounded-full transition-all"
              :class="budgetBarColor(task.spent / task.budget)"
              :style="{ width: `${Math.min((task.spent / task.budget) * 100, 100)}%` }"
            />
          </div>
          <div class="flex justify-between text-xs text-gray-500">
            <span>Čerpanie: {{ formatCurrency(task.spent) }}</span>
            <span>{{ Math.round((task.spent / task.budget) * 100) }}%</span>
          </div>
          <div class="mt-3 pt-3 border-t border-gray-100">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Zostatok</span>
              <span class="font-semibold text-navy">{{ formatCurrency(task.budget - task.spent) }}</span>
            </div>
          </div>
        </div>

        <!-- Info card -->
        <div class="bg-white rounded-lg border border-gray-100 p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Informácie</h3>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Program</span>
            <span class="font-medium text-navy">{{ task.program }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Deadline</span>
            <span class="font-medium text-navy">{{ task.deadline || '—' }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Priradený tím</span>
            <span class="font-medium text-navy">{{ task.assignedTeam || 'Žiadny' }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Prihlášok</span>
            <span class="font-medium text-navy">{{ task.applications.length }}</span>
          </div>
        </div>

        <!-- Assigned team card -->
        <div
          v-if="task.assignedTeam"
          class="bg-blue-50 border border-blue-100 rounded-lg p-5"
        >
          <h3 class="text-sm font-semibold text-blue-800 mb-2">Priradený tím</h3>
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
              <Users class="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p class="font-medium text-blue-900 text-sm">{{ task.assignedTeam }}</p>
              <p class="text-xs text-blue-600">{{ task.assignedTeamMembers }} členov</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight, Pencil, Send, CheckCircle, Users } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  //middleware: 'auth',
  roles: ['company'],
})

const route = useRoute()

useHead({
  title: 'Detail zadania | NTI Firma',
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

// TODO: fetch from API using route.params.id
const task = {
  id: Number(route.params.id),
  title: 'AI chatbot pre zákaznícku podporu',
  program: 'Program A',
  status: 'active',
  createdAt: '10.01.2026',
  deadline: '30.06.2026',
  budget: 8000,
  spent: 3200,
  assignedTeam: 'AI Innovators',
  assignedTeamMembers: 3,
  description:
    'Vyvíjate inteligentného chatbota schopného riešiť bežné otázky zákazníkov, integrovať sa s CRM systémom a eskalovať komplexné prípady na živého operátora. Riešenie musí byť škálovateľné a podporovať slovenský jazyk.',
  requirements: [
    'Skúsenosti s NLP alebo ML frameworkmi (Hugging Face, OpenAI API)',
    'Znalosť REST API integrácie',
    'Minimálne 3 členovia tímu',
    'Prezentácia prototypu po 6 týždňoch',
  ],
  applications: [
    {
      id: 11,
      teamName: 'AI Innovators',
      submittedAt: '12.03.2026',
      members: 3,
      status: 'approved',
      summary:
        'Tím s 2-ročnými skúsenosťami v oblasti NLP. Plánujú použiť OpenAI API s custom fine-tuningom na firemné dáta.',
    },
    {
      id: 12,
      teamName: 'ByteCraft',
      submittedAt: '15.03.2026',
      members: 4,
      status: 'submitted',
      summary:
        'Navrhujú hybridné riešenie kombinujúce rule-based systém s ML modelom pre lepšiu predvídateľnosť odpovedí.',
    },
    {
      id: 13,
      teamName: 'NeuralNest',
      submittedAt: '18.03.2026',
      members: 3,
      status: 'rejected',
      summary: 'Open-source riešenie postavené na Rasa frameworku s integráciou do Salesforce CRM.',
    },
  ],
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)

const budgetBarColor = (ratio: number) => {
  if (ratio >= 1) return 'bg-danger-500'
  if (ratio >= 0.8) return 'bg-warning-500'
  return 'bg-blue-500'
}
</script>
