<!-- pages/mentor/projekty/[id].vue -->
<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <!-- Back -->
    <NuxtLink
      :to="localePath('/mentor/projekty')"
      class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors mb-6"
    >
      <ChevronLeft class="w-4 h-4" /> Späť na projekty
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
        <p class="text-gray-500 text-sm">{{ project.teamName }} · Priradený {{ project.assignedAt }}</p>
      </div>
      <button
        @click="showConsultationModal = true"
        class="shrink-0 inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
      >
        <Plus class="w-4 h-4" /> Nová konzultácia
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: milestones + consultations -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Milestones -->
        <div class="bg-white rounded-lg border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-navy flex items-center gap-2">
              <Flag class="w-4 h-4 text-purple-500" /> Míľniky projektu
            </h2>
            <span class="text-xs text-gray-400"
              >{{ completedMilestones }}/{{ project.milestones.length }} dokončených</span
            >
          </div>

          <div class="space-y-3">
            <div
              v-for="milestone in project.milestones"
              :key="milestone.id"
              class="border rounded-lg p-4 transition-all"
              :class="milestoneCardClass(milestone.status)"
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
                    <p class="text-xs text-gray-500 mt-0.5">Termín: {{ milestone.dueDate }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <UiStatusBadge :status="milestoneStatusValue(milestone.status)" />
                  <!-- Approve/reject actions for pending -->
                  <template v-if="milestone.status === 'pending_approval'">
                    <button
                      @click="handleMilestoneAction(milestone.id, 'approve')"
                      :disabled="milestoneLoading === milestone.id"
                      class="inline-flex items-center gap-1 px-2.5 py-1 bg-success-50 text-success-600 hover:bg-success-100 rounded text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <CheckCircle class="w-3.5 h-3.5" /> Schváliť
                    </button>
                    <button
                      @click="handleMilestoneAction(milestone.id, 'reject')"
                      :disabled="milestoneLoading === milestone.id"
                      class="inline-flex items-center gap-1 px-2.5 py-1 bg-danger-50 text-danger-600 hover:bg-danger-100 rounded text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <X class="w-3.5 h-3.5" /> Vrátiť
                    </button>
                  </template>
                </div>
              </div>

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

              <!-- Add comment inline -->
              <div class="ml-8 mt-2 flex gap-2">
                <input
                  v-model="newComment[milestone.id]"
                  type="text"
                  placeholder="Pridať komentár k míľniku..."
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
            <MessageSquare class="w-4 h-4 text-purple-500" /> Záznamy z konzultácií
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
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Úlohy</p>
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
              Zatiaľ žiadne konzultácie — pridajte prvý záznam.
            </div>
          </div>
        </div>
      </div>

      <!-- Right sidebar -->
      <div class="space-y-4">
        <!-- Team info -->
        <div class="bg-white rounded-lg border border-gray-100 p-5">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Tím</h3>
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
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Postup</h3>
          <div class="text-3xl font-bold text-navy mb-1">
            {{ Math.round((completedMilestones / project.milestones.length) * 100) }}%
          </div>
          <div class="bg-gray-100 rounded-full h-2 mb-2">
            <div
              class="h-2 rounded-full bg-purple-500"
              :style="{ width: `${(completedMilestones / project.milestones.length) * 100}%` }"
            />
          </div>
          <p class="text-xs text-gray-400">{{ completedMilestones }} z {{ project.milestones.length }} míľnikov</p>
        </div>

        <!-- Quick stats -->
        <div class="bg-white rounded-lg border border-gray-100 p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Štatistiky</h3>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Konzultácie</span>
            <span class="font-medium text-navy">{{ project.consultations.length }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Celkový čas</span>
            <span class="font-medium text-navy">{{ totalConsultationTime }} min</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Posledná konzultácia</span>
            <span class="font-medium text-navy">{{ project.consultations[0]?.date ?? '—' }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Program</span>
            <span class="font-medium text-navy">{{ project.program }}</span>
          </div>
        </div>

        <!-- PO info (Program B) -->
        <div
          v-if="project.productOwner"
          class="bg-purple-50 border border-purple-100 rounded-lg p-5"
        >
          <h3 class="text-sm font-semibold text-purple-800 mb-2">Product Owner</h3>
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
            {{ editingConsultation ? 'Upraviť konzultáciu' : 'Nová konzultácia' }}
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
              label: 'Názov / téma',
              placeholder: 'Napr. Review sprint 2, Architektúra databázy',
              required: true,
            }"
            v-model="consultationForm.title"
            :error="consultationErrors.title ?? undefined"
          />
          <div class="grid grid-cols-2 gap-4">
            <FormField
              :field="{ name: 'date', type: 'date', label: 'Dátum', required: true }"
              v-model="consultationForm.date"
              :error="consultationErrors.date ?? undefined"
            />
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Trvanie (min)</label>
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
              label: 'Typ konzultácie',
              options: [
                { value: 'online', label: 'Online (videohovor)' },
                { value: 'personal', label: 'Osobne' },
                { value: 'written', label: 'Písomná / e-mail' },
              ],
              required: true,
            }"
            v-model="consultationForm.type"
          />
          <FormField
            :field="{
              name: 'summary',
              type: 'textarea',
              label: 'Záznam / zhrnutie',
              placeholder: 'Čo sa riešilo, aké závery padli, na čom tím pracuje...',
              required: true,
            }"
            v-model="consultationForm.summary"
            :error="consultationErrors.summary ?? undefined"
          />

          <!-- Action items -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Úlohy pre tím</label>
            <div class="space-y-2">
              <div
                v-for="(_, i) in consultationForm.actionItems"
                :key="i"
                class="flex gap-2"
              >
                <input
                  v-model="consultationForm.actionItems[i]"
                  type="text"
                  placeholder="Napr. Dopracovať databázovú schému do piatku"
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
                <Plus class="w-4 h-4" /> Pridať úlohu
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
            Zrušiť
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
            {{ isSavingConsultation ? 'Ukladám...' : 'Uložiť záznam' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
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

const localePath = useLocalePath()
const route = useRoute()

useHead({ title: 'Detail projektu | NTI Mentor' })

const authStore = useAuthStore()

// TODO: remove when backend is available
if (!authStore.user) {
  authStore.user = {
    id: 10,
    email: 'mentor@nti.sk',
    first_name: 'Matej',
    last_name: 'Novotný',
    role: 'mentor',
  }
  authStore.token = 'mock-token'
}

// ── Mock project data ────────────────────────────────────────
const project = reactive({
  id: Number(route.params.projectId),
  name: 'AI chatbot pre zákaznícku podporu',
  teamName: 'AI Innovators',
  program: 'Program B',
  status: 'active',
  assignedAt: '01.03.2026',
  productOwner: { name: 'Peter Kováč', email: 'peter.kovac@techfirma.sk' },
  teamMembers: [
    { id: 1, name: 'Tomáš Horváth', role: 'Vedúci tímu' },
    { id: 2, name: 'Lucia Free', role: 'Backend developer' },
    { id: 3, name: 'Marek Blaho', role: 'Frontend developer' },
  ],
  milestones: [
    {
      id: 1,
      title: 'Analýza a návrh architektúry',
      dueDate: '20.03.2026',
      status: 'completed',
      description: 'Dokumentácia technickej architektúry, ERD diagram, API kontrakt.',
      comments: [
        {
          id: 1,
          author: 'Martin Kováč',
          date: '21.03.2026',
          text: 'Skvelá práca, architektúra je čistá. Odporúčam pridať rate limiting do API kontraktu.',
        },
        { id: 2, author: 'Tomáš Horváth', date: '21.03.2026', text: 'Zapracované, ďakujeme za feedback.' },
      ],
    },
    {
      id: 2,
      title: 'MVP — funkčný chatbot',
      dueDate: '30.04.2026',
      status: 'pending_approval',
      description: 'Základná funkcionalita chatbota s integráciou OpenAI API a jednoduchou webovou konzolou.',
      comments: [
        { id: 3, author: 'Tomáš Horváth', date: '01.04.2026', text: 'MVP je hotový, čakáme na schválenie mentora.' },
      ],
    },
    {
      id: 3,
      title: 'Integrácia so Salesforce CRM',
      dueDate: '31.05.2026',
      status: 'in_progress',
      description: 'Napojenie chatbota na zákaznícke dáta v Salesforce cez REST API.',
      comments: [],
    },
    {
      id: 4,
      title: 'Finálne odovzdanie',
      dueDate: '30.06.2026',
      status: 'pending',
      description: 'Produkčný deployment, dokumentácia, záverečná prezentácia.',
      comments: [],
    },
  ],
  consultations: [
    {
      id: 1,
      title: 'Kick-off konzultácia',
      date: '05.03.2026',
      duration: 90,
      type: 'Osobne',
      summary:
        'Úvodné stretnutie s tímom. Predstavenie projektu, definícia cieľov, rozdelenie rolí. Dohodnutý spôsob komunikácie (Slack + týždenné sync).',
      actionItems: ['Vytvoriť repo a nastaviť CI/CD pipeline', 'Pripraviť technickú špecifikáciu do 10.03.'],
    },
    {
      id: 2,
      title: 'Review architektúry',
      date: '22.03.2026',
      duration: 60,
      type: 'Online (videohovor)',
      summary:
        'Tím prezentoval návrh architektúry. Diskusia o voľbe LLM providera (OpenAI vs. self-hosted). Rozhodnutie: OpenAI API pre MVP, self-hosted pre produkciu.',
      actionItems: ['Pridať rate limiting do API dizajnu', 'Zdokumentovať fallback scenáre pre API výpadok'],
    },
    {
      id: 3,
      title: 'Sprint review #2',
      date: '01.04.2026',
      duration: 45,
      type: 'Online (videohovor)',
      summary:
        'Tím predviedol funkčnú demo verziu chatbota. Kvalita odpovedí je dobrá. Chýba handling edge-case otázok mimo scope. Odoslaný na schválenie míľnika.',
      actionItems: [
        'Otestovať edge cases a pridať fallback odpovede',
        'Pripraviť dokumentáciu pre Salesforce integráciu',
      ],
    },
  ],
})

// ── Computed ─────────────────────────────────────────────────
const completedMilestones = computed(() => project.milestones.filter((m) => m.status === 'completed').length)
const totalConsultationTime = computed(() => project.consultations.reduce((s, c) => s + c.duration, 0))

// ── Milestone helpers ─────────────────────────────────────────
const milestoneLoading = ref<number | null>(null)
const newComment = reactive<Record<number, string>>({})

const milestoneStatusValue = (status: string) =>
  ({
    completed: 'approved',
    pending_approval: 'pending',
    in_progress: 'active',
    pending: 'draft',
  })[status] ?? 'draft'

const milestoneCardClass = (status: string) =>
  ({
    completed: 'border-success-200 bg-success-50/30',
    pending_approval: 'border-warning-200 bg-warning-50/30',
    in_progress: 'border-blue-200 bg-blue-50/30',
    pending: 'border-gray-100 bg-white',
  })[status] ?? 'border-gray-100'

const handleMilestoneAction = async (milestoneId: number, action: 'approve' | 'reject') => {
  milestoneLoading.value = milestoneId
  try {
    // TODO: await api.patch(`/mentor/milestones/${milestoneId}`, { action })
    await new Promise((r) => setTimeout(r, 600))
    const m = project.milestones.find((m) => m.id === milestoneId)
    if (m) m.status = action === 'approve' ? 'completed' : 'in_progress'
  } finally {
    milestoneLoading.value = null
  }
}

const addComment = async (milestoneId: number) => {
  const text = newComment[milestoneId]?.trim()
  if (!text) return
  // TODO: await api.post(`/mentor/milestones/${milestoneId}/comments`, { text })
  const m = project.milestones.find((m) => m.id === milestoneId)
  if (m) {
    m.comments.push({
      id: Date.now(),
      author: 'Martin Kováč',
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
    type: c.type === 'Osobne' ? 'personal' : c.type === 'Online (videohovor)' ? 'online' : 'written',
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

const saveConsultation = async () => {
  if (!validateConsultation()) return
  isSavingConsultation.value = true
  consultationError.value = null
  try {
    // TODO: await api.post/put(`/mentor/projects/${project.id}/consultations`, consultationForm)
    await new Promise((r) => setTimeout(r, 700))
    const items = consultationForm.actionItems.filter((i) => i.trim())
    if (editingConsultation.value) {
      const idx = project.consultations.findIndex((c) => c.id === editingConsultation.value.id)
      if (idx !== -1) {
        project.consultations[idx] = {
          id: project.consultations[idx]!.id,
          title: consultationForm.title,
          date: consultationForm.date,
          duration: consultationForm.duration,
          type: typeLabel(consultationForm.type),
          summary: consultationForm.summary,
          actionItems: items,
        }
      }
    } else {
      project.consultations.unshift({
        id: Date.now(),
        title: consultationForm.title,
        date: consultationForm.date,
        duration: consultationForm.duration,
        type: typeLabel(consultationForm.type),
        summary: consultationForm.summary,
        actionItems: items,
      })
    }
    closeConsultationModal()
  } catch {
    consultationError.value = 'Nastala chyba pri ukladaní.'
  } finally {
    isSavingConsultation.value = false
  }
}
</script>
