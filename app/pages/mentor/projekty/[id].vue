<!-- pages/mentor/projekty/[id].vue -->
<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <div
      v-if="loading"
      class="mb-6 rounded-lg border border-gray-100 bg-white p-4 text-sm text-gray-500"
    >
      {{ t('mentor.detail.loading') }}
    </div>

    <div
      v-else-if="pageError"
      class="mb-6 rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700"
    >
      {{ pageError }}
    </div>

    <!-- Back -->
    <NuxtLink
      :to="localePath('/mentor/projekty')"
      class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors mb-6"
    >
      <ChevronLeft class="w-4 h-4" /> {{ t('mentor.detail.back') }}
    </NuxtLink>

    <!-- Project header -->
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h1 class="text-2xl font-bold text-navy">{{ project.name }}</h1>
          <UiStatusBadge :status="project.status" />
          <span
            class="text-xs px-2 py-0.5 rounded-full font-medium"
            :class="project.program === 'Program A' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'"
          >
            {{ project.program }}
          </span>
        </div>
        <p class="text-gray-500 text-sm">
          {{ project.teamName }} · {{ t('mentor.dashboard.assignedAt', { date: project.assignedAt }) }}
        </p>
      </div>
     
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: milestones + consultations -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Milestones -->
        <div class="bg-white rounded-lg border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-navy flex items-center gap-2">
              <Flag class="w-4 h-4 text-purple-500" /> {{ t('mentor.detail.milestones') }}
            </h2>
            <span class="text-xs text-gray-400"
              >{{ completedMilestones }}/{{ project.milestones.length }} {{ t('mentor.detail.completed') }}</span
            >
          </div>

          <div class="space-y-3">
            <div
              v-for="(milestone, milestoneIndex) in project.milestones"
              :key="milestone.id"
              class="border rounded-lg p-4 transition-all"
              :class="[
                milestoneCardClass(milestone.status),
                isMilestoneLocked(milestone, milestoneIndex) ? 'opacity-60' : '',
              ]"
            >
              <div class="flex items-start justify-between gap-3 mb-2">
                <div class="flex items-start gap-3">
                  <!-- Status icon -->
                  <div class="mt-0.5 shrink-0">
                    <CheckCircle
                      v-if="milestone.status === 'completed'"
                      class="w-5 h-5 text-success-500"
                    />
                    <Clock
                      v-else-if="milestone.status === 'pending_approval'"
                      class="w-5 h-5 text-warning-500"
                    />
                    <Circle
                      v-else
                      class="w-5 h-5 text-gray-300"
                    />
                  </div>
                  <div>
                    <p class="font-medium text-navy text-sm">{{ milestone.title }}</p>
                    <p class="text-xs text-gray-500 mt-0.5">
                      {{ t('mentor.detail.dueDateLabel', { date: milestone.dueDate }) }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <UiStatusBadge :status="milestoneStatusValue(milestone.status)" />
                  <template v-if="canReviewMilestone(milestone, milestoneIndex)">
                    <button
                      @click="handleMilestoneAction(milestone.id, 'approve')"
                      :disabled="milestoneLoading === milestone.id"
                      class="inline-flex items-center gap-1 px-2.5 py-1 bg-success-50 text-success-600 hover:bg-success-100 rounded text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <CheckCircle class="w-3.5 h-3.5" /> {{ t('mentor.detail.approve') }}
                    </button>
                    <button
                      @click="handleMilestoneAction(milestone.id, 'reject')"
                      :disabled="milestoneLoading === milestone.id"
                      class="inline-flex items-center gap-1 px-2.5 py-1 bg-danger-50 text-danger-600 hover:bg-danger-100 rounded text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <X class="w-3.5 h-3.5" /> {{ t('mentor.detail.reject') }}
                    </button>
                  </template>
                </div>
              </div>

              <p
                v-if="isMilestoneLocked(milestone, milestoneIndex)"
                class="ml-8 mt-2 text-xs text-gray-500"
              >
                {{ milestoneLockedMessage(milestone, milestoneIndex) }}
              </p>

              <!-- Description -->
              <p
                v-if="milestone.description"
                class="text-xs text-gray-500 ml-8 mb-2"
              >
                {{ milestone.description }}
              </p>

              <!-- Comments thread -->
              <div
                v-if="milestone.comments.length"
                class="ml-8 space-y-2 mt-2"
              >
                <div
                  v-for="comment in milestone.comments"
                  :key="comment.id"
                  class="flex gap-2"
                >
                  <div
                    class="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0"
                  >
                    {{ comment.author[0] }}
                  </div>
                  <div class="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                    <div class="flex items-center justify-between mb-0.5">
                      <span class="text-xs font-medium text-navy">{{ comment.author }}</span>
                      <span class="text-xs text-gray-400">{{ comment.date }}</span>
                    </div>
                    <p class="text-xs text-gray-600">{{ comment.text }}</p>
                  </div>
                </div>
              </div>

              <!-- Add comment inline (review / reject only) -->
              <div
                v-if="canReviewMilestone(milestone, milestoneIndex)"
                class="ml-8 mt-2 flex gap-2"
              >
                <input
                  v-model="newComment[milestone.id]"
                  type="text"
                  :placeholder="t('mentor.detail.commentPlaceholder')"
                  @keydown.enter.prevent="addComment(milestone.id)"
                  class="flex-1 px-3 py-1.5 rounded border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  @click="addComment(milestone.id)"
                  :disabled="!newComment[milestone.id]?.trim()"
                  class="px-2.5 py-1.5 bg-purple-50 text-purple-600 rounded text-xs font-medium hover:bg-purple-100 transition-colors disabled:opacity-40"
                >
                  <Send class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Consultation log -->
        <div class="bg-white rounded-lg border border-gray-100 p-6">
          <h2 class="text-base font-semibold text-navy flex items-center gap-2 mb-4">
            <MessageSquare class="w-4 h-4 text-purple-500" /> {{ t('mentor.detail.consultations') }}
          </h2>

          <div class="space-y-4">
            <div
              v-for="c in project.consultations"
              :key="c.id"
              class="border border-gray-100 rounded-lg p-4"
            >
              <div class="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p class="font-medium text-navy text-sm">{{ c.title }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ c.date }} · {{ c.duration }} min · {{ c.type }}</p>
                </div>
                <button
                  v-if="canManageConsultations"
                  @click="editConsultation(c)"
                  class="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Pencil class="w-4 h-4" />
                </button>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed mb-3">{{ c.summary }}</p>
              <div
                v-if="c.actionItems.length"
                class="space-y-1"
              >
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t('mentor.detail.tasks') }}</p>
                <ul class="space-y-1">
                  <li
                    v-for="item in c.actionItems"
                    :key="item"
                    class="flex items-start gap-2 text-xs text-gray-600"
                  >
                    <ArrowRight class="w-3 h-3 mt-0.5 text-purple-400 shrink-0" /> {{ item }}
                  </li>
                </ul>
              </div>
            </div>

              <div
                v-if="!project.consultations.length"
              class="text-center py-8 text-sm text-gray-400"
            >
                {{ t('mentor.detail.noConsultations') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Right sidebar -->
      <div class="space-y-4">
        <!-- Team info -->
        <div class="bg-white rounded-lg border border-gray-100 p-5">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{{ t('mentor.detail.team') }}</h3>
          <div class="space-y-2">
            <div
              v-for="member in project.teamMembers"
              :key="member.id"
              class="flex items-center gap-2"
            >
              <div
                class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0"
              >
                {{
                  member.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                }}
              </div>
              <div>
                <p class="text-sm font-medium text-navy">{{ member.name }}</p>
                <p class="text-xs text-gray-400">{{ member.role }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress card -->
        <div class="bg-white rounded-lg border border-gray-100 p-5">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{{ t('mentor.detail.progress') }}</h3>
          <div class="text-3xl font-bold text-navy mb-1">
            {{ Math.round((completedMilestones / project.milestones.length) * 100) }}%
          </div>
          <div class="bg-gray-100 rounded-full h-2 mb-2">
            <div
              class="h-2 rounded-full bg-purple-500"
              :style="{ width: `${(completedMilestones / project.milestones.length) * 100}%` }"
            />
          </div>
          <p class="text-xs text-gray-400">
            {{
              t('mentor.detail.milestonesOf', {
                completed: completedMilestones,
                total: project.milestones.length,
              })
            }}
          </p>
        </div>

        <!-- Quick stats -->
        <div class="bg-white rounded-lg border border-gray-100 p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">{{ t('mentor.detail.statsTitle') }}</h3>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">{{ t('mentor.detail.consultations') }}</span>
            <span class="font-medium text-navy">{{ project.consultations.length }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">{{ t('mentor.detail.totalTime') }}</span>
            <span class="font-medium text-navy">{{ totalConsultationTime }} min</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">{{ t('mentor.detail.lastConsultation') }}</span>
            <span class="font-medium text-navy">{{ project.consultations[0]?.date ?? '—' }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">{{ t('mentor.detail.program') }}</span>
            <span class="font-medium text-navy">{{ project.program }}</span>
          </div>
        </div>

        <!-- PO info (Program B) -->
        <div
          v-if="project.productOwner"
          class="bg-purple-50 border border-purple-100 rounded-lg p-5"
        >
          <h3 class="text-sm font-semibold text-purple-800 mb-2">{{ t('mentor.detail.productOwner') }}</h3>
          <p class="font-medium text-purple-900 text-sm">{{ project.productOwner.name }}</p>
          <p class="text-xs text-purple-600 mt-0.5">{{ project.productOwner.email }}</p>
        </div>
      </div>
    </div>

    <!-- ── New consultation modal ── -->
    <div
      v-if="showConsultationModal"
      class="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div
        class="absolute inset-0 bg-black/40"
        @click="closeConsultationModal"
      />
      <div class="relative bg-white rounded-xl shadow-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-semibold text-navy text-lg">
            {{ editingConsultation ? t('mentor.detail.editConsultation') : t('mentor.detail.newConsultationTitle') }}
          </h3>
          <button
            @click="closeConsultationModal"
            class="text-gray-400 hover:text-gray-600"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4">
          <FormField
            :field="{
              name: 'title',
              type: 'text',
              label: t('mentor.detail.topic'),
              placeholder: t('mentor.detail.topicPlaceholder'),
              required: true,
            }"
            v-model="consultationForm.title"
            :error="consultationErrors.title ?? undefined"
          />
          <div class="grid grid-cols-2 gap-4">
            <FormField
              :field="{ name: 'date', type: 'date', label: t('mentor.detail.date'), required: true }"
              v-model="consultationForm.date"
              :error="consultationErrors.date ?? undefined"
            />
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('mentor.detail.duration') }}</label>
              <input
                v-model.number="consultationForm.duration"
                type="number"
                min="1"
                placeholder="60"
                class="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>
          <FormField
            :field="{
              name: 'type',
              type: 'select',
              label: t('mentor.detail.type'),
              options: [
                { value: 'online', label: t('mentor.detail.typeOnline') },
                { value: 'personal', label: t('mentor.detail.typePersonal') },
                { value: 'written', label: t('mentor.detail.typeWritten') },
              ],
              required: true,
            }"
            v-model="consultationForm.type"
          />
          <FormField
            :field="{
              name: 'summary',
              type: 'textarea',
              label: t('mentor.detail.record'),
              placeholder: t('mentor.detail.recordPlaceholder'),
              required: true,
            }"
            v-model="consultationForm.summary"
            :error="consultationErrors.summary ?? undefined"
          />

          <!-- Action items -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('mentor.detail.tasks') }}</label>
            <div class="space-y-2">
              <div
                v-for="(_, i) in consultationForm.actionItems"
                :key="i"
                class="flex gap-2"
              >
                <input
                  v-model="consultationForm.actionItems[i]"
                  type="text"
                  :placeholder="t('mentor.detail.taskPlaceholder')"
                  class="flex-1 px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  type="button"
                  @click="consultationForm.actionItems.splice(i, 1)"
                  class="text-gray-400 hover:text-danger-500"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                @click="consultationForm.actionItems.push('')"
                class="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800"
              >
                <Plus class="w-4 h-4" /> {{ t('mentor.detail.addTask') }}
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="consultationError"
          class="mt-4 bg-danger-50 border border-danger-200 text-danger-700 px-3 py-2 rounded text-sm flex items-center gap-2"
        >
          <AlertCircle class="w-4 h-4 shrink-0" /> {{ consultationError }}
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="closeConsultationModal"
            class="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            {{ t('mentor.detail.cancel') }}
          </button>
          <button
            @click="saveConsultation"
            :disabled="isSavingConsultation"
            class="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg
              v-if="isSavingConsultation"
              class="animate-spin w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
              />
            </svg>
            {{ isSavingConsultation ? t('mentor.detail.saving') : t('mentor.detail.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  ChevronLeft,
  Flag,
  MessageSquare,
  Plus,
  CheckCircle,
  Clock,
  Circle,
  X,
  Send,
  Pencil,
  ArrowRight,
  AlertCircle,
  Users,
} from 'lucide-vue-next'
import type { Consultation, MentorProject, Milestone, MilestoneComment } from '../../../types/mentor'
import { useMentorDashboard } from '../../../composables/useMentorDashboard'

definePageMeta({
  layout: 'portal',
})

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const api = useApi()
const { addToast } = useToast()
const authStore = useAuthStore()

type MentorProjectDetail = MentorProject & {
  productOwner?: { name: string; email?: string | null } | null
  teamMembers?: Array<{ id: number; name: string; role: string }>
  consultations: Consultation[]
  milestones: Array<Milestone & { comments: MilestoneComment[] }>
}

useHead({ title: t('mentor.detail.pageTitle') })

const project = reactive<MentorProjectDetail>({
  id: Number(route.params.id),
  name: '',
  teamName: '',
  program: '',
  status: 'draft',
  assignedAt: '',
  productOwner: null,
  teamMembers: [],
  milestones: [],
  consultations: [],
})

const loading = ref(false)
const pageError = ref<string | null>(null)
const {
  projects: mentorProjects,
  fetchProjects,
  fetchDashboard,
  fetchMilestones,
  fetchConsultations,
  updateMilestoneStatus,
} = useMentorDashboard()

const loadProject = async () => {
  loading.value = true
  pageError.value = null

  try {
    if (!mentorProjects.value.length) {
      await fetchProjects()
    }

    const found = mentorProjects.value.find((item: MentorProject) => item.id === project.id)
    if (!found) {
      pageError.value = t('mentor.detail.errors.notFound')
      return
    }

    Object.assign(project, {
      ...found,
      productOwner: found.productOwner ?? null,
      teamMembers: found.teamMembers ?? [],
      milestones: found.milestones ?? [],
      consultations: [],
    })

    const [milestones, consultations] = await Promise.all([
      fetchMilestones(project.id),
      fetchConsultations(project.id),
    ])

    if (milestones) project.milestones = milestones as MentorProjectDetail['milestones']
    if (consultations) project.consultations = consultations
  } catch {
    pageError.value = t('mentor.detail.errors.loadFailed')
  } finally {
    loading.value = false
  }
}

onMounted(loadProject)

// ── Computed ─────────────────────────────────────────────────
const completedMilestones = computed(() => project.milestones.filter((m) => m.status === 'completed').length)
const totalConsultationTime = computed(() => project.consultations.reduce((sum, consultation) => sum + consultation.duration, 0))
const canManageConsultations = computed(() => authStore.hasPermission('mentorship.edit_any') || authStore.hasPermission('mentorship.edit_own'))

// ── Milestone helpers ─────────────────────────────────────────
const milestoneLoading = ref<number | null>(null)
const newComment = reactive<Record<number, string>>({})

const milestoneStatusValue = (status: string) =>
  ({
    completed: 'approved',
    pending_approval: 'pending_approval',
    in_progress: 'active',
    rejected: 'rejected',
    pending: 'draft',
  })[status] ?? 'draft'

const priorMilestonesIncomplete = (index: number) =>
  project.milestones.slice(0, index).some((m) => m.status !== 'completed')

const canReviewMilestone = (milestone: { status: string }, index: number) =>
  milestone.status === 'pending_approval' && !priorMilestonesIncomplete(index)

const isMilestoneLocked = (milestone: { status: string }, index: number) => {
  if (milestone.status === 'completed') return false
  if (canReviewMilestone(milestone, index)) return false
  return true
}

const milestoneLockedMessage = (milestone: { status: string }, index: number) => {
  if (priorMilestonesIncomplete(index)) return t('mentor.detail.lockedPrevious')
  if (milestone.status === 'in_progress') return t('mentor.detail.lockedInProgress')
  if (milestone.status === 'pending') return t('mentor.detail.lockedDraft')
  return t('mentor.detail.lockedDefault')
}

const milestoneCardClass = (status: string) =>
  ({
    completed: 'border-success-200 bg-success-50/30',
    pending_approval: 'border-warning-200 bg-warning-50/30',
    in_progress: 'border-blue-200 bg-blue-50/30',
    rejected: 'border-danger-200 bg-danger-50/30',
    pending: 'border-gray-100 bg-white',
  })[status] ?? 'border-gray-100'

const handleMilestoneAction = async (milestoneId: number, action: 'approve' | 'reject') => {
  if (action === 'reject') {
    const comment = newComment[milestoneId]?.trim() ?? ''
    if (comment.length < 20) {
      addToast({ message: t('mentor.detail.errors.rejectCommentRequired'), type: 'error' })
      return
    }
  }

  milestoneLoading.value = milestoneId
  try {
    await updateMilestoneStatus(
      project.id,
      milestoneId,
      action === 'approve' ? 'completed' : 'rejected',
      action === 'reject' ? newComment[milestoneId]?.trim() : undefined,
    )
    if (action === 'reject') newComment[milestoneId] = ''
    // Keep dashboard + project list in sync (pending actions, pendingMilestone flag, stats).
    await Promise.all([fetchProjects(), fetchDashboard()])
    await loadProject()
  } finally {
    milestoneLoading.value = null
  }
}

const addComment = async (milestoneId: number) => {
  const text = newComment[milestoneId]?.trim()
  if (!text) return
  const m = project.milestones.find((m) => m.id === milestoneId)
  if (m) {
    m.comments.push({
      id: Date.now(),
      author: 'Mentor',
      date: new Date().toLocaleDateString('sk-SK'),
      text,
    })
  }
  newComment[milestoneId] = ''
}

// ── Consultation modal ────────────────────────────────────────
const showConsultationModal = ref(false)
const isSavingConsultation = ref(false)
const consultationError = ref<string | null>(null)
const editingConsultation = ref<any>(null)

const today = new Date().toISOString().split('T')[0] ?? ''

const consultationForm = reactive({
  title: '',
  date: today,
  duration: 60 as number,
  type: 'online',
  summary: '',
  actionItems: [''] as string[],
})

const consultationErrors = reactive<Record<string, string | null>>({})

const editConsultation = (c: any) => {
  editingConsultation.value = c
  Object.assign(consultationForm, {
    title: c.title,
    date: c.date,
    duration: c.duration,
    type: normalizeConsultationType(c.type),
    summary: c.summary,
    actionItems: [...c.actionItems, ''],
  })
  showConsultationModal.value = true
}

const closeConsultationModal = () => {
  showConsultationModal.value = false
  editingConsultation.value = null
  consultationError.value = null
  Object.assign(consultationForm, {
    title: '',
    date: today,
    duration: 60,
    type: 'online',
    summary: '',
    actionItems: [''],
  })
}

const validateConsultation = () => {
  consultationErrors.title = consultationForm.title ? null : 'Názov je povinný'
  consultationErrors.date = consultationForm.date ? null : 'Dátum je povinný'
  consultationErrors.summary = consultationForm.summary ? null : 'Záznam je povinný'
  return !Object.values(consultationErrors).some(Boolean)
}

const typeLabel = (type: string) =>
  ({ online: 'Online (videohovor)', personal: 'Osobne', written: 'Písomná / e-mail' })[type] ?? type

const normalizeConsultationType = (type: string) =>
  ({
    online: 'online',
    personal: 'personal',
    written: 'written',
    'Online (videohovor)': 'online',
    Osobne: 'personal',
    'Písomná / e-mail': 'written',
  })[type] ?? 'written'

const saveConsultation = async () => {
  if (!validateConsultation()) return
  isSavingConsultation.value = true
  consultationError.value = null
  try {
    const items = consultationForm.actionItems.filter((i) => i.trim())
    await api.post(`/mentor/projects/${project.id}/consultations`, {
      note: [
        consultationForm.title.trim(),
        `Dátum: ${consultationForm.date}`,
        `Typ: ${typeLabel(consultationForm.type)}`,
        `Trvanie: ${consultationForm.duration} min`,
        consultationForm.summary.trim(),
        items.length ? `Úlohy: ${items.join('; ')}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    })
    await loadProject()
    closeConsultationModal()
  } catch {
    consultationError.value = t('mentor.detail.errors.saveFailed')
  } finally {
    isSavingConsultation.value = false
  }
}
</script>
