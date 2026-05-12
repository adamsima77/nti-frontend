<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div
      v-if="pending"
      class="bg-white rounded-lg border border-gray-100 h-96 animate-pulse"
    />

    <div
      v-else-if="!application"
      class="bg-white rounded-lg shadow-sm border border-gray-100"
    >
      <UiEmptyState
        :icon="FileText"
        title="Prihláška nenájdená"
      >
        <NuxtLink
          :to="localePath('/student/prihlasky')"
          class="text-sm font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
        >
          <ArrowLeft class="w-4 h-4" />
          Späť na prihlášky
        </NuxtLink>
      </UiEmptyState>
    </div>

    <template v-else>
      <div class="mb-6">
        <UiBreadcrumbs
          :items="[
            { label: 'Prihlášky', to: localePath('/student/prihlasky') },
            { label: application.title },
          ]"
        />
      </div>

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

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div
            v-if="application.description"
            class="bg-white rounded-lg shadow-sm border border-gray-100 p-5"
          >
            <h2 class="text-xl font-bold text-navy mb-3">Popis projektu</h2>
            <p class="text-sm text-gray-600 leading-relaxed">{{ application.description }}</p>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h2 class="text-xl font-bold text-navy mb-3">Dokumenty</h2>
            <UiDataTable
              :columns="docColumns"
              :rows="documentRows"
              row-key="id"
              empty-title="Žiadne dokumenty"
              :empty-icon="Paperclip"
            >
              <template #cell-name="{ row }">
                <div class="flex items-center gap-2">
                  <Paperclip class="w-4 h-4 text-gray-400" />
                  <span class="font-medium text-navy">{{ row.name }}</span>
                </div>
              </template>
            </UiDataTable>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h2 class="text-xl font-bold text-navy mb-3">Komentáre</h2>
            <UiEmptyState
              v-if="!application.comments?.length"
              title="Žiadne komentáre"
            />
            <div
              v-else
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
          </div>

          <div
            v-if="application.status === 'approved' && application.milestones.length"
            class="bg-white rounded-lg shadow-sm border border-gray-100 p-5"
          >
            <h2 class="text-xl font-bold text-navy mb-3">Míľníkový prehľad</h2>
            <div class="space-y-3">
              <div
                v-for="milestone in application.milestones"
                :key="milestone.id"
                class="border rounded-lg p-4"
                :class="{
                  'border-green-200 bg-green-50': milestone.status === 'completed',
                  'border-blue-200 bg-blue-50': milestone.status === 'in_progress',
                  'border-gray-200': milestone.status === 'pending',
                }"
              >
                <div class="flex items-start justify-between gap-3 mb-2">
                  <div class="flex items-start gap-3">
                    <div class="mt-0.5 shrink-0">
                      <CheckCircle
                        v-if="milestone.status === 'completed'"
                        class="w-5 h-5 text-success-500"
                      />
                      <Clock
                        v-else-if="milestone.status === 'in_progress'"
                        class="w-5 h-5 text-blue-500"
                      />
                      <Circle
                        v-else
                        class="w-5 h-5 text-gray-300"
                      />
                    </div>
                    <div>
                      <p class="font-medium text-navy text-sm">{{ milestone.title }}</p>
                      <p class="text-xs text-gray-500 mt-0.5">Termín: {{ milestone.dueDate }}</p>
                    </div>
                  </div>
                  <span
                    class="text-xs px-2 py-1 rounded-full font-medium shrink-0"
                    :class="{
                      'bg-success-100 text-success-700': milestone.status === 'completed',
                      'bg-blue-100 text-blue-700': milestone.status === 'in_progress',
                      'bg-gray-100 text-gray-700': milestone.status === 'pending',
                    }"
                  >
                    {{ milestoneStatus(milestone.status) }}
                  </span>
                </div>
                <p
                  v-if="milestone.description"
                  class="text-xs text-gray-600 ml-8"
                >
                  {{ milestone.description }}
                </p>
                <p
                  v-if="milestone.status === 'completed' && milestone.completedAt"
                  class="text-xs text-gray-500 ml-8 mt-2"
                >
                  ✓ Dokončené: {{ milestone.completedAt }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
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
                <dd class="text-sm font-medium text-navy">{{ documentRows.length }}</dd>
              </div>
            </dl>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h2 class="text-lg font-bold text-navy mb-3">História stavov</h2>
            <div
              v-if="historyRows.length"
              class="space-y-4"
            >
              <div
                v-for="(entry, i) in historyRows"
                :key="i"
                class="flex gap-3"
              >
                <div class="flex flex-col items-center">
                  <div
                    class="w-3 h-3 rounded-full flex-shrink-0"
                    :class="historyDotColor(entry.status)"
                  />
                  <div
                    v-if="i < historyRows.length - 1"
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
            <UiEmptyState
              v-else
              title="Žiadna história"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, Paperclip, FileText, CheckCircle, Clock, Circle } from 'lucide-vue-next'
import type { ApplicationStatus } from '../../../composables/modules/student/types'

const route = useRoute()
const localePath = useLocalePath()

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
})

useHead({ title: 'Detail prihlášky | NTI' })

const { application, pending } = useApplication(() => route.params.id as string)

const documentRows = computed(() => application.value?.documentRows ?? [])

const historyRows = computed(() => {
  const h = application.value?.history ?? []
  return [...h].reverse()
})

const docColumns = [
  { key: 'name', label: 'Názov' },
  { key: 'size', label: 'Veľkosť' },
  { key: 'uploadedAt', label: 'Nahrané' },
]

function historyDotColor(status: ApplicationStatus): string {
  const colors: Record<string, string> = {
    approved: 'bg-green-500',
    evaluating: 'bg-blue-500',
    submitted: 'bg-emerald-500',
    draft: 'bg-gray-400',
    rejected: 'bg-red-500',
  }
  return colors[status] || 'bg-gray-400'
}

function historyLabel(status: ApplicationStatus): string {
  const labels: Record<string, string> = {
    approved: 'Schválené',
    evaluating: 'V hodnotení',
    submitted: 'Podané',
    draft: 'Draft',
    rejected: 'Zamietnuté',
  }
  return labels[status] || status
}

function milestoneStatus(status: string): string {
  const labels: Record<string, string> = {
    completed: 'Dokončené',
    in_progress: 'V progrese',
    pending: 'Čakajúce',
  }
  return labels[status] || status
}
</script>
