<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-navy">Moje tímy</h1>
      <UiButton>
        <Plus class="w-4 h-4" />
        Vytvoriť tím
      </UiButton>
    </div>

    <!-- Team cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="team in mockTeams"
        :key="team.id"
        class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
      >
        <h3 class="font-semibold text-navy text-lg mb-3">{{ team.name }}</h3>

        <!-- Role badge -->
        <div class="mb-3">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
            {{ team.myRole }}
          </span>
        </div>

        <!-- Member initials -->
        <div class="flex items-center gap-1 mb-3">
          <div
            v-for="member in team.members.slice(0, 4)"
            :key="member.name"
            class="w-8 h-8 rounded-full bg-navy text-white text-xs font-medium flex items-center justify-center"
            :title="member.name"
          >
            {{ getInitials(member.name) }}
          </div>
          <div
            v-if="team.members.length > 4"
            class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 text-xs font-medium flex items-center justify-center"
          >
            +{{ team.members.length - 4 }}
          </div>
          <span class="text-sm text-gray-500 ml-2">{{ team.members.length }} členov</span>
        </div>

        <!-- Stats -->
        <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span class="flex items-center gap-1">
            <FileText class="w-4 h-4" />
            {{ team.applicationCount }} prihlášok
          </span>
          <span class="text-xs text-gray-400">{{ team.createdAt }}</span>
        </div>

        <!-- Detail link -->
        <NuxtLink
          :to="`/timy/${team.id}`"
          class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          Zobraziť detail
          <ChevronRight class="w-4 h-4" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, FileText, ChevronRight } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
})

useHead({ title: 'Moje tímy | NTI' })

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
    applicationCount: 1,
    createdAt: '2025-12-01',
    members: [
      { name: 'Ján Novák', role: 'Team Lead' },
      { name: 'Anna Kováčová', role: 'Developer' },
      { name: 'Peter Horváth', role: 'Designer' },
      { name: 'Eva Tóthová', role: 'Analyst' },
    ],
  },
  {
    id: 2,
    name: 'AI Innovators',
    myRole: 'Člen',
    applicationCount: 1,
    createdAt: '2026-01-15',
    members: [
      { name: 'Lucia Szabóová', role: 'Team Lead' },
      { name: 'Ján Novák', role: 'Developer' },
      { name: 'Marek Varga', role: 'ML Engineer' },
    ],
  },
  {
    id: 3,
    name: 'HealthTech',
    myRole: 'Člen',
    applicationCount: 1,
    createdAt: '2026-02-10',
    members: [
      { name: 'Tomáš Beneš', role: 'Team Lead' },
      { name: 'Ján Novák', role: 'Backend Dev' },
      { name: 'Katarína Molnárová', role: 'Frontend Dev' },
      { name: 'Michal Oravec', role: 'Designer' },
      { name: 'Zuzana Krajčíová', role: 'Tester' },
    ],
  },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>
