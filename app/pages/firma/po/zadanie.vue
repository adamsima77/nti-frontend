<template>
  <div class="max-w-5xl mx-auto px-6 py-10">

    <div v-if="isLoading" class="space-y-4">
      <div class="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
      <div class="h-6 bg-gray-100 rounded w-1/4 animate-pulse" />
      <div class="h-48 bg-gray-100 rounded-lg animate-pulse" />
      <div class="h-48 bg-gray-100 rounded-lg animate-pulse" />
    </div>

    <div v-else-if="!task" class="text-center py-20 text-gray-400">
      <FileText class="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p class="font-medium text-gray-500">Nemáte priradené žiadne zadanie</p>
      <p class="text-sm mt-1">Kontaktujte NTI administrátora</p>
    </div>

    <!-- Edit mode -->
    <template v-else-if="editMode">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-navy mb-1">Upraviť zadanie</h1>
          <p class="text-gray-500 text-sm">{{ task.title }}</p>
        </div>
        <button
          class="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          @click="editMode = false"
        >
          Zrušiť
        </button>
      </div>
      <ZadanieForm
        :is-new="false"
        :initial-data="task"
        :can-delete="false"
        :hide-po="true"
        :hide-workflow="true"
        :update-endpoint="`/po/calls/${task.id}`"
        @saved="onSaved"
      />
    </template>

    <!-- Detail mode -->
    <template v-else>
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-2xl font-bold text-navy">{{ task.title }}</h1>
            <UiStatusBadge :status="task.rawStatus" />
          </div>
          <p class="text-gray-500 text-sm">{{ task.program }} · Vytvorené {{ task.createdAt }}</p>
        </div>
        <button
          class="inline-flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shrink-0"
          @click="editMode = true"
        >
          <Pencil class="w-4 h-4" /> Upraviť
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left column -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Popis -->
          <div class="bg-white rounded-lg border border-gray-100 p-6">
            <h2 class="text-base font-semibold text-navy mb-3 flex items-center gap-2">
              <FileText class="w-4 h-4 text-blue-600" />
              Popis zadania
            </h2>
            <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{{ task.description }}</p>
          </div>

          <!-- Technické detaily -->
          <div v-if="task.tech_spec || task.tech_tags.length || task.documents.length" class="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div class="p-6 border-b border-gray-50 bg-gray-50/50">
              <h2 class="text-base font-semibold text-navy flex items-center gap-2">
                <Code class="w-4 h-4 text-blue-600" />
                Technické detaily a podklady
              </h2>
            </div>
            <div class="p-6 space-y-8">
              <div v-if="task.tech_spec">
                <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{{ task.tech_spec }}</p>
              </div>
              <div v-if="task.tech_tags.length">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Tag class="w-3.5 h-3.5" />
                  Preferované technológie
                </h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in task.tech_tags"
                    :key="tag"
                    class="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              <div v-if="task.documents.length" class="pt-4 border-t border-gray-50">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText class="w-3.5 h-3.5" />
                  Prílohy
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    v-for="doc in task.documents"
                    :key="doc.id"
                    @click.prevent="downloadFile(doc)"
                    class="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group cursor-pointer"
                  >
                    <div class="w-8 h-8 rounded bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <FileText class="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-navy truncate">{{ doc.name }}</p>
                      <p class="text-[10px] text-gray-400 uppercase">Kliknite pre stiahnutie</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Míľniky -->
          <div v-if="milestones.length" class="bg-white rounded-lg border border-gray-100 p-6">
            <h2 class="text-base font-semibold text-navy mb-4 flex items-center gap-2">
              <Flag class="w-4 h-4 text-blue-600" />
              Míľniky zadania
            </h2>
            <div class="space-y-2">
              <div
                v-for="m in milestones"
                :key="m.id"
                class="flex items-start gap-3 p-3 rounded-lg border border-gray-100"
              >
                <div class="mt-0.5">
                  <div :class="[
                    'w-5 h-5 rounded-full flex items-center justify-center',
                    m.status === 'Schválené' ? 'bg-green-100' :
                    m.status === 'Dokončené' ? 'bg-amber-100' :
                    m.status === 'Zamietnuté' ? 'bg-red-100' :
                    m.status === 'V riešení'  ? 'bg-blue-100' : 'bg-gray-100'
                  ]">
                    <CheckCircle v-if="m.status === 'Schválené'" class="w-3.5 h-3.5 text-green-600" />
                    <CheckCircle v-else-if="m.status === 'Dokončené'" class="w-3.5 h-3.5 text-amber-500" />
                    <div v-else class="w-2 h-2 rounded-full" :class="
                      m.status === 'Zamietnuté' ? 'bg-red-400' :
                      m.status === 'V riešení'  ? 'bg-blue-400' : 'bg-gray-400'
                    " />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-navy">{{ m.name }}</p>
                  <p v-if="m.description" class="text-xs text-gray-400 mt-0.5">{{ m.description }}</p>
                  <p class="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Calendar class="w-3 h-3" />
                    {{ m.due_date ?? '—' }}
                  </p>
                </div>
                <span :class="[
                  'text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0',
                  m.status === 'Schválené'  ? 'bg-green-100 text-green-700' :
                  m.status === 'Dokončené'  ? 'bg-amber-100 text-amber-700' :
                  m.status === 'Zamietnuté' ? 'bg-red-100 text-red-700' :
                  m.status === 'V riešení'  ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-500'
                ]">
                  {{ m.status ?? 'Plánované' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Prihlášky -->
          <div class="bg-white rounded-lg border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-base font-semibold text-navy flex items-center gap-2">
                <Users class="w-4 h-4 text-blue-600" />
                Prihlášky tímov
              </h2>
              <span class="text-sm text-gray-400">{{ task.applications.length }} celkom</span>
            </div>
            <div class="space-y-3">
              <div
                v-for="app in task.applications"
                :key="app.id"
                class="border border-gray-100 rounded-lg p-4"
              >
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <p class="font-medium text-navy text-sm">{{ app.teamName }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">Podané {{ app.submittedAt }}</p>
                  </div>
                  <UiStatusBadge :status="app.status" />
                </div>
              </div>
              <p v-if="!task.applications.length" class="text-sm text-gray-400 text-center py-6">
                Žiadne prihlášky zatiaľ
              </p>
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div class="space-y-4">

          <!-- Rozpočet -->
          <div class="bg-white rounded-lg border border-gray-100 p-5">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Rozpočet</h3>
            <div class="text-3xl font-bold text-navy mb-1">{{ formatCurrency(task.budget) }}</div>
            <p class="text-xs text-gray-400 mb-4">celkový rozpočet</p>
            <div class="mt-3 pt-3 border-t border-gray-100 space-y-2">
              <div v-if="task.budget_type" class="flex justify-between text-sm">
                <span class="text-gray-500">Spôsob výplaty</span>
                <span class="font-medium text-navy">{{ budgetTypeLabel(task.budget_type) }}</span>
              </div>
            </div>
            <div v-if="task.budget" class="mt-3 pt-3 border-t border-gray-100">
              <p class="text-xs font-medium text-gray-400 mb-2">Odhadovaný rozpad</p>
              <div class="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p class="text-xs text-gray-400">Na tím</p>
                  <p class="text-xs font-semibold text-navy">{{ formatCurrency(task.budget) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400">NTI (10%)</p>
                  <p class="text-xs font-semibold text-navy">{{ formatCurrency(task.budget * 0.1) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400">Čistá odmena</p>
                  <p class="text-xs font-semibold text-navy">{{ formatCurrency(task.budget * 0.9) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Informácie -->
          <div class="bg-white rounded-lg border border-gray-100 p-5 space-y-3">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Informácie</h3>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Program</span>
              <span class="font-medium text-navy">{{ task.program }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Typ výzvy</span>
              <span class="font-medium text-navy">{{ task.callType || '—' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Začiatok prihlasovania</span>
              <span class="font-medium text-navy">{{ task.applicationStart || '—' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Deadline prihlášok</span>
              <span class="font-medium text-navy">{{ task.deadline || '—' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Začiatok projektu</span>
              <span class="font-medium text-navy">{{ task.projectStart || '—' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Koniec projektu</span>
              <span class="font-medium text-navy">{{ task.projectEnd || '—' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Organizácia</span>
              <span class="font-medium text-navy">{{ task.organization || '—' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Prihlášok</span>
              <span class="font-medium text-navy">{{ task.applications.length }}</span>
            </div>
          </div>

          <!-- Priradený tím -->
          <div v-if="task.assignedTeam" class="bg-blue-50 border border-blue-100 rounded-lg p-5">
            <h3 class="text-sm font-semibold text-blue-800 mb-2">Priradený tím</h3>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                <Users class="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p class="font-medium text-blue-900 text-sm">{{ task.assignedTeam.name }}</p>
                <p class="text-xs text-blue-600">{{ task.assignedTeam.membersCount }} členov</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FileText, Code, Tag, Users, Pencil, Flag, CheckCircle, Calendar } from 'lucide-vue-next'
import ZadanieForm from '~/components/ui/ZadanieForm.vue'
import { normalizeTaskStatus } from '~/composables/useTaskStatus'

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['partner'],
})

useHead({ title: 'Zadanie | NTI PO' })

const orgDashboard = useOrgDashboard()
await orgDashboard.load()
if (orgDashboard.myRole.value !== 'po') {
  await navigateTo(useLocalePath()('/firma'))
}

const api = useApi()
const { addToast } = useToast()

const task = ref<any>(null)
const milestones = ref<any[]>([])
const isLoading = ref(true)
const editMode = ref(false)

const formatDate = (val: string | null | undefined) =>
  val ? val.slice(0, 10).split('-').reverse().join('. ') : null

const toInputDate = (val: string | null | undefined) =>
  val ? val.slice(0, 10) : ''

const mapCallToTask = (call: any) => ({
  id: call.id,
  title: call.name,
  description: call.description ?? '',
  tech_spec: call.tech_spec ?? '',
  tech_tags: call.tech_tags ?? [],
  documents: call.documents ?? [],
  program: call.program?.name ?? call.program?.typeOfProgram?.name ?? '—',
  callType: call.call_type?.name ?? null,
  organization: call.organization?.name ?? null,
  status: normalizeTaskStatus(call.status?.name ?? 'Draft'),
  rawStatus: call.status?.name ?? 'Draft',
  createdAt: formatDate(call.created_at),
  applicationStart: formatDate(call.application_start),
  deadline: formatDate(call.application_deadline),
  projectStart: formatDate(call.project_start),
  projectEnd: formatDate(call.project_end),
  application_start: toInputDate(call.application_start),
  application_deadline: toInputDate(call.application_deadline),
  project_start: toInputDate(call.project_start),
  project_end: toInputDate(call.project_end),
  budget: call.budget ? Number(call.budget) : null,
  spent: Number(call.spent ?? 0),
  budget_type: call.budget_type ?? null,
  requirements: call.call_criteria?.map((c: any) => c.name) ?? [],
  po_name: [call.product_owner?.name, call.product_owner?.surname].filter(Boolean).join(' ') || '',
  po_email: call.product_owner?.email ?? '',
  applications: (call.applications ?? []).map((a: any) => ({
    id: a.id,
    teamName: a.team?.name ?? '—',
    submittedAt: a.submitted_at ? new Date(a.submitted_at).toLocaleDateString('sk-SK') : null,
    status: a.status?.name ?? '',
  })),
  assignedTeam: (() => {
    const a = (call.applications ?? []).find((a: any) =>
      ['Onboarding', 'Aktívny projekt', 'Ukončené'].includes(a.status?.name)
    )
    return a ? { name: a.team?.name ?? '—', membersCount: a.team?.members_count ?? 0 } : null
  })(),
})

onMounted(async () => {
  try {
    const dashboard = await api.get('/po/dashboard') as any
    const callId = dashboard?.call?.id
    if (!callId) { task.value = null; return }

    const res = await api.get(`/v1/admin/calls/${callId}`) as any
    const call = res?.data ?? res
    if (!call?.id) { task.value = null; return }
    task.value = mapCallToTask(call)
    await loadMilestones(call.id)
  } catch {
    task.value = null
  } finally {
    isLoading.value = false
  }
})

const loadMilestones = async (callId: number) => {
  try {
    const res = await api.get(`/calls/${callId}/milestones`) as any
    milestones.value = res.milestones ?? []
  } catch {}
}

async function onSaved() {
  editMode.value = false
  addToast({ message: 'Zadanie bolo uložené.', type: 'success' })
  isLoading.value = true
  try {
    const res = await api.get(`/v1/admin/calls/${task.value.id}`) as any
    const call = res?.data ?? res
    task.value = mapCallToTask(call)
    await loadMilestones(call.id)
  } finally {
    isLoading.value = false
  }
}

const formatCurrency = (val: number | null | undefined) =>
  typeof val === 'number'
    ? new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
    : '—'

const budgetTypeLabel = (type: string) =>
  ({ milestone: 'Po míľnikoch', monthly: 'Mesačne', completion: 'Po odovzdaní' })[type] ?? type ?? '—'

const budgetBarColor = (ratio: number) => {
  if (ratio >= 1) return 'bg-danger-500'
  if (ratio >= 0.8) return 'bg-warning-500'
  return 'bg-blue-500'
}

const downloadFile = async (doc: any) => {
  try {
    const response = await api.get(`/documents/${doc.id}/download`, { responseType: 'blob' }) as any
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', doc.name)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch {
    addToast({ message: 'Stiahnutie zlyhalo', type: 'error' })
  }
}
</script>
