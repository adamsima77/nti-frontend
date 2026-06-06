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
        :title="t('student_dashboard.applications.detail.not_found_title')"
      >
        <NuxtLink
          :to="localePath('/student/prihlasky')"
          class="text-sm font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
        >
          <ArrowLeft class="w-4 h-4" />
          {{ t('student_dashboard.applications.back_to_applications') }}
        </NuxtLink>
      </UiEmptyState>
    </div>

    <template v-else>
      <div class="mb-6">
        <UiBreadcrumbs
          :items="[
            { label: t('student_dashboard.applications.title'), to: localePath('/student/prihlasky') },
            { label: application.title },
          ]"
        />
      </div>

      <div v-if="application.statusName === SUPPLEMENT && supplementEntry" class="mb-6">
        <div class="rounded-lg border border-amber-100 bg-amber-50 p-4 flex items-start justify-between gap-4">
          <div>
            <p class="font-medium text-amber-800">{{ t('student_dashboard.applications.supplement.banner_title') }}</p>
            <p class="text-sm text-amber-700 mt-1">{{ supplementEntry.note }}</p>
          </div>
          <div class="shrink-0">
            <button
              @click="editAndResubmit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
            >
              {{ t('student_dashboard.applications.supplement.edit_and_resubmit') }}
            </button>
          </div>
        </div>
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
            v-if="application.description || application.formDataList?.length"
            class="bg-white rounded-lg shadow-sm border border-gray-100 p-5"
          >
            <h2 class="text-xl font-bold text-navy mb-3">{{ t('student_dashboard.applications.detail.project_description') }}</h2>
            <div v-if="application.formDataList?.length" class="space-y-3">
              <div v-for="item in application.formDataList" :key="item.key" class="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                <span class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{{ item.key }}</span>
                <span class="text-sm text-gray-700 font-medium">{{ item.value }}</span>
              </div>
            </div>
            <p v-else class="text-sm text-gray-600 leading-relaxed">{{ application.description }}</p>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h2 class="text-xl font-bold text-navy mb-3">{{ t('student_dashboard.applications.detail.documents') }}</h2>
            <UiDataTable
              :columns="docColumns"
              :rows="documentRows"
              row-key="id"
              :empty-title="t('student_dashboard.applications.detail.no_documents')"
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
            <h2 class="text-xl font-bold text-navy mb-3">{{ t('student_dashboard.applications.detail.comments') }}</h2>
            <UiEmptyState
              v-if="!application.comments?.length"
              :title="t('student_dashboard.applications.detail.no_comments')"
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
            v-if="application.isApproved && application.milestones?.length"
            class="bg-white rounded-lg shadow-sm border border-gray-100 p-5"
          >
            <h2 class="text-xl font-bold text-navy mb-3">{{ t('student_dashboard.applications.detail.milestones_overview') }}</h2>
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
                      <p class="text-xs text-gray-500 mt-0.5">{{ t('student_dashboard.applications.detail.deadline') }}: {{ milestone.dueDate }}</p>
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
                  ✓ {{ t('student_dashboard.applications.detail.completed') }}: {{ milestone.completedAt }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h2 class="text-lg font-bold text-navy mb-3">{{ t('student_dashboard.applications.detail.information') }}</h2>
            <dl class="space-y-3">
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500">{{ t('student_dashboard.applications.filters.program') }}</dt>
                <dd class="text-sm font-medium text-navy text-right">{{ application.program }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500">{{ t('student_dashboard.applications.detail.category') }}</dt>
                <dd class="text-sm font-medium text-navy text-right">{{ application.category || t('student_dashboard.common.not_available') }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500">{{ t('student_dashboard.applications.team') }}</dt>
                <dd class="text-sm font-medium text-navy text-right">{{ application.team }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500">{{ t('student_dashboard.applications.detail.submitted_at') }}</dt>
                <dd class="text-sm font-medium text-navy text-right">{{ application.submittedAt || t('student_dashboard.common.not_available') }}</dd>
              </div>
              <div class="flex justify-between pb-3">
                <dt class="text-sm text-gray-500">{{ t('student_dashboard.applications.detail.documents') }}</dt>
                <dd class="text-sm font-medium text-navy text-right">{{ documentRows.length }}</dd>
              </div>

              <div v-if="application.teamMembers?.length" class="border-t border-gray-100 pt-3 mt-3">
                <dt class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {{ t('student_dashboard.applications.detail.members') }}
                </dt>
                <dd class="space-y-2.5">
                  <div
                    v-for="member in application.teamMembers"
                    :key="member.user_id"
                    class="bg-gray-50/70 rounded-lg p-2.5 border border-gray-100"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-sm font-medium text-gray-900">
                        {{ member.name }} {{ member.surname }}
                      </span>
                      <span class="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium whitespace-nowrap">
                        {{ member.role_name }}
                      </span>
                    </div>

                    <div
                      v-if="member.student?.academic_flags?.length"
                      class="flex flex-wrap gap-1 mt-1.5"
                    >
                      <span
                        v-for="flag in member.student.academic_flags"
                        :key="flag.id"
                        class="inline-flex items-center text-[10px] bg-amber-50 text-amber-800 border border-amber-100 px-1.5 py-0.5 rounded font-medium"
                      >
                        {{ flag.name }}
                      </span>
                    </div>
                  </div>
                </dd>
              </div>
            </dl>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h2 class="text-lg font-bold text-navy mb-3">{{ t('student_dashboard.applications.detail.status_history') }}</h2>
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
              :title="t('student_dashboard.applications.detail.no_history')"
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
import { useApplication } from '../../../composables/modules/student/useApplications'
import { useApplicationsStore } from '~/stores/applications'
import { useRouter } from 'vue-router'

const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
  roles: ['student'],
})

useHead({ title: t('student_dashboard.applications.detail_seo_title') })

const { application: apiResponse, pending } = useApplication(() => route.params.id as string)
const applicationsStore = useApplicationsStore()
const router = useRouter()
const SUPPLEMENT = 'supplement'

// Kompletné premapovanie API štruktúry na FE model
const application = computed(() => {
  // Ak useApplication vracia { application: { id: 9, ... } }
  const app = apiResponse.value?.application || apiResponse.value
  if (!app || !app.id) return null

  const formDataList = app.form_data
    ? Object.entries(app.form_data).map(([key, value]) => ({ key, value }))
    : []

  return {
    id: app.id,
    title: app.call?.name ?? '—',
    status: app.status ?? null,
    statusName: app.status?.name?.toLowerCase() ?? '',
    team: app.team?.name ?? '—',
    program: app.call?.name ?? '—',
    submittedAt: app.submitted_at ? formatDate(app.submitted_at) : null,
    description: '',
    formDataList,
    teamMembers: app.team_members ?? [],
    comments: app.comments ?? [],
    milestones: app.milestones ?? [],
    history: app.status_history ?? [],
    category: app.category?.name ?? null,
    isApproved: app.status?.name?.toLowerCase() === 'schválené',
    raw: app
  }
})

// Príprava riadkov pre UiDataTable dokumentov
const documentRows = computed(() => {
  const docs = apiResponse.value?.application?.documents ?? []
  return docs.map((doc: any) => ({
    id: doc.id,
    name: doc.name,
    size: '—', 
    uploadedAt: formatDate(doc.uploaded_at)
  }))
})

const historyRows = computed(() => {
  const h = application.value?.history ?? []
  return [...h].reverse()
})

const supplementEntry = computed(() => {
  const rows = historyRows.value || []
  return rows.find((r: any) => r.status === 'supplement' || r.status?.name?.toLowerCase() === 'supplement') ?? null
})

const docColumns = [
  { key: 'name', label: t('student_dashboard.applications.detail.table_name') },
  { key: 'size', label: t('student_dashboard.applications.detail.table_size') },
  { key: 'uploadedAt', label: t('student_dashboard.applications.detail.table_uploaded_at') },
]

function formatDate(iso?: string): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('sk-SK', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(iso))
}

function historyDotColor(status: any): string {
  const s = typeof status === 'object' ? status?.name?.toLowerCase() : String(status).toLowerCase()
  if (s?.includes('schválené') || s?.includes('approved')) return 'bg-green-500'
  if (s?.includes('hodnotenie') || s?.includes('evaluating')) return 'bg-blue-500'
  if (s?.includes('podané') || s?.includes('submitted')) return 'bg-emerald-500'
  if (s?.includes('draft')) return 'bg-gray-400'
  if (s?.includes('zamietnuté') || s?.includes('rejected')) return 'bg-red-500'
  return 'bg-gray-400'
}

function historyLabel(status: any): string {
  if (typeof status === 'object') return status?.name ?? ''
  return status
}

function milestoneStatus(status: string): string {
  const labels: Record<string, string> = {
    completed: t('student_dashboard.applications.detail.completed'),
    in_progress: t('student_dashboard.applications.detail.in_progress'),
    pending: t('student_dashboard.applications.detail.pending'),
  }
  return labels[status] || status
}

async function editAndResubmit() {
  const raw = application.value?.raw
  if (!raw) return
  if (application.value?.statusName !== 'supplement') return

  try {
    await applicationsStore.fetchApplicationById(raw.id)
    const currentRaw = (applicationsStore.currentApplication as any) || raw
    
    const formData = currentRaw.form_data ?? {}
    const callId = currentRaw.call_id ?? currentRaw.call?.id
    const teamId = currentRaw.team_id ?? currentRaw.team?.id

    if (!callId || !teamId) {
      await router.push(localePath('/student/prihlasky/nova'))
      return
    }

    applicationsStore.saveDraft(teamId, callId, formData)
    await router.push(localePath(`/student/prihlasky/nova?call=${callId}&team=${teamId}`))
  } catch (err) {
    console.error('Failed to prepare resubmit:', err)
  }
}
</script>