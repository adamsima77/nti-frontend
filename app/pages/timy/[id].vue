<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <!-- Not found -->
    <div
      v-if="!team"
      class="bg-white rounded-lg shadow-sm border border-gray-100"
    >
      <UiEmptyState
        :icon="Users"
        title="Tím nenájdený"
      >
        <NuxtLink
          to="/timy"
          class="text-sm font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
        >
          <ArrowLeft class="w-4 h-4" />
          Späť na tímy
        </NuxtLink>
      </UiEmptyState>
    </div>

    <template v-else>
      <!-- Breadcrumbs -->
      <div class="mb-8">
        <UiBreadcrumbs :items="[{ label: 'Tímy', to: '/timy' }, { label: team.name }]" />
      </div>

      <!-- Header -->
      <div class="flex items-start justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-navy mb-1">{{ team.name }}</h1>
          <p class="text-sm text-gray-500">
            Vytvorený {{ team.createdAt }} · {{ team.members.length }} členov · {{ team.applications.length }} prihlášok
          </p>
        </div>
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
          {{ team.myRole }}
        </span>
      </div>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Members -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 class="text-xl font-bold text-navy mb-6">Členovia tímu</h2>
            <UiDataTable
              :columns="memberColumns"
              :rows="team.members"
              row-key="email"
              empty-title="Žiadni členovia"
            >
              <template #cell-name="{ row }">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full bg-navy text-white text-xs font-medium flex items-center justify-center flex-shrink-0"
                  >
                    {{ getInitials(row.name) }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-navy">{{ row.name }}</p>
                    <p class="text-xs text-gray-400">{{ row.email }}</p>
                  </div>
                </div>
              </template>
              <template #cell-role="{ value }">
                <span
                  :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                    value === 'Team Lead' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600',
                  ]"
                >
                  {{ value }}
                </span>
              </template>
            </UiDataTable>
          </div>

          <!-- Applications -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 class="text-xl font-bold text-navy mb-6">Prihlášky tímu</h2>
            <UiDataTable
              :columns="appColumns"
              :rows="team.applications"
              empty-title="Tím zatiaľ nemá žiadne prihlášky"
              @row-click="(row: any) => navigateTo(`/prihlasky/${row.id}`)"
            >
              <template #cell-title="{ row }">
                <div>
                  <p class="text-sm font-medium text-navy">{{ row.title }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">
                    {{ row.program }} · {{ row.submittedAt || 'Rozpracovaná' }}
                  </p>
                </div>
              </template>
              <template #cell-status="{ value }">
                <UiStatusBadge :status="value" />
              </template>
            </UiDataTable>
          </div>
        </div>

        <!-- Right column -->
        <div class="space-y-6">
          <!-- Info card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-bold text-navy mb-5">Informácie</h2>
            <dl class="space-y-4">
              <div class="flex justify-between items-center">
                <dt class="text-sm text-gray-500">Vytvorený</dt>
                <dd class="text-sm font-medium text-navy">{{ team.createdAt }}</dd>
              </div>
              <div class="flex justify-between items-center">
                <dt class="text-sm text-gray-500">Členov</dt>
                <dd class="text-sm font-medium text-navy">{{ team.members.length }}</dd>
              </div>
              <div class="flex justify-between items-center">
                <dt class="text-sm text-gray-500">Prihlášok</dt>
                <dd class="text-sm font-medium text-navy">{{ team.applications.length }}</dd>
              </div>
              <div class="flex justify-between items-center">
                <dt class="text-sm text-gray-500">Vaša rola</dt>
                <dd class="text-sm font-medium text-navy">{{ team.myRole }}</dd>
              </div>
            </dl>
          </div>

          <!-- Quick actions -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-bold text-navy mb-5">Akcie</h2>
            <div class="space-y-3">
              <UiButton
                variant="outline"
                class="w-full"
              >
                <UserPlus class="w-4 h-4" />
                Pozvať člena
              </UiButton>
              <NuxtLink
                to="/prihlasky/nova"
                class="block"
              >
                <UiButton
                  variant="outline"
                  class="w-full"
                >
                  <FileText class="w-4 h-4" />
                  Nová prihláška
                </UiButton>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, Users, UserPlus, FileText } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
})

const route = useRoute()

useHead({ title: 'Detail tímu | NTI' })

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

const mockTeams = [
  {
    id: 1,
    name: 'GreenTech tím',
    myRole: 'Team Lead',
    createdAt: '2025-12-01',
    members: [
      { name: 'Ján Novák', role: 'Team Lead', email: 'jan.novak@example.com' },
      { name: 'Anna Kováčová', role: 'Developer', email: 'anna.kovacova@example.com' },
      { name: 'Peter Horváth', role: 'Designer', email: 'peter.horvath@example.com' },
      { name: 'Eva Tóthová', role: 'Analyst', email: 'eva.tothova@example.com' },
    ],
    applications: [
      {
        id: 1,
        title: 'EcoTrack - Sledovanie uhlíkovej stopy',
        program: 'Program A',
        status: 'approved',
        submittedAt: '2026-02-15',
      },
    ],
  },
  {
    id: 2,
    name: 'AI Innovators',
    myRole: 'Člen',
    createdAt: '2026-01-15',
    members: [
      { name: 'Lucia Szabóová', role: 'Team Lead', email: 'lucia.szaboova@example.com' },
      { name: 'Ján Novák', role: 'Developer', email: 'jan.novak@example.com' },
      { name: 'Marek Varga', role: 'ML Engineer', email: 'marek.varga@example.com' },
    ],
    applications: [
      {
        id: 2,
        title: 'StudyBuddy - AI asistent pre študentov',
        program: 'Program A',
        status: 'evaluating',
        submittedAt: '2026-03-10',
      },
    ],
  },
  {
    id: 3,
    name: 'HealthTech',
    myRole: 'Člen',
    createdAt: '2026-02-10',
    members: [
      { name: 'Tomáš Beneš', role: 'Team Lead', email: 'tomas.benes@example.com' },
      { name: 'Ján Novák', role: 'Backend Dev', email: 'jan.novak@example.com' },
      { name: 'Katarína Molnárová', role: 'Frontend Dev', email: 'katarina.molnarova@example.com' },
      { name: 'Michal Oravec', role: 'Designer', email: 'michal.oravec@example.com' },
      { name: 'Zuzana Krajčíová', role: 'Tester', email: 'zuzana.krajciova@example.com' },
    ],
    applications: [
      {
        id: 3,
        title: 'FitConnect - Fitness platforma',
        program: 'Program B',
        status: 'submitted',
        submittedAt: '2026-03-25',
      },
    ],
  },
]

const team = computed(() => {
  const id = Number(route.params.id)
  return mockTeams.find((t) => t.id === id) || null
})

const memberColumns = [
  { key: 'name', label: 'Člen' },
  { key: 'role', label: 'Rola' },
]

const appColumns = [
  { key: 'title', label: 'Prihláška' },
  { key: 'status', label: 'Stav' },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>
