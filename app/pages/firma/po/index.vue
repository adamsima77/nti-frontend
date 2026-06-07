<template>
  <div class="max-w-5xl mx-auto px-6 py-10">

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <UiLoader />
    </div>

    <!-- No call assigned -->
    <div v-else-if="!call" class="text-center py-20 text-gray-400">
      <Briefcase class="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p class="font-medium text-gray-500">Nemáte priradené žiadne zadanie</p>
      <p class="text-sm mt-1">Kontaktujte NTI administrátora</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-2 mb-1">
          <h1 class="text-3xl font-bold text-navy">{{ call.name }}</h1>
          <UiStatusBadge :status="call.status ?? ''" />
        </div>
        <p class="text-gray-500 text-sm">{{ call.organization }} · {{ call.program }}</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow-sm border-l-4 border-blue-600 p-5">
          <div class="text-3xl font-bold text-blue-600">{{ stats.total_applications }}</div>
          <p class="text-sm text-gray-500 mt-1">Prihlášky</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm border-l-4 border-green-600 p-5">
          <div class="text-3xl font-bold text-green-600">{{ stats.open_milestones }}</div>
          <p class="text-sm text-gray-500 mt-1">Otvorené úlohy</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm border-l-4 border-purple-500 p-5">
          <div class="text-3xl font-bold text-purple-600">{{ stats.done_milestones }}</div>
          <p class="text-sm text-gray-500 mt-1">Dokončené</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm border-l-4 border-amber-500 p-5">
          <div class="text-3xl font-bold text-amber-600">{{ stats.pending_approvals }}</div>
          <p class="text-sm text-gray-500 mt-1">Čakajú na schválenie</p>
        </div>
      </div>

      <!-- Assigned team info -->
      <div v-if="assignedApplication" class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <Users class="w-5 h-5 text-green-600 flex-shrink-0" />
        <div>
          <p class="text-sm font-semibold text-green-800">Priradený tím: {{ assignedApplication.team?.name }}</p>
          <p class="text-xs text-green-600 mt-0.5">
            {{ assignedApplication.team?.members?.map((m: any) => m.name).join(', ') }}
          </p>
        </div>
        <UiStatusBadge :status="assignedApplication.status ?? ''" class="ml-auto" />
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 mb-6 gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="[
            'flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap',
            activeTab === tab.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          ]"
          @click="activeTab = tab.id; loadTab(tab.id)"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>

      <!-- ═══ TAB: BACKLOG ═══ -->
      <div v-if="activeTab === 'backlog'" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-navy">Backlog úloh</h2>
          <button
            class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            @click="openBacklogForm()"
          >
            <Plus class="w-4 h-4" />
            Pridať úlohu
          </button>
        </div>

        <div v-if="backlogLoading" class="text-center py-10 text-gray-400 text-sm">Načítavam...</div>

        <div v-else-if="!backlog.length" class="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-lg">
          <ListTodo class="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>Žiadne úlohy v backlogu</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="item in backlog"
            :key="item.id"
            class="bg-white rounded-lg border border-gray-100 p-4 flex items-start gap-3"
          >
            <div class="flex-1 min-w-0">
              <p class="font-medium text-navy">{{ item.name }}</p>
              <p v-if="item.description" class="text-xs text-gray-400 mt-0.5">{{ item.description }}</p>
              <p class="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Calendar class="w-3 h-3" />
                Termín: {{ item.due_date ?? '—' }}
              </p>
            </div>
            <div class="flex gap-1 flex-shrink-0">
              <button
                class="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                @click="openBacklogForm(item)"
              >
                <Pencil class="w-3.5 h-3.5" />
              </button>
              <button
                class="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                @click="deleteBacklogItem(item.id)"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Backlog form modal -->
        <div v-if="backlogFormOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" @click="backlogFormOpen = false" />
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 class="text-lg font-semibold text-navy">{{ backlogForm.id ? 'Upraviť úlohu' : 'Nová úloha' }}</h3>
            <div class="space-y-1">
              <label class="text-xs font-medium text-gray-500">Názov *</label>
              <input v-model="backlogForm.name" type="text" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-medium text-gray-500">Popis</label>
              <textarea v-model="backlogForm.description" rows="3" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-medium text-gray-500">Termín *</label>
              <input v-model="backlogForm.due_date" type="date" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <p v-if="backlogError" class="text-xs text-red-500">{{ backlogError }}</p>
            <div class="flex justify-end gap-2 pt-2">
              <button class="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition" @click="backlogFormOpen = false">Zrušiť</button>
              <button
                :disabled="backlogSaving"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 transition"
                @click="saveBacklogItem"
              >
                {{ backlogSaving ? 'Ukladám...' : 'Uložiť' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ TAB: VÝSTUPY A PREZENTÁCIE ═══ -->
      <div v-if="activeTab === 'documents'" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-navy">Výstupy a prezentácie</h2>
          <label class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition cursor-pointer">
            <Upload class="w-4 h-4" />
            Nahrať súbor
            <input type="file" class="hidden" @change="uploadDocument" />
          </label>
        </div>

        <div v-if="docsLoading" class="text-center py-10 text-gray-400 text-sm">Načítavam...</div>

        <div v-else-if="!documents.length" class="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-lg">
          <FileText class="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>Žiadne dokumenty</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="doc in documents"
            :key="doc.id"
            class="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-3"
          >
            <FileText class="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-navy truncate">{{ doc.name }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(doc.uploaded_at) }}</p>
            </div>
          </div>
        </div>

        <p v-if="uploadError" class="text-xs text-red-500">{{ uploadError }}</p>
        <p v-if="uploading" class="text-xs text-gray-400">Nahrávam súbor...</p>
      </div>

      <!-- ═══ TAB: SCHVAĽOVANIE MÍĽNIKOV ═══ -->
      <div v-if="activeTab === 'deliverables'" class="space-y-4">
        <h2 class="text-lg font-semibold text-navy">Schvaľovanie míľnikov</h2>
        <p class="text-sm text-gray-500">Míľniky ktoré tím označil ako dokončené. Po overení ich môžete schváliť.</p>

        <div v-if="deliverablesLoading" class="text-center py-10 text-gray-400 text-sm">Načítavam...</div>

        <div v-else-if="!deliverables.length" class="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-lg">
          <ClipboardCheck class="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>Žiadne dokončené míľniky na schválenie</p>
          <p class="text-xs mt-1">Zobrazia sa tu míľniky, ktoré tím označil ako dokončené</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="d in deliverables"
            :key="d.id"
            class="bg-white rounded-lg border border-gray-100 p-4 flex items-start gap-3"
          >
            <div class="flex-1 min-w-0">
              <p class="font-medium text-navy">{{ d.name }}</p>
              <p v-if="d.comments" class="text-xs text-gray-400 mt-0.5">{{ d.comments }}</p>
              <p class="text-xs text-gray-400 mt-1">Termín: {{ d.deadline ?? '—' }}</p>
            </div>
            <div class="flex-shrink-0 flex items-center gap-2">
              <span
                :class="[
                  'text-xs font-medium px-2 py-0.5 rounded-full',
                  d.status === 'Schválené' ? 'bg-green-100 text-green-700' :
                  d.status === 'Dokončené' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-500'
                ]"
              >
                {{ d.status }}
              </span>
              <button
                v-if="d.status === 'Dokončené'"
                class="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                @click="approveDeliverable(d)"
              >
                Schváliť
              </button>
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Briefcase, Users, Plus, Pencil, Trash2, Calendar,
  ListTodo, FileText, Upload, ClipboardCheck,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['partner'],
})

useHead({ title: 'Product Owner | NTI Firma' })

const api = useApi()
const toast = useToast()

// ── State ──────────────────────────────────────────────────────────────────

const isLoading = ref(true)
const call = ref<any>(null)
const assignedApplication = ref<any>(null)
const stats = ref({ total_applications: 0, open_milestones: 0, done_milestones: 0, pending_approvals: 0 })

const activeTab = ref<'backlog' | 'documents' | 'deliverables'>('backlog')

const tabs: { id: 'backlog' | 'documents' | 'deliverables'; label: string; icon: any }[] = [
  { id: 'backlog',      label: 'Backlog',                  icon: ListTodo },
  { id: 'documents',    label: 'Výstupy a prezentácie',    icon: FileText },
  { id: 'deliverables', label: 'Schvaľovanie míľnikov',    icon: ClipboardCheck },
]

// ── Dashboard load ─────────────────────────────────────────────────────────

async function loadDashboard() {
  isLoading.value = true
  try {
    const res = await api.get('/po/dashboard') as any
    call.value = res.call ?? null
    assignedApplication.value = res.assigned_application ?? null
    stats.value = res.stats ?? stats.value
    if (call.value) await loadBacklog()
  } catch {
    call.value = null
  } finally {
    isLoading.value = false
  }
}

function loadTab(id: 'backlog' | 'documents' | 'deliverables') {
  if (!call.value) return
  if (id === 'backlog') loadBacklog()
  if (id === 'documents') loadDocuments()
  if (id === 'deliverables') loadDeliverables()
}

// ── Backlog ────────────────────────────────────────────────────────────────

const backlog = ref<any[]>([])
const backlogLoading = ref(false)
const backlogFormOpen = ref(false)
const backlogSaving = ref(false)
const backlogError = ref<string | null>(null)
const backlogForm = ref({ id: null as number | null, name: '', description: '', due_date: '' })

async function loadBacklog() {
  backlogLoading.value = true
  try {
    const res = await api.get(`/po/calls/${call.value.id}/backlog`) as any
    backlog.value = res.backlog ?? []
  } finally {
    backlogLoading.value = false
  }
}

function openBacklogForm(item?: any) {
  backlogForm.value = item
    ? { id: item.id, name: item.name, description: item.description ?? '', due_date: item.due_date ?? '' }
    : { id: null, name: '', description: '', due_date: '' }
  backlogError.value = null
  backlogFormOpen.value = true
}

async function saveBacklogItem() {
  if (!backlogForm.value.name || !backlogForm.value.due_date) {
    backlogError.value = 'Vyplňte názov a termín.'
    return
  }
  backlogSaving.value = true
  backlogError.value = null
  try {
    const payload = {
      name: backlogForm.value.name,
      description: backlogForm.value.description || undefined,
      due_date: backlogForm.value.due_date,
    }
    if (backlogForm.value.id) {
      const res = await api.patch(`/po/calls/${call.value.id}/backlog/${backlogForm.value.id}`, payload) as any
      const idx = backlog.value.findIndex(i => i.id === backlogForm.value.id)
      if (idx >= 0) backlog.value[idx] = res
    } else {
      const res = await api.post(`/po/calls/${call.value.id}/backlog`, payload) as any
      backlog.value.push(res)
    }
    backlogFormOpen.value = false
    toast.addToast({ message: 'Úloha bola uložená.', type: 'success' })
  } catch (e: any) {
    backlogError.value = e?.data?.message ?? 'Chyba pri ukladaní.'
  } finally {
    backlogSaving.value = false
  }
}

async function deleteBacklogItem(id: number) {
  try {
    await api.delete(`/po/calls/${call.value.id}/backlog/${id}`)
    backlog.value = backlog.value.filter(i => i.id !== id)
    toast.addToast({ message: 'Úloha bola odstránená.', type: 'success' })
  } catch {
    toast.addToast({ message: 'Nepodarilo sa odstrániť úlohu.', type: 'error' })
  }
}

// ── Documents ──────────────────────────────────────────────────────────────

const documents = ref<any[]>([])
const docsLoading = ref(false)
const uploading = ref(false)
const uploadError = ref<string | null>(null)

async function loadDocuments() {
  docsLoading.value = true
  try {
    const res = await api.get(`/po/calls/${call.value.id}/documents`) as any
    documents.value = res.documents ?? []
  } finally {
    docsLoading.value = false
  }
}

async function uploadDocument(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  uploadError.value = null
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post(`/po/calls/${call.value.id}/documents`, formData) as any
    documents.value.push(res)
    toast.addToast({ message: 'Dokument bol nahraný.', type: 'success' })
  } catch (e: any) {
    uploadError.value = e?.data?.message ?? 'Nahrávanie zlyhalo.'
  } finally {
    uploading.value = false
  }
}

// ── Deliverables ───────────────────────────────────────────────────────────

const deliverables = ref<any[]>([])
const deliverablesLoading = ref(false)

async function loadDeliverables() {
  deliverablesLoading.value = true
  try {
    const res = await api.get(`/po/calls/${call.value.id}/milestone-approvals`) as any
    deliverables.value = res.milestones ?? []
  } finally {
    deliverablesLoading.value = false
  }
}

async function approveDeliverable(item: any) {
  try {
    await api.patch(`/po/calls/${call.value.id}/milestone-approvals/${item.id}/approve`)
    item.status = 'Schválené'
    toast.addToast({ message: 'Míľnik bol schválený.', type: 'success' })
  } catch {
    toast.addToast({ message: 'Schválenie zlyhalo.', type: 'error' })
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('sk-SK')
}

onMounted(loadDashboard)
</script>
