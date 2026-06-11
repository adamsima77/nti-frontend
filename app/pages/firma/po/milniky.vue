<template>
  <div class="max-w-5xl mx-auto px-6 py-10">

    <div v-if="isLoading" class="flex justify-center py-20"><UiLoader /></div>

    <div v-else-if="!call" class="text-center py-20 text-gray-400">
      <Flag class="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p class="font-medium text-gray-500">Nemáte priradené žiadne zadanie</p>
    </div>

    <template v-else>
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-navy">Míľniky</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ call.name }}</p>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 mb-6 gap-1">
        <button v-for="tab in tabs" :key="tab.id"
          :class="[
            'flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap',
            activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700',
          ]"
          @click="activeTab = tab.id; onTabChange(tab.id)"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>

      <!-- ═══ TAB: ZOZNAM MÍĽNIKOV ═══ -->
      <div v-if="activeTab === 'list'" class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500">Plán míľnikov pre toto zadanie</p>
          <button
            class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            @click="openForm()"
          >
            <Plus class="w-4 h-4" /> Pridať míľnik
          </button>
        </div>

        <div v-if="milestonesLoading" class="text-center py-10 text-gray-400 text-sm">Načítavam...</div>
        <div v-else-if="!milestones.length" class="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-lg">
          <ListTodo class="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>Žiadne míľniky</p>
        </div>
        <div v-else class="space-y-2">
          <div v-for="item in milestones" :key="item.id"
            class="bg-white rounded-lg border border-gray-100 p-4 flex items-start gap-3">
            <div class="flex-1 min-w-0">
              <p class="font-medium text-navy">{{ item.name }}</p>
              <p v-if="item.description" class="text-xs text-gray-400 mt-0.5">{{ item.description }}</p>
              <p class="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Calendar class="w-3 h-3" /> {{ item.due_date ?? '—' }}
              </p>
              <!-- Komentáre (dôvody zamietnutia) -->
              <div v-if="item.comments?.length" class="mt-2 space-y-1">
                <div v-for="c in item.comments" :key="c.id"
                  class="text-xs bg-gray-50 text-gray-600 rounded px-2 py-1 border border-gray-200">
                  <span class="font-medium">{{ c.author }}:</span> {{ c.text }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <span :class="[
                'text-xs font-medium px-2 py-0.5 rounded-full',
                item.status === 'Schválené'  ? 'bg-green-100 text-green-700' :
                item.status === 'Zamietnuté' ? 'bg-red-100 text-red-700' :
                item.status === 'Dokončené'  ? 'bg-amber-100 text-amber-700' :
                item.status === 'V riešení'  ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-500'
              ]">{{ item.status }}</span>
              <button class="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition" @click="openForm(item)">
                <Pencil class="w-3.5 h-3.5" />
              </button>
              <button class="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition" @click="deleteMilestone(item.id)">
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ TAB: SCHVAĽOVANIE ═══ -->
      <div v-if="activeTab === 'approvals'" class="space-y-4">
        <p class="text-sm text-gray-500">Míľniky označené ako dokončené. Skontrolujte výstupy pred schválením.</p>

        <div v-if="deliverablesLoading" class="text-center py-10 text-gray-400 text-sm">Načítavam...</div>
        <div v-else-if="!deliverables.length" class="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-lg">
          <ClipboardCheck class="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>Žiadne dokončené míľniky na schválenie</p>
        </div>
        <div v-else class="space-y-2">
          <div v-for="d in deliverables" :key="d.id"
            class="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <p class="font-medium text-navy">{{ d.name }}</p>
              <p class="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Calendar class="w-3 h-3" /> Termín: {{ d.due_date ?? '—' }}
              </p>
            </div>
            <span :class="[
              'text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0',
              d.status === 'Schválené' ? 'bg-green-100 text-green-700' :
              d.status === 'Dokončené' ? 'bg-amber-100 text-amber-700' :
              'bg-gray-100 text-gray-500'
            ]">{{ d.status }}</span>
            <button
              class="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              @click="openDetail(d)"
            >
              <Paperclip class="w-4 h-4" /> Zobraziť výstupy
            </button>
          </div>
        </div>
      </div>

    </template>

    <!-- ═══ MODAL: Nový/upraviť míľnik ═══ -->
    <div v-if="formOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40" @click="formOpen = false" />
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 class="text-lg font-semibold text-navy">{{ form.id ? 'Upraviť míľnik' : 'Nový míľnik' }}</h3>
        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500">Názov *</label>
          <input v-model="form.name" type="text" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500">Popis *</label>
          <textarea v-model="form.description" rows="3" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
        </div>
        <div class="space-y-1">
          <label class="text-xs font-medium text-gray-500">Termín *</label>
          <input v-model="form.due_date" type="date" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <p v-if="formError" class="text-xs text-red-500">{{ formError }}</p>
        <div class="flex justify-end gap-2 pt-2">
          <button class="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition" @click="formOpen = false">Zrušiť</button>
          <button :disabled="formSaving"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 transition"
            @click="saveMilestone">
            {{ formSaving ? 'Ukladám...' : 'Uložiť' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: Detail míľnika (výstupy) ═══ -->
    <div v-if="detailOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40" @click="detailOpen = false" />
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">

        <!-- Hlavička -->
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-navy">{{ detailMilestone?.name }}</h3>
              <p class="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <Calendar class="w-3 h-3" /> Termín: {{ detailMilestone?.due_date ?? '—' }}
              </p>
            </div>
            <span :class="[
              'text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5',
              detailMilestone?.status === 'Schválené' ? 'bg-green-100 text-green-700' :
              detailMilestone?.status === 'Zamietnuté' ? 'bg-red-100 text-red-700' :
              detailMilestone?.status === 'Dokončené'  ? 'bg-amber-100 text-amber-700' :
              'bg-gray-100 text-gray-500'
            ]">{{ detailMilestone?.status }}</span>
          </div>
        </div>

        <!-- Prílohy + komentár -->
        <div class="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <p class="text-sm font-semibold text-gray-600 mb-2">Prílohy od tímu</p>
            <div v-if="docsLoading" class="text-sm text-gray-400">Načítavam...</div>
            <div v-else-if="!docs.length" class="flex flex-col items-center py-6 text-gray-400 bg-gray-50 rounded-lg">
              <Paperclip class="w-7 h-7 mb-2 opacity-30" />
              <p class="text-sm">Žiadne prílohy</p>
            </div>
            <ul v-else class="space-y-2">
              <li v-for="doc in docs" :key="doc.id" class="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                <Paperclip class="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-700 truncate">{{ doc.file_name }}</p>
                  <p class="text-xs text-gray-400">{{ doc.uploaded_at?.slice(0, 10) }}</p>
                </div>
                <a :href="`${apiBase}/calls/${call?.id}/milestones/${detailMilestone?.id}/documents/${doc.id}/download`"
                  target="_blank"
                  class="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition">
                  <Download class="w-3.5 h-3.5" /> Stiahnuť
                </a>
              </li>
            </ul>
          </div>

          <div v-if="detailMilestone?.status === 'Dokončené'" class="space-y-1">
            <label class="text-sm font-semibold text-gray-600">Komentár *</label>
            <textarea v-model="comment" rows="3"
              placeholder="Pridajte poznámku pre tím..."
              class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
          </div>
        </div>

        <!-- Akcie -->
        <div class="p-6 border-t border-gray-100 flex items-center justify-between gap-3">
          <button class="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition" @click="detailOpen = false">
            Zavrieť
          </button>
          <div v-if="detailMilestone?.status === 'Dokončené'" class="flex gap-2">
            <button class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition" @click="reject(detailMilestone)">
              Zamietnuť
            </button>
            <button class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition" @click="approve(detailMilestone)">
              Schváliť
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Flag, ListTodo, ClipboardCheck, Plus, Pencil, Trash2, Calendar, Paperclip, Download } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['partner'],
})

useHead({ title: 'Míľniky | NTI PO' })

const orgDashboard = useOrgDashboard()
await orgDashboard.load()
if (orgDashboard.myRole.value !== 'po') {
  await navigateTo(useLocalePath()('/firma'))
}

const api = useApi()
const toast = useToast()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

const call = ref<any>(null)
const isLoading = ref(true)

async function loadDashboard() {
  isLoading.value = true
  try {
    const res = await api.get('/po/dashboard') as any
    call.value = res.call ?? null
  } catch {
    call.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadDashboard()
  if (call.value) {
    loadMilestones()
    if (activeTab.value === 'approvals') loadDeliverables()
  }
})

// ── Tabs ──────────────────────────────────────────────────────────────────

type TabId = 'list' | 'approvals'
const route = useRoute()
const activeTab = ref<TabId>(route.query.tab === 'approvals' ? 'approvals' : 'list')
const tabs = [
  { id: 'list' as TabId,      label: 'Zoznam míľnikov', icon: ListTodo },
  { id: 'approvals' as TabId, label: 'Schvaľovanie',    icon: ClipboardCheck },
]

function onTabChange(id: TabId) {
  if (id === 'approvals') loadDeliverables()
}

// ── Zoznam míľnikov ───────────────────────────────────────────────────────

const milestones = ref<any[]>([])
const milestonesLoading = ref(false)

async function loadMilestones() {
  milestonesLoading.value = true
  try {
    const res = await api.get(`/calls/${call.value.id}/milestones`) as any
    milestones.value = res.milestones ?? []
  } finally {
    milestonesLoading.value = false
  }
}

// ── Formulár míľnika ──────────────────────────────────────────────────────

const formOpen = ref(false)
const formSaving = ref(false)
const formError = ref<string | null>(null)
const form = ref({ id: null as number | null, name: '', description: '', due_date: '' })

function openForm(item?: any) {
  form.value = item
    ? { id: item.id, name: item.name, description: item.description ?? '', due_date: item.due_date ?? '' }
    : { id: null, name: '', description: '', due_date: '' }
  formError.value = null
  formOpen.value = true
}

async function saveMilestone() {
  if (!form.value.name || !form.value.due_date) {
    formError.value = 'Vyplňte názov a termín.'
    return
  }
  formSaving.value = true
  formError.value = null
  try {
    const payload = { name: form.value.name, description: form.value.description || undefined, due_date: form.value.due_date }
    if (form.value.id) {
      const res = await api.patch(`/calls/${call.value.id}/milestones/${form.value.id}`, payload) as any
      const idx = milestones.value.findIndex(i => i.id === form.value.id)
      if (idx >= 0) milestones.value[idx] = res
    } else {
      const res = await api.post(`/calls/${call.value.id}/milestones`, payload) as any
      milestones.value.push(res)
    }
    formOpen.value = false
    toast.addToast({ message: 'Míľnik bol uložený.', type: 'success' })
  } catch (e: any) {
    formError.value = e?.data?.message ?? 'Chyba pri ukladaní.'
  } finally {
    formSaving.value = false
  }
}

async function deleteMilestone(id: number) {
  try {
    await api.delete(`/calls/${call.value.id}/milestones/${id}`)
    milestones.value = milestones.value.filter(i => i.id !== id)
    toast.addToast({ message: 'Míľnik bol odstránený.', type: 'success' })
  } catch {
    toast.addToast({ message: 'Nepodarilo sa odstrániť.', type: 'error' })
  }
}

// ── Schvaľovanie ──────────────────────────────────────────────────────────

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

// ── Detail / výstupy ──────────────────────────────────────────────────────

const detailOpen = ref(false)
const detailMilestone = ref<any>(null)
const docs = ref<any[]>([])
const docsLoading = ref(false)
const comment = ref('')

async function openDetail(milestone: any) {
  detailMilestone.value = milestone
  detailOpen.value = true
  comment.value = ''
  docs.value = []
  docsLoading.value = true
  try {
    const res = await api.get(`/calls/${call.value.id}/milestones/${milestone.id}/documents`) as any
    docs.value = res.documents ?? []
  } finally {
    docsLoading.value = false
  }
}

async function approve(item: any) {
  try {
    await api.patch(`/po/calls/${call.value.id}/milestone-approvals/${item.id}/approve`, {
      comment: comment.value.trim() || undefined,
    })
    detailOpen.value = false
    deliverables.value = deliverables.value.filter(d => d.id !== item.id)
    loadMilestones()
    toast.addToast({ message: 'Míľnik bol schválený.', type: 'success' })
  } catch {
    toast.addToast({ message: 'Schválenie zlyhalo.', type: 'error' })
  }
}

async function reject(item: any) {
  try {
    await api.patch(`/po/calls/${call.value.id}/milestone-approvals/${item.id}/reject`, {
      reason: comment.value.trim() || undefined,
    })
    detailOpen.value = false
    deliverables.value = deliverables.value.filter(d => d.id !== item.id)
    loadMilestones()
    toast.addToast({ message: 'Míľnik bol zamietnutý.', type: 'success' })
  } catch {
    toast.addToast({ message: 'Zamietnutie zlyhalo.', type: 'error' })
  }
}
</script>
