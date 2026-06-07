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
      <!-- Breadcrumbs -->
      <div class="mb-6">
        <UiBreadcrumbs
          :items="[
            { label: t('student_dashboard.applications.title'), to: localePath('/student/prihlasky') },
            { label: application.title },
          ]"
        />
      </div>

      <!-- Supplement banner -->
      <div v-if="application.status === 'supplement' && supplementEntry" class="mb-6">
        <div class="rounded-lg border border-amber-100 bg-amber-50 p-4 flex items-start justify-between gap-4">
          <div>
            <p class="font-medium text-amber-800">{{ t('student_dashboard.applications.supplement.banner_title') }}</p>
            <p class="text-sm text-amber-700 mt-1">{{ supplementEntry.note }}</p>
          </div>
          <div class="shrink-0">
            <button
              v-if="!isEditing"
              @click="startEditing"
              class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
            >
              {{ t('student_dashboard.applications.supplement.edit_and_resubmit') }}
            </button>
            <button
              v-else
              @click="cancelEditing"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition"
            >
              {{ t('student_dashboard.applications.supplement.cancel_edit') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Page header -->
      <div class="flex items-start justify-between mb-6">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-2xl font-bold text-navy">{{ application.title }}</h1>
            <UiStatusBadge :status="application.status" />
          </div>
          <p class="text-sm text-gray-500">
            {{ application.team }} · {{ application.program }}
            <span v-if="application.submittedAt"> · {{ formatDate(application.submittedAt) }}</span>
          </p>
        </div>

        <!-- Draft: primary CTA to open form inline -->
        <div v-if="application.status === 'draft' && !isEditing" class="shrink-0">
          <button
            @click="startEditing"
            class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
          >
            {{ t('student_dashboard.applications.detail.submit_draft') }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main column -->
        <div class="lg:col-span-2 space-y-6">

          <!-- ── EDIT MODE ─────────────────────────────────────────── -->
          <div
            v-if="isEditing"
            class="bg-white rounded-lg shadow-sm border border-blue-200 p-5"
          >
            <div class="flex items-start justify-between mb-5">
              <div>
                <h2 class="text-xl font-bold text-navy">{{ t('student_dashboard.applications.supplement.editing_title') }}</h2>
                <p class="text-sm text-gray-500 mt-0.5">{{ t('student_dashboard.applications.supplement.editing_subtitle') }}</p>
              </div>
              <button
                @click="cancelEditing"
                class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                <X class="w-4 h-4" />
                {{ t('student_dashboard.applications.supplement.cancel_edit') }}
              </button>
            </div>

            <!-- Schema loading -->
            <div v-if="schemaLoading" class="h-40 bg-gray-50 animate-pulse rounded-lg" />

            <DynamicForm
              v-else-if="formSchema?.fields?.length"
              :form-schema="formSchema"
              :initial-data="editingData"
              :draft-persist-enabled="false"
              @cancel="cancelEditing"
              @save-draft="handleEditSaveDraft"
              @submit="handleEditSubmit"
            />

            <div
              v-else
              class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            >
              {{ t('student_dashboard.applications.no_form_schema') }}
            </div>
          </div>

          <!-- ── VIEW MODE: schema-aware answers ───────────────────── -->
          <div
            v-else-if="schemaFormItems.length"
            class="bg-white rounded-lg shadow-sm border border-gray-100 p-5"
          >
            <h2 class="text-xl font-bold text-navy mb-3">{{ t('student_dashboard.applications.detail.project_description') }}</h2>
            <div class="space-y-3">
              <div
                v-for="item in schemaFormItems"
                :key="item.fieldName"
                class="bg-gray-50/50 p-3 rounded-lg border border-gray-100"
              >
                <span class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  {{ item.label }}
                </span>

                <!-- File field: download buttons -->
                <div v-if="item.isFile">
                  <span v-if="!item.documentIds.length" class="text-sm text-gray-400">—</span>
                  <div v-else class="flex flex-wrap gap-2">
                    <button
                      v-for="docId in item.documentIds"
                      :key="docId"
                      @click="downloadDocument(docId)"
                      :disabled="downloadingIds.has(docId)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                      <Loader2
                        v-if="downloadingIds.has(docId)"
                        class="w-4 h-4 animate-spin"
                      />
                      <Download v-else class="w-4 h-4" />
                      {{ docMetaMap[docId]?.name ?? `Súbor #${docId}` }}
                    </button>
                  </div>
                </div>

                <!-- Boolean / checkbox -->
                <span
                  v-else-if="item.isBoolean"
                  class="text-sm text-gray-700 font-medium"
                >
                  {{ item.value === '1' || item.value === true ? t('student_dashboard.common.yes') : t('student_dashboard.common.no') }}
                </span>

                <!-- Long text (textarea) -->
                <p
                  v-else-if="item.isLongText"
                  class="text-sm text-gray-700 whitespace-pre-line leading-relaxed"
                >
                  {{ item.value || '—' }}
                </p>

                <!-- Default -->
                <span v-else class="text-sm text-gray-700 font-medium">
                  {{ item.value || '—' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Fallback plain description (no schema or no formData) -->
          <div
            v-else-if="application.description"
            class="bg-white rounded-lg shadow-sm border border-gray-100 p-5"
          >
            <h2 class="text-xl font-bold text-navy mb-3">{{ t('student_dashboard.applications.detail.project_description') }}</h2>
            <p class="text-sm text-gray-600 leading-relaxed">{{ application.description }}</p>
          </div>

          <!-- Comments (hidden while editing) -->
          <div
            v-if="!isEditing"
            class="bg-white rounded-lg shadow-sm border border-gray-100 p-5"
          >
            <h2 class="text-xl font-bold text-navy mb-3">{{ t('student_dashboard.applications.detail.comments') }}</h2>
            <UiEmptyState
              v-if="!historyRows?.length"
              :title="t('student_dashboard.applications.detail.no_comments')"
            />
            <div v-else class="space-y-4">
              <div
                v-for="(comment, i) in historyRows"
                :key="i"
                class="border-b border-gray-50 pb-3 last:border-0 last:pb-0"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-navy">{{ comment?.changed_by?.name }}</span>
                  <span class="text-xs text-gray-400">{{ comment?.changed_by?.updated_at }}</span>
                </div>
                <p class="text-sm text-gray-600">{{ comment?.note }}</p>
              </div>
            </div>
          </div>

          <!-- Milestones (hidden while editing) -->
          <div
            v-if="!isEditing && application.status === 'approved' && application.milestones?.length"
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
                      <CheckCircle v-if="milestone.status === 'completed'" class="w-5 h-5 text-success-500" />
                      <Clock v-else-if="milestone.status === 'in_progress'" class="w-5 h-5 text-blue-500" />
                      <Circle v-else class="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                      <p class="font-medium text-navy text-sm">{{ milestone.title }}</p>
                      <p class="text-xs text-gray-500 mt-0.5">
                        {{ t('student_dashboard.applications.detail.deadline') }}: {{ milestone.dueDate ? formatDate(milestone.dueDate) : '—' }}
                      </p>
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
                <p v-if="milestone.description" class="text-xs text-gray-600 ml-8">
                  {{ milestone.description }}
                </p>
                <p v-if="milestone.status === 'completed' && milestone.completedAt" class="text-xs text-gray-500 ml-8 mt-2">
                  ✓ {{ t('student_dashboard.applications.detail.completed') }}: {{ formatDate(milestone.completedAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar (always visible for context) -->
        <div class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h2 class="text-lg font-bold text-navy mb-3">{{ t('student_dashboard.applications.detail.information') }}</h2>
            <dl class="space-y-3">
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500">{{ t('student_dashboard.applications.filters.program') }}</dt>
                <dd class="text-sm font-medium text-navy text-right">{{ application.program }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500">{{ t('student_dashboard.applications.team') }}</dt>
                <dd class="text-sm font-medium text-navy text-right">{{ application.team }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500">{{ t('student_dashboard.applications.detail.submitted_at') }}</dt>
                <dd class="text-sm font-medium text-navy text-right">
                  {{ application.submittedAt ? formatDate(application.submittedAt) : t('student_dashboard.common.not_available') }}
                </dd>
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
                    <div v-if="member.student?.academic_flags?.length" class="flex flex-wrap gap-1 mt-1.5">
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
            <div v-if="application.history?.length" class="space-y-4">
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
                  <p class="text-xs text-gray-400">{{ formatDate(entry.date) }}</p>
                  <p v-if="entry.note" class="text-xs text-gray-500 mt-0.5">{{ entry.note }}</p>
                </div>
              </div>
            </div>
            <UiEmptyState v-else :title="t('student_dashboard.applications.detail.no_history')" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  Clock,
  Circle,
  Download,
  Loader2,
  X,
} from 'lucide-vue-next'
import { useApplication } from '../../../composables/modules/student/useApplications'
import { useApplicationsStore } from '~/stores/applications'
import { useRouter, useRoute } from 'vue-router'
import type { FormSchema } from '~/stores/applications'

// ── Helpers (mirrored from nova.vue) ───────────────────────────────────────

function parseUploadedDocumentIds(val: unknown): number[] {
  if (val == null || val === '') return []
  if (typeof val === 'number' && Number.isFinite(val) && val > 0) return [val]
  if (Array.isArray(val)) return val.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0)
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val) as unknown
      if (Array.isArray(parsed)) return parsed.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0)
      if (typeof parsed === 'number' && parsed > 0) return [parsed]
    } catch {
      if (/^\d+$/.test(val)) return [Number(val)]
    }
  }
  return []
}

function serializeFormDataForApi(
  schema: FormSchema,
  data: Record<string, unknown>,
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const field of schema.fields) {
    const v = data[field.name]
    if (field.type === 'file') {
      const ids = parseUploadedDocumentIds(v)
      out[field.name] = ids.length ? JSON.stringify(ids) : ''
    } else if (field.type === 'checkbox') {
      out[field.name] = v === true || v === 1 || v === '1' ? '1' : '0'
    } else if (field.type === 'repeater') {
      out[field.name] = JSON.stringify(Array.isArray(v) ? v : [])
    } else if (v == null) {
      out[field.name] = ''
    } else {
      out[field.name] = typeof v === 'string' ? v : String(v)
    }
  }
  return out
}

// ── Page meta ──────────────────────────────────────────────────────────────

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
  roles: ['student'],
})

// ── Composables ────────────────────────────────────────────────────────────

const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()
const router = useRouter()
const api = useApi()

const applicationsStore = useApplicationsStore()
const callsStore = useCallsStore()
const { addToast } = useToast()

useHead({ title: t('student_dashboard.applications.detail_seo_title') })

// ── Application data ───────────────────────────────────────────────────────

const { application: applicationModel, pending } = useApplication(() => route.params.id as string)
const application = computed(() => applicationModel.value)

// ── Schema state ───────────────────────────────────────────────────────────

const formSchema = ref<FormSchema | null>(null)
const schemaLoading = ref(false)

// Watch for application to load, then fetch its call's form schema
watch(
  applicationModel,
  async (app) => {
    if (!app || formSchema.value) return

    schemaLoading.value = true
    try {
      // Ensure raw application is in store (call_id lives on the raw model)
      const raw = applicationsStore.currentApplication as any
      let callId: number | null =
        raw?.call_id ?? (app as any).call_id ?? (app as any).callId ?? null

      if (!callId) {
        // Last resort: refetch to get raw fields
        await applicationsStore.fetchApplicationById((app as any).id)
        const fetched = applicationsStore.currentApplication as any
        callId = fetched?.call_id ?? null
      }

      if (callId) {
        await callsStore.fetchCallById(Number(callId))
        formSchema.value = callsStore.currentCall?.formSchema ?? null
      }
    } finally {
      schemaLoading.value = false
    }
  },
  { immediate: true },
)

// ── Schema-aware form items ────────────────────────────────────────────────

const schemaFormItems = computed(() => {
  const data = application.value?.formData
  if (!data) return []

  const fields: any[] = formSchema.value?.fields ?? []

  return Object.entries(data).map(([key, val]) => {
    const def = fields.find((f) => f.name === key)
    const type = def?.type ?? 'text'
    const documentIds = type === 'file' ? parseUploadedDocumentIds(val) : []

    return {
      fieldName: key,
      label: def?.label ?? key,
      value: val as any,
      isFile: type === 'file',
      isBoolean: type === 'checkbox',
      isLongText: type === 'textarea',
      documentIds,
    }
  })
})

// ── Document metadata (name display) ──────────────────────────────────────

const docMetaMap = reactive<Record<number, { name: string }>>({})

async function loadDocumentMeta(ids: number[]) {
  const fresh = ids.filter((id) => !docMetaMap[id])
  if (!fresh.length) return

  await Promise.allSettled(
    fresh.map(async (id) => {
      try {
        const res = (await api.get(`/documents/${id}`)) as any
        const doc = res?.data ?? res
        docMetaMap[id] = {
          name: doc?.original_name ?? doc?.name ?? `Súbor #${id}`,
        }
      } catch {
        docMetaMap[id] = { name: `Súbor #${id}` }
      }
    }),
  )
}

// Load metadata whenever schema items resolve
watch(
  schemaFormItems,
  (items) => {
    const allIds = items.flatMap((i) => i.documentIds)
    if (allIds.length) loadDocumentMeta(allIds)
  },
  { immediate: true },
)

// ── File download ──────────────────────────────────────────────────────────

// ref<Set> + full Set replacement on each mutation — same pattern as
// ApplicationDetailModal so Vue correctly tracks reactivity
const downloadingIds = ref<Set<number>>(new Set())

async function downloadDocument(docId: number) {
  if (downloadingIds.value.has(docId)) return

  downloadingIds.value = new Set([...downloadingIds.value, docId])

  try {
    const blob: Blob = await api.get(`/documents/${docId}/download`, {
      responseType: 'blob',
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = docMetaMap[docId]?.name ?? `dokument-${docId}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    addToast({ message: t('student_dashboard.applications.toasts.download_failed'), type: 'error' })
  } finally {
    const next = new Set(downloadingIds.value)
    next.delete(docId)
    downloadingIds.value = next
  }
}

// ── Inline edit (supplement) ───────────────────────────────────────────────

const isEditing = ref(false)
const editingData = ref<Record<string, any>>({})
const isSubmitting = ref(false)

function startEditing() {
  // Pre-populate with current answers so the form is not blank
  editingData.value = { ...(application.value?.formData ?? {}) }
  isEditing.value = true
  // Scroll form into view
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

function cancelEditing() {
  isEditing.value = false
  editingData.value = {}
}

function handleEditSaveDraft(data: Record<string, any>) {
  // Local persist only — no network call needed mid-edit
  editingData.value = { ...data }
}

async function handleEditSubmit(data: Record<string, any>) {
  if (!application.value) return

  const schema = formSchema.value
  if (!schema?.fields?.length) {
    addToast({ message: t('student_dashboard.applications.toasts.submit_failed'), type: 'error' })
    return
  }

  // Validate required fields
  const errors: string[] = []
  schema.fields.forEach((field: any) => {
    const val = data[field.name]
    if (field.required && (!val || (Array.isArray(val) && val.length === 0))) {
      errors.push(t('student_dashboard.applications.errors.required_field', { field: field.label || field.name }))
    }
  })

  if (errors.length) {
    addToast({ message: errors[0], type: 'error' })
    return
  }

  // Resolve call_id and team_id from raw store model
  const raw = applicationsStore.currentApplication as any
  const callId = raw?.call_id ?? (application.value as any).callId ?? null
  const teamId = raw?.team_id ?? (application.value as any).teamId ?? null

  if (!callId || !teamId) {
    addToast({ message: t('student_dashboard.applications.toasts.submit_failed'), type: 'error' })
    return
  }

  isSubmitting.value = true

  try {
    const formPayload = serializeFormDataForApi(schema, data as Record<string, unknown>)

    const response = (await api.post('/submit-application', {
      call_id: Number(callId),
      team_id: Number(teamId),
      form_data: formPayload,
    })) as any

    addToast({ message: t('student_dashboard.applications.toasts.created'), type: 'success' })

    isEditing.value = false
    editingData.value = {}

    const currentId = (application.value as any).id
    const newId = response?.data?.id ?? response?.id

    if (newId && newId !== currentId) {
      // Backend created a new application record (e.g. supplement resubmit) — navigate
      await router.push(localePath(`/student/prihlasky/${newId}`))
    } else {
      // Same record updated — refetch in place so status badge & history refresh
      await applicationsStore.fetchApplicationById(currentId)
    }
  } catch (err: any) {
    const msg =
      err?.data?.message ?? err?.message ?? t('student_dashboard.applications.toasts.submit_failed')
    addToast({ message: msg, type: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

// ── Existing view helpers ──────────────────────────────────────────────────

const historyRows = computed(() => {
  const h = application.value?.history ?? []
  return [...h]
})

const supplementEntry = computed(() =>
  historyRows.value.find((r: any) => r.status === 'supplement') ?? null,
)

function formatDate(iso?: string): string {
  if (!iso) return '—'
  const parsedDate = iso.length === 10 ? new Date(`${iso}T00:00:00`) : new Date(iso)
  if (isNaN(parsedDate.getTime())) return iso

  return new Intl.DateTimeFormat('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(iso.length > 10 && { hour: '2-digit', minute: '2-digit' }),
  }).format(parsedDate)
}

function historyDotColor(status: string): string {
  switch (status) {
    case 'approved':   return 'bg-green-500'
    case 'evaluating': return 'bg-blue-500'
    case 'submitted':  return 'bg-emerald-500'
    case 'supplement': return 'bg-amber-500'
    case 'rejected':   return 'bg-red-500'
    default:           return 'bg-gray-400'
  }
}

function historyLabel(status: string): string {
  const labels: Record<string, string> = {
    draft:      'Draft',
    submitted:  'Podané',
    evaluating: 'V hodnotení',
    supplement: 'Vyžiadané doplnenie',
    approved:   'Schválené',
    rejected:   'Zamietnuté',
  }
  return labels[status] ?? status
}

function milestoneStatus(status: string): string {
  const labels: Record<string, string> = {
    completed:   t('student_dashboard.applications.detail.completed'),
    in_progress: t('student_dashboard.applications.detail.in_progress'),
    pending:     t('student_dashboard.applications.detail.pending'),
  }
  return labels[status] || status
}
</script>