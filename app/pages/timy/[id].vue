<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <!-- Not found -->
    <div v-if="!team" class="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
      <Users class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 font-medium mb-4">Tím nenájdený</p>
      <NuxtLink to="/timy" class="text-sm font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 justify-center">
        <ArrowLeft class="w-4 h-4" />
        Späť na tímy
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Back link -->
      <NuxtLink to="/timy" class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-8">
        <ArrowLeft class="w-4 h-4" />
        Späť na tímy
      </NuxtLink>

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
            <div class="divide-y divide-gray-100">
              <div
                v-for="member in team.members"
                :key="member.name"
                class="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-navy text-white text-sm font-medium flex items-center justify-center flex-shrink-0">
                    {{ getInitials(member.name) }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-navy">{{ member.name }}</p>
                    <p class="text-sm text-gray-400 mt-0.5">{{ member.email }}</p>
                  </div>
                </div>
                <span
                  :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                    member.role === 'Team Lead' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'
                  ]"
                >
                  {{ member.role }}
                </span>
              </div>
            </div>
          </div>

          <!-- Applications -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 class="text-xl font-bold text-navy mb-6">Prihlášky tímu</h2>
            <div v-if="team.applications.length" class="divide-y divide-gray-100">
              <NuxtLink
                v-for="app in team.applications"
                :key="app.id"
                :to="`/prihlasky/${app.id}`"
                class="flex items-center justify-between py-4 first:pt-0 last:pb-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <p class="text-sm font-medium text-navy">{{ app.title }}</p>
                  <p class="text-sm text-gray-400 mt-1">{{ app.program }} · {{ app.submittedAt || 'Rozpracovaná' }}</p>
                </div>
                <UiStatusBadge :status="app.status" />
              </NuxtLink>
            </div>
            <p v-else class="text-sm text-gray-400">Tím zatiaľ nemá žiadne prihlášky</p>
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
              <UiButton variant="outline" class="w-full">
                <UserPlus class="w-4 h-4" />
                Pozvať člena
              </UiButton>
              <NuxtLink to="/prihlasky/nova" class="block">
                <UiButton variant="outline" class="w-full">
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
    role: 'student'
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
      { id: 1, title: 'EcoTrack - Sledovanie uhlíkovej stopy', program: 'Program A', status: 'approved', submittedAt: '2026-02-15' },
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
      { id: 2, title: 'StudyBuddy - AI asistent pre študentov', program: 'Program A', status: 'evaluating', submittedAt: '2026-03-10' },
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
      { id: 3, title: 'FitConnect - Fitness platforma', program: 'Program B', status: 'submitted', submittedAt: '2026-03-25' },
    ],
  },
]

const team = computed(() => {
  const id = Number(route.params.id)
  return mockTeams.find(t => t.id === id) || null
})

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>
