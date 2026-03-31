<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <!-- Loading state -->
    <div v-if="callsStore.isLoading" class="bg-white rounded-lg shadow-sm border border-gray-100 p-8 h-96 animate-pulse" />

    <!-- Not found -->
    <div v-else-if="!callsStore.currentCall" class="bg-white rounded-lg shadow-sm border border-gray-100">
      <UiEmptyState
        :icon="AlertCircle"
        title="Výzva nenájdená"
      >
        <NuxtLink to="/vyzvy" class="text-sm font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
          <ArrowLeft class="w-4 h-4" />
          Späť na výzvy
        </NuxtLink>
      </UiEmptyState>
    </div>

    <template v-else>
      <!-- Breadcrumbs -->
      <div class="mb-8">
        <UiBreadcrumbs :items="[{ label: 'Výzvy', to: '/vyzvy' }, { label: callsStore.currentCall.title }]" />
      </div>

      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h1 class="text-4xl font-bold text-navy mb-2">{{ callsStore.currentCall.title }}</h1>
            <p class="text-lg text-gray-600">{{ callsStore.currentCall.programName }}</p>
          </div>
          <span
            :class="[
              'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium',
              callsStore.currentCall.status === 'open' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700',
            ]"
          >
            {{ callsStore.currentCall.status === 'open' ? '🟢 Otvorené' : '🔒 Zatvorené' }}
          </span>
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Description -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 class="text-2xl font-bold text-navy mb-4">O výzve</h2>
            <p class="text-gray-700 text-lg leading-relaxed">{{ callsStore.currentCall.description }}</p>
          </div>

          <!-- Timeline -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 class="text-2xl font-bold text-navy mb-6">Termín prihlášky</h2>
            <div class="space-y-4">
              <div class="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                <div class="flex-shrink-0">
                  <Calendar class="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p class="text-sm text-gray-600">Prihlášky otvorené</p>
                  <p class="font-semibold text-navy">{{ formatDate(callsStore.currentCall.startDate) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="flex-shrink-0">
                  <Clock class="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p class="text-sm text-gray-600">Prihlášky zatvárajú sa</p>
                  <p class="font-semibold text-navy">{{ formatDate(callsStore.currentCall.endDate) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Preview -->
          <div v-if="callsStore.currentCall.formSchema" class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 class="text-2xl font-bold text-navy mb-4">Formulár prihlášky</h2>
            <div class="text-gray-700">
              <p v-if="callsStore.currentCall.formSchema?.description" class="mb-3">{{ callsStore.currentCall.formSchema?.description }}</p>
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-sm font-medium text-gray-700 mb-3">Polia v prihláškovom formulári:</p>
                <ul class="space-y-2">
                  <li v-for="field in callsStore.currentCall.formSchema.fields" :key="field.name" class="text-sm text-gray-600">
                    <span class="font-medium text-navy">{{ field.label }}</span>
                    <span v-if="field.required" class="text-red-500 ml-1">*</span>
                    <span class="text-gray-500 ml-2">— {{ field.type }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Info card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 class="text-lg font-bold text-navy mb-5">Informácie</h2>
            <dl class="space-y-4">
              <div class="flex justify-between items-start">
                <dt class="text-sm text-gray-600">Program</dt>
                <dd class="text-sm font-medium text-navy text-right">{{ callsStore.currentCall.programName }}</dd>
              </div>
              <div class="flex justify-between items-start">
                <dt class="text-sm text-gray-600">Stav</dt>
                <dd
                  :class="[
                    'text-sm font-medium rounded px-2 py-1',
                    callsStore.currentCall.status === 'open' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700',
                  ]"
                >
                  {{ callsStore.currentCall.status === 'open' ? 'Otvorené' : 'Zatvorené' }}
                </dd>
              </div>
              <div class="flex justify-between items-start">
                <dt class="text-sm text-gray-600">Prihlášok</dt>
                <dd class="text-sm font-medium text-navy">{{ callsStore.currentCall.applicantsCount || 0 }}</dd>
              </div>
              <div v-if="callsStore.currentCall.maxTeams" class="flex justify-between items-start">
                <dt class="text-sm text-gray-600">Max. tímov</dt>
                <dd class="text-sm font-medium text-navy">{{ callsStore.currentCall.maxTeams }}</dd>
              </div>
            </dl>
          </div>

          <!-- CTA Button -->
          <NuxtLink
            v-if="callsStore.currentCall.status === 'open'"
            to="/prihlasky/nova"
            class="block"
          >
            <button class="w-full px-6 py-4 text-lg font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
              <FileText class="w-5 h-5" />
              Prihlásiť sa
            </button>
          </NuxtLink>

          <!-- Closed warning -->
          <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-sm text-yellow-800">
              <span class="font-semibold">Prihlášky sú zatvorené</span>
              <br />
              Táto výzva už neprijíma nové prihlášky.
            </p>
          </div>

          <!-- Back link -->
          <NuxtLink
            to="/vyzvy"
            class="block text-center px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            ← Späť na výzvy
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { Calendar, Clock, FileText, ArrowLeft, AlertCircle } from 'lucide-vue-next'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const callsStore = useCallsStore()

useHead({
  title: 'Detail výzvy | NTI',
  meta: [
    {
      name: 'description',
      content: 'Detail výzvy v Nitrianskom technickom inkubátore.',
    },
  ],
})

// Load call data when ID changes
const loadCall = async () => {
  await callsStore.fetchCallById(route.params.id as string)
}

// Watch for route param changes (immediate: true executes on mount)
watch(() => route.params.id, () => {
  loadCall()
}, { immediate: true })

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('sk-SK')
}
</script>
