<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-navy">Moje prihlášky</h1>
      <NuxtLink :to="localePath('/student/prihlasky/nova')">
        <UiButton>
          <Plus class="w-4 h-4" />
          Nová prihláška
        </UiButton>
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <UiInput
        v-model="searchQuery"
        placeholder="Hľadať podľa názvu..."
        type="text"
      />
      <UiSelect
        v-model="statusFilter"
        :options="statusOptions"
        placeholder="Stav"
      />
      <UiSelect
        v-model="programFilter"
        :options="programOptions"
        placeholder="Program"
      />
    </div>

    <!-- Application cards -->
    <div
      v-if="filteredApplications.length"
      class="grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      <div
        v-for="app in filteredApplications"
        :key="app.id"
        class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-semibold text-navy text-base leading-tight">{{ app.title }}</h3>
          <UiStatusBadge :status="app.status" />
        </div>
        <p class="text-sm text-gray-500 mb-2">
          {{ app.team }} · {{ app.program }}
          <span v-if="app.submittedAt"> · {{ app.submittedAt }}</span>
        </p>
        <p class="text-sm text-gray-600 mb-4 truncate">{{ app.description }}</p>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4 text-sm text-gray-400">
            <span class="flex items-center gap-1">
              <Users class="w-4 h-4" />
              {{ app.members }}
            </span>
            <span class="flex items-center gap-1">
              <Paperclip class="w-4 h-4" />
              {{ app.documents }}
            </span>
          </div>
          <NuxtLink
            :to="`/prihlasky/${app.id}`"
            class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Zobraziť detail
            <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="bg-white rounded-lg shadow-sm border border-gray-100"
    >
      <UiEmptyState
        :icon="FileText"
        title="Žiadne prihlášky"
        description="Skúste zmeniť filtre alebo vytvorte novú prihlášku"
      >
        <NuxtLink :to="localePath('/student/prihlasky/nova')">
          <UiButton size="sm">Nová prihláška</UiButton>
        </NuxtLink>
      </UiEmptyState>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Users, Paperclip, ChevronRight, FileText } from 'lucide-vue-next'

const localePath = useLocalePath()

definePageMeta({
  layout: 'portal',
})

useHead({ title: 'Moje prihlášky | NTI' })

const authStore = useAuthStore()

if (!authStore.user) {
  authStore.user = {
    id: 1,
    email: 'jan.novak@example.com',
    first_name: 'Ján',
    last_name: 'Novák',
    role: 'student',
  }
  authStore.token = 'mock-token'
}

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const programFilter = ref('')

const statusOptions = [
  { value: '', label: 'Všetky stavy' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Podané' },
  { value: 'evaluating', label: 'V hodnotení' },
  { value: 'approved', label: 'Schválené' },
  { value: 'rejected', label: 'Zamietnuté' },
]

const programOptions = [
  { value: '', label: 'Všetky programy' },
  { value: 'Program A', label: 'Program A' },
  { value: 'Program B', label: 'Program B' },
]

// Mock data
const mockApplications = [
  {
    id: 1,
    title: 'EcoTrack - Sledovanie uhlíkovej stopy',
    program: 'Program A',
    team: 'GreenTech tím',
    status: 'approved',
    submittedAt: '2026-02-15',
    members: 4,
    documents: 6,
    description: 'Aplikácia na sledovanie a znižovanie uhlíkovej stopy pre študentov a malé firmy.',
  },
  {
    id: 2,
    title: 'StudyBuddy - AI asistent pre študentov',
    program: 'Program A',
    team: 'AI Innovators',
    status: 'evaluating',
    submittedAt: '2026-03-10',
    members: 3,
    documents: 4,
    description: 'Inteligentný asistent využívajúci AI na personalizované učenie a prípravu na skúšky.',
  },
  {
    id: 3,
    title: 'FitConnect - Fitness platforma',
    program: 'Program B',
    team: 'HealthTech',
    status: 'submitted',
    submittedAt: '2026-03-25',
    members: 5,
    documents: 3,
    description: 'Komunitná fitness platforma prepájajúca trénerov so študentmi univerzity.',
  },
  {
    id: 4,
    title: 'LocalMarket - Farmársky marketplace',
    program: 'Program A',
    team: 'AgriDigital',
    status: 'draft',
    submittedAt: null,
    members: 3,
    documents: 1,
    description: 'Online trhovisko pre lokálnych farmárov s možnosťou predplatného a doručenia.',
  },
  {
    id: 5,
    title: 'SmartPark - Inteligentné parkovanie',
    program: 'Program B',
    team: 'UrbanTech',
    status: 'rejected',
    submittedAt: '2026-01-20',
    members: 4,
    documents: 5,
    description: 'Systém inteligentného parkovania s IoT senzormi a mobilnou aplikáciou.',
  },
]

const filteredApplications = computed(() => {
  return mockApplications.filter((app) => {
    const matchesSearch = !searchQuery.value || app.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !statusFilter.value || app.status === statusFilter.value
    const matchesProgram = !programFilter.value || app.program === programFilter.value
    return matchesSearch && matchesStatus && matchesProgram
  })
})
</script>
