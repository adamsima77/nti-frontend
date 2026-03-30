<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <!-- Not found -->
    <div
      v-if="!application"
      class="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center"
    >
      <FileText class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 font-medium mb-4">Prihláška nenájdená</p>
      <NuxtLink
        to="/prihlasky"
        class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 justify-center"
      >
        <ArrowLeft class="w-4 h-4" />
        Späť na prihlášky
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Back link -->
      <NuxtLink
        to="/prihlasky"
        class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6"
      >
        <ArrowLeft class="w-4 h-4" />
        Späť na prihlášky
      </NuxtLink>

      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-2xl font-bold text-navy">{{ application.title }}</h1>
            <UiStatusBadge :status="application.status" />
          </div>
          <p class="text-sm text-gray-500">
            {{ application.team }} · {{ application.program }}
            <span v-if="application.submittedAt"> · {{ application.submittedAt }}</span>
          </p>
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Popis projektu -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h2 class="text-xl font-bold text-navy mb-3">Popis projektu</h2>
            <p class="text-sm text-gray-600 leading-relaxed">{{ application.description }}</p>
          </div>

          <!-- Dokumenty -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h2 class="text-xl font-bold text-navy mb-3">Dokumenty</h2>
            <div
              v-if="application.documentsList.length"
              class="space-y-3"
            >
              <div
                v-for="doc in application.documentsList"
                :key="doc.name"
                class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div class="flex items-center gap-2">
                  <Paperclip class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-navy font-medium">{{ doc.name }}</span>
                </div>
                <div class="flex items-center gap-4 text-xs text-gray-400">
                  <span>{{ doc.size }}</span>
                  <span>{{ doc.uploadedAt }}</span>
                </div>
              </div>
            </div>
            <p
              v-else
              class="text-sm text-gray-400"
            >
              Žiadne dokumenty
            </p>
          </div>

          <!-- Komentáre -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h2 class="text-xl font-bold text-navy mb-3">Komentáre</h2>
            <div
              v-if="application.comments.length"
              class="space-y-4"
            >
              <div
                v-for="(comment, i) in application.comments"
                :key="i"
                class="border-b border-gray-50 pb-3 last:border-0 last:pb-0"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-navy">{{ comment.author }}</span>
                  <span class="text-xs text-gray-400">{{ comment.date }}</span>
                </div>
                <p class="text-sm text-gray-600">{{ comment.text }}</p>
              </div>
            </div>
            <p
              v-else
              class="text-sm text-gray-400"
            >
              Žiadne komentáre
            </p>
          </div>
        </div>

        <!-- Right column -->
        <div class="space-y-6">
          <!-- Info card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h2 class="text-lg font-bold text-navy mb-3">Informácie</h2>
            <dl class="space-y-3">
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500">Program</dt>
                <dd class="text-sm font-medium text-navy">{{ application.program }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500">Tím</dt>
                <dd class="text-sm font-medium text-navy">{{ application.team }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500">Členov</dt>
                <dd class="text-sm font-medium text-navy">{{ application.members }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500">Podané dňa</dt>
                <dd class="text-sm font-medium text-navy">{{ application.submittedAt || '—' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500">Dokumenty</dt>
                <dd class="text-sm font-medium text-navy">{{ application.documentsList.length }}</dd>
              </div>
            </dl>
          </div>

          <!-- História stavov -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h2 class="text-lg font-bold text-navy mb-3">História stavov</h2>
            <div class="space-y-4">
              <div
                v-for="(entry, i) in application.history"
                :key="i"
                class="flex gap-3"
              >
                <div class="flex flex-col items-center">
                  <div
                    class="w-3 h-3 rounded-full flex-shrink-0"
                    :class="historyDotColor(entry.status)"
                  />
                  <div
                    v-if="i < application.history.length - 1"
                    class="w-px flex-1 bg-gray-200 mt-1"
                  />
                </div>
                <div class="pb-4">
                  <p class="text-sm font-medium text-navy">{{ historyLabel(entry.status) }}</p>
                  <p class="text-xs text-gray-400">{{ entry.date }}</p>
                  <p
                    v-if="entry.note"
                    class="text-xs text-gray-500 mt-0.5"
                  >
                    {{ entry.note }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, Paperclip, FileText } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
})

const route = useRoute()

useHead({ title: 'Detail prihlášky | NTI' })

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

const mockApplications = [
  {
    id: 1,
    title: 'EcoTrack - Sledovanie uhlíkovej stopy',
    program: 'Program A',
    team: 'GreenTech tím',
    status: 'approved',
    submittedAt: '2026-02-15',
    members: 4,
    description:
      'Aplikácia na sledovanie a znižovanie uhlíkovej stopy pre študentov a malé firmy. Projekt využíva IoT senzory na meranie spotreby energie a ponúka personalizované odporúčania na zníženie emisií. Cieľom je vytvoriť komunitu uvedomelých spotrebiteľov.',
    documentsList: [
      { name: 'Podnikateľský plán.pdf', size: '2.4 MB', uploadedAt: '2026-02-10' },
      { name: 'Finančná projekcia.xlsx', size: '1.1 MB', uploadedAt: '2026-02-12' },
      { name: 'Technická špecifikácia.pdf', size: '3.2 MB', uploadedAt: '2026-02-14' },
      { name: 'Prezentácia tímu.pptx', size: '5.8 MB', uploadedAt: '2026-02-14' },
    ],
    history: [
      { status: 'approved', date: '2026-03-01', note: 'Prihláška schválená komisiou' },
      { status: 'evaluating', date: '2026-02-20', note: 'Priradená hodnotiaca komisia' },
      { status: 'submitted', date: '2026-02-15', note: null },
      { status: 'draft', date: '2026-02-01', note: 'Vytvorenie prihlášky' },
    ],
    comments: [
      {
        author: 'Ing. Mária Kováčová',
        text: 'Výborný projekt s jasnou víziou. Odporúčam schváliť.',
        date: '2026-02-28',
      },
      {
        author: 'Doc. Peter Horváth',
        text: 'Technická špecifikácia je dobre spracovaná, ale chýba analýza konkurencie.',
        date: '2026-02-22',
      },
    ],
  },
  {
    id: 2,
    title: 'StudyBuddy - AI asistent pre študentov',
    program: 'Program A',
    team: 'AI Innovators',
    status: 'evaluating',
    submittedAt: '2026-03-10',
    members: 3,
    description:
      'Inteligentný asistent využívajúci AI na personalizované učenie a prípravu na skúšky. Systém analyzuje študijné návyky a navrhuje optimálny učebný plán.',
    documentsList: [
      { name: 'Projektový zámer.pdf', size: '1.8 MB', uploadedAt: '2026-03-08' },
      { name: 'Prototyp dokumentácia.pdf', size: '4.1 MB', uploadedAt: '2026-03-09' },
    ],
    history: [
      { status: 'evaluating', date: '2026-03-15', note: 'Priradená hodnotiaca komisia' },
      { status: 'submitted', date: '2026-03-10', note: null },
      { status: 'draft', date: '2026-02-25', note: 'Vytvorenie prihlášky' },
    ],
    comments: [
      {
        author: 'Ing. Tomáš Novotný',
        text: 'Zaujímavý koncept, čakáme na výsledky pilotného testovania.',
        date: '2026-03-18',
      },
    ],
  },
  {
    id: 3,
    title: 'FitConnect - Fitness platforma',
    program: 'Program B',
    team: 'HealthTech',
    status: 'submitted',
    submittedAt: '2026-03-25',
    members: 5,
    description:
      'Komunitná fitness platforma prepájajúca trénerov so študentmi univerzity. Ponúka skupinové tréningy, individuálne plány a sledovanie pokroku.',
    documentsList: [
      { name: 'Špecifikácia zadania.pdf', size: '2.0 MB', uploadedAt: '2026-03-24' },
      { name: 'Wireframes.pdf', size: '6.3 MB', uploadedAt: '2026-03-25' },
    ],
    history: [
      { status: 'submitted', date: '2026-03-25', note: null },
      { status: 'draft', date: '2026-03-15', note: 'Vytvorenie prihlášky' },
    ],
    comments: [],
  },
  {
    id: 4,
    title: 'LocalMarket - Farmársky marketplace',
    program: 'Program A',
    team: 'AgriDigital',
    status: 'draft',
    submittedAt: null,
    members: 3,
    description:
      'Online trhovisko pre lokálnych farmárov s možnosťou predplatného a doručenia. Platforma umožňuje priame prepojenie producentov so spotrebiteľmi.',
    documentsList: [{ name: 'Náčrt konceptu.pdf', size: '0.8 MB', uploadedAt: '2026-03-20' }],
    history: [{ status: 'draft', date: '2026-03-18', note: 'Vytvorenie prihlášky' }],
    comments: [],
  },
  {
    id: 5,
    title: 'SmartPark - Inteligentné parkovanie',
    program: 'Program B',
    team: 'UrbanTech',
    status: 'rejected',
    submittedAt: '2026-01-20',
    members: 4,
    description:
      'Systém inteligentného parkovania s IoT senzormi a mobilnou aplikáciou. Riešenie je navrhnuté pre univerzitné kampusy a mestské zóny.',
    documentsList: [
      { name: 'Podnikateľský plán.pdf', size: '2.1 MB', uploadedAt: '2026-01-18' },
      { name: 'Technický návrh.pdf', size: '3.5 MB', uploadedAt: '2026-01-19' },
      { name: 'Rozpočet.xlsx', size: '0.9 MB', uploadedAt: '2026-01-19' },
    ],
    history: [
      { status: 'rejected', date: '2026-02-10', note: 'Nedostatočná analýza trhu a konkurencie' },
      { status: 'evaluating', date: '2026-01-28', note: 'Priradená hodnotiaca komisia' },
      { status: 'submitted', date: '2026-01-20', note: null },
      { status: 'draft', date: '2026-01-05', note: 'Vytvorenie prihlášky' },
    ],
    comments: [
      {
        author: 'Doc. Peter Horváth',
        text: 'Projekt nemá dostatočnú analýzu existujúcich riešení na trhu.',
        date: '2026-02-05',
      },
      {
        author: 'Ing. Mária Kováčová',
        text: 'Technicky zaujímavé, ale chýba jasný obchodný model.',
        date: '2026-02-08',
      },
    ],
  },
]

const application = computed(() => {
  const id = Number(route.params.id)
  return mockApplications.find((a) => a.id === id) || null
})

function historyDotColor(status: string): string {
  const colors: Record<string, string> = {
    approved: 'bg-green-500',
    evaluating: 'bg-blue-500',
    submitted: 'bg-emerald-500',
    draft: 'bg-gray-400',
    rejected: 'bg-red-500',
  }
  return colors[status] || 'bg-gray-400'
}

function historyLabel(status: string): string {
  const labels: Record<string, string> = {
    approved: 'Schválené',
    evaluating: 'V hodnotení',
    submitted: 'Podané',
    draft: 'Draft',
    rejected: 'Zamietnuté',
  }
  return labels[status] || status
}
</script>
