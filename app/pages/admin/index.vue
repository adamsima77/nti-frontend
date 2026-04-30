<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-navy">Dashboard</h1>
      <p class="text-gray-500 mt-1">Prehľad aktivít a štatistík platformy</p>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-4"
      >
        <div
          class="w-1 h-12 rounded-full"
          :class="stat.borderColor"
        />
        <div>
          <p class="text-sm text-gray-500">{{ stat.label }}</p>
          <p class="text-2xl font-bold text-navy">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recent activity -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-navy mb-4">Posledna aktivita</h2>
        <ul class="space-y-3">
          <li
            v-for="(entry, i) in recentActivity"
            :key="i"
            class="flex items-start gap-3 text-sm"
          >
            <component
              :is="entry.icon"
              class="w-4 h-4 mt-0.5 text-gray-400 shrink-0"
            />
            <div>
              <p class="text-gray-700">{{ entry.text }}</p>
              <p class="text-xs text-gray-400">{{ entry.time }}</p>
            </div>
          </li>
        </ul>
      </div>

      <!-- Active calls -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-navy mb-4">Aktivne vyzvy</h2>
        <div class="space-y-4">
          <div
            v-for="call in activeCalls"
            :key="call.name"
            class="border border-gray-100 rounded-md p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-medium text-navy">{{ call.name }}</h3>
              <UiStatusBadge :status="call.status" />
            </div>
            <p class="text-sm text-gray-500">{{ call.program }}</p>
            <div class="flex items-center justify-between mt-2 text-xs text-gray-400">
              <span>{{ call.applications }} prihlasok</span>
              <span>Deadline: {{ call.deadline }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText, Users, UserPlus, CheckCircle, AlertCircle } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
  roles: ['nti_admin']
})

useHead({ title: 'Dashboard — Admin | NTI' })

const stats = ref([
  { label: 'Prihlasky', value: 24, borderColor: 'bg-blue-500' },
  { label: 'Aktivne vyzvy', value: 3, borderColor: 'bg-green-500' },
  { label: 'Pouzivatelia', value: 142, borderColor: 'bg-purple-500' },
  { label: 'Timy', value: 18, borderColor: 'bg-orange-500' },
])

const recentActivity = ref([
  { icon: FileText, text: 'Nova prihlaska od timu "EcoTech" na vyzvu Q1 2026', time: 'pred 2 hodinami' },
  { icon: UserPlus, text: 'Novy pouzivatel: jan.novak@ukf.sk', time: 'pred 3 hodinami' },
  { icon: CheckCircle, text: 'Prihlaska #18 schvalena hodnotitelom', time: 'pred 5 hodinami' },
  { icon: AlertCircle, text: 'Vyzva "Letny inkubator 2026" — deadline o 3 dni', time: 'pred 6 hodinami' },
  { icon: Users, text: 'Tim "SmartCampus" aktualizoval profil', time: 'vcera' },
])

const activeCalls = ref([
  {
    name: 'Jarny inkubator 2026',
    program: 'Program A — Grantova inkubacia',
    status: 'active' as const,
    applications: 8,
    deadline: '15.04.2026',
  },
  {
    name: 'Letny sprint — mobilna appka',
    program: 'Program B — Ziva prax',
    status: 'active' as const,
    applications: 5,
    deadline: '30.04.2026',
  },
  {
    name: 'Jesenný inkubator 2026',
    program: 'Program A — Grantova inkubacia',
    status: 'draft' as const,
    applications: 0,
    deadline: '01.09.2026',
  },
])
</script>
