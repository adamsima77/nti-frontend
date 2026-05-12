<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-navy">Moje prihlášky</h1>
      <NuxtLink :to="localePath('/student/prihlasky/nova')">
        <UiButton>
          <Plus class="w-4 h-4" />
          Nová prihláška
        </UiButton>
      </NuxtLink>
    </div>

    <div
      v-if="pending"
      class="grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      <div
        v-for="i in 4"
        :key="i"
        class="bg-white rounded-lg border border-gray-100 h-48 animate-pulse"
      />
    </div>

    <template v-else>
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
          <p
            v-if="app.description"
            class="text-sm text-gray-600 mb-4 truncate"
          >
            {{ app.description }}
          </p>
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
              :to="localePath(`/student/prihlasky/${app.id}`)"
              class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Zobraziť detail
              <ChevronRight class="w-4 h-4" />
            </NuxtLink>
          </div>
        </div>
      </div>

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
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Users, Paperclip, ChevronRight, FileText } from 'lucide-vue-next'
import type { Application } from '../../../composables/modules/student/types'
import { useApplications } from '~/composables/modules/student/useApplications'

const localePath = useLocalePath()

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
})

useHead({ title: 'Moje prihlášky | NTI' })

const { applications, pending } = useApplications()

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

const programOptions = computed(() => {
  const programs = new Set<string>()
  for (const a of applications.value) {
    if (a.program) programs.add(a.program)
  }
  return [{ value: '', label: 'Všetky programy' }, ...[...programs].sort().map((p) => ({ value: p, label: p }))]
})

const filteredApplications = computed(() => {
  return applications.value.filter((app: Application) => {
    const matchesSearch =
      !searchQuery.value || app.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !statusFilter.value || app.status === statusFilter.value
    const matchesProgram = !programFilter.value || app.program === programFilter.value
    return matchesSearch && matchesStatus && matchesProgram
  })
})
</script>
