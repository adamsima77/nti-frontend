<!-- pages/firma/zadania/[id].vue -->
<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <!-- Back -->
    <NuxtLink
      to="/firma/zadania"
      class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors mb-6"
    >
      <ChevronLeft class="w-4 h-4" />
      Späť na zadania
    </NuxtLink>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-4">
      <div class="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
      <div class="h-6 bg-gray-100 rounded w-1/4 animate-pulse" />
      <div class="h-48 bg-gray-100 rounded-lg animate-pulse" />
      <div class="h-48 bg-gray-100 rounded-lg animate-pulse" />
    </div>
 
    <!-- Not found -->
    <div
      v-else-if="!task"
      class="text-center py-20 text-gray-400"
    >
      <p class="text-lg font-medium">Zadanie sa nenašlo</p>
      <NuxtLink
        to="/firma/zadania"
        class="text-sm text-blue-600 hover:underline mt-2 inline-block"
      >
        Späť na zoznam
      </NuxtLink>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-2xl font-bold text-navy">{{ task.title }}</h1>
            <UiStatusBadge :status="task.status" :label="task.rawStatus" />
          </div>
          <p class="text-gray-500 text-sm">{{ task.program }} · Vytvorené {{ task.createdAt }}</p>
        </div>
        <div class="flex gap-2 shrink-0">
          <NuxtLink
            v-if="canEditTask"
            :to="`/firma/zadania/${task.id}/edit`"
            class="inline-flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Pencil class="w-4 h-4" />
            Upraviť
          </NuxtLink>
          <button
            v-if="canEditTask && task.status === 'draft'"
            @click="confirmPublish"
            class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Send class="w-4 h-4" />
            Odoslať na schválenie
          </button>
        </div>
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
              <!-- Popis riešenia -->
              <div v-if="task.tech_spec">
                <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {{ task.tech_spec }}
                </p>
              </div>

              <!-- Tech tagy -->
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

              <!-- Prílohy -->
              <div v-if="task.documents.length" class="pt-4 border-t border-gray-50">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText class="w-3.5 h-3.5" />
                  Prílohy
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    v-for="doc in task.documents"
                    :key="doc.id"
                    type="button"
                    @click="downloadFile(doc)"
                    class="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
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
 
          <!-- Product Owner -->
          <div v-if="task.po_name || task.po_email" class="bg-white rounded-lg border border-gray-100 p-6">
            <h2 class="text-base font-semibold text-navy mb-4 flex items-center gap-2">
              <UserCircle class="w-4 h-4 text-blue-600" />
              Product Owner
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-if="task.po_name">
                <p class="text-xs text-gray-400 mb-0.5">Meno</p>
                <p class="text-sm font-medium text-navy">{{ task.po_name }}</p>
              </div>
              <div v-if="task.po_position">
                <p class="text-xs text-gray-400 mb-0.5">Pozícia</p>
                <p class="text-sm font-medium text-navy">{{ task.po_position }}</p>
              </div>
              <div v-if="task.po_email">
                <p class="text-xs text-gray-400 mb-0.5">E-mail</p>
                <a :href="`mailto:${task.po_email}`" class="text-sm font-medium text-blue-600 hover:underline">{{ task.po_email }}</a>
              </div>
              <div v-if="task.po_phone">
                <p class="text-xs text-gray-400 mb-0.5">Telefón</p>
                <a :href="`tel:${task.po_phone}`" class="text-sm font-medium text-blue-600 hover:underline">{{ task.po_phone }}</a>
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
                <NuxtLink
                  :to="`/firma/prihlasky/${app.id}`"
                  class="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                >
                  Zobraziť prihlášku
                  <ChevronRight class="w-3.5 h-3.5" />
                </NuxtLink>
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
            <div class="bg-gray-100 rounded-full h-2 mb-2">
              <div
                class="h-2 rounded-full transition-all"
                :class="budgetBarColor(task.budget ? task.spent / task.budget : 0)"
                :style="{ width: task.budget ? `${Math.min((task.spent / task.budget) * 100, 100)}%` : '0%' }"
              />
            </div>
            <div class="flex justify-between text-xs text-gray-500">
              <span>Čerpanie: {{ formatCurrency(task.spent) }}</span>
              <span>{{ task.budget ? Math.round((task.spent / task.budget) * 100) : 0 }}%</span>
            </div>
            <div class="mt-3 pt-3 border-t border-gray-100 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Zostatok</span>
                <span class="font-semibold text-navy">{{ formatCurrency(task.budget ? task.budget - task.spent : null) }}</span>
              </div>
              <div v-if="task.budget_type" class="flex justify-between text-sm">
                <span class="text-gray-500">Spôsob výplaty</span>
                <span class="font-medium text-navy">{{ budgetTypeLabel(task.budget_type) }}</span>
              </div>
              <div v-if="task.max_teams" class="flex justify-between text-sm">
                <span class="text-gray-500">Max. tímov</span>
                <span class="font-medium text-navy">{{ task.max_teams }}</span>
              </div>
            </div>
            <!-- Rozpad rozpočtu -->
            <div v-if="task.budget" class="mt-3 pt-3 border-t border-gray-100">
              <p class="text-xs font-medium text-gray-400 mb-2">Odhadovaný rozpad</p>
              <div class="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p class="text-xs text-gray-400">Na tím</p>
                  <p class="text-xs font-semibold text-navy">{{ formatCurrency(task.budget / Math.max(task.max_teams || 1, 1)) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400">NTI (10%)</p>
                  <p class="text-xs font-semibold text-navy">{{ formatCurrency(task.budget * 0.1) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400">Čistá odmena</p>
                  <p class="text-xs font-semibold text-navy">{{ formatCurrency((task.budget * 0.9) / Math.max(task.max_teams || 1, 1)) }}</p>
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
                <p class="font-medium text-blue-900 text-sm">{{ task.assignedTeam }}</p>
                <p class="text-xs text-blue-600">{{ task.assignedTeamMembers }} členov</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
  <UiModal
    v-model="isConfirmModalOpen"
    title="Odoslať na schválenie"
  >
    <div class="py-2">
      <p class="text-gray-600">
        Naozaj chcete zadanie <strong>{{ task?.title }}</strong> odoslať na schválenie? 
        Po schválení administrátorom bude zadanie viditeľné pre tímy.
      </p>
    </div>

    <template #actions>
      <button
        @click="isConfirmModalOpen = false"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
      >
        Zrušiť
      </button>
      <button
        @click="handlePublish"
        :disabled="isActionLoading"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-2"
      >
        <span v-if="isActionLoading" class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
        Odoslať
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChevronLeft, ChevronRight, Pencil, Send, CheckCircle, Users, FileText, Code, Tag, UserCircle } from 'lucide-vue-next'
import { normalizeTaskStatus, apiTaskStatusState } from '~/composables/useTaskStatus'

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['partner'],
})

const route = useRoute()
const api = useApi()

useHead({
  title: 'Detail zadania | NTI Firma',
})

const authStore = useAuthStore()

const { addToast } = useToast()

const task = ref<any>(null)
const isLoading = ref(true)
const isActionLoading = ref(false)

const isConfirmModalOpen = ref(false)

const confirmPublish = () => {
  isConfirmModalOpen.value = true
}

const formatDate = (val: string | null | undefined) =>
  val ? new Date(val).toLocaleDateString('sk-SK') : null

const loadTask = async () => {
  isLoading.value = true
  try {
    const rawResponse = await api.get(`/v1/admin/calls/${route.params.id}`) as any
    
    const data = rawResponse?.data ?? rawResponse
    
    if (!data || !data.id) { 
      task.value = null
      return 
    }

    task.value = {
      id: data.id,
      title: data.name,
      program: data.program?.name ?? 'Program',
      callType: data.call_type?.name ?? null,
      organization: data.organization?.name ?? null,
      status: normalizeTaskStatus(data.status?.name ?? 'Draft'),
      rawStatus: data.status?.name ?? 'Draft',
      createdAt: formatDate(data.created_at),
      documents: data.documents ?? [],
      applicationStart: formatDate(data.application_start),
      deadline: formatDate(data.application_deadline),
      projectStart: formatDate(data.project_start),
      projectEnd: formatDate(data.project_end),
      budget: data.budget ? Number(data.budget) : null,
      spent: Number(data.spent ?? 0),
      budget_type: data.budget_type ?? null,
      max_teams: data.max_teams ?? 1,
      description: data.description ?? '',
      tech_spec: data.tech_spec ?? '',
      tech_tags: data.tech_tags ?? [],
      requirements: data.call_criteria?.map((c: any) => c.name) ?? [],
      po_name: data.product_owner?.name ?? '',
      po_email: data.product_owner?.email ?? '',
      applications: data.applications ?? [],
      assignedTeam: null,
      assignedTeamMembers: 0,
    }
  } catch (err) {
    console.error('Chyba pri načítaní detailu:', err)
    task.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(loadTask)

const canEditTask = computed(() => authStore.hasPermission('organizations.edit_own'))

const formatCurrency = (val: number | null | undefined) =>
  typeof val === 'number'
    ? new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
    : '—'
 
const budgetBarColor = (ratio: number) => {
  if (ratio >= 1) return 'bg-danger-500'
  if (ratio >= 0.8) return 'bg-warning-500'
  return 'bg-blue-500'
}
 
const budgetTypeLabel = (type: string) =>
  ({ milestone: 'Po míľnikoch', monthly: 'Mesačne', completion: 'Po odovzdaní' })[type] ?? type

const handlePublish = async () => {
  isConfirmModalOpen.value = false
  isActionLoading.value = true
  
  try {
    await api.patch(`/v1/calls/${task.value.id}/workflow`, {
      state: apiTaskStatusState('pending')
    })

    task.value.status = 'pending'
    task.value.rawStatus = 'Čaká na schválenie'
    
    addToast({ 
      message: 'Zadanie bolo úspešne odoslané na schválenie.', 
      type: 'success' 
    })
  } catch (error: any) {
    addToast({ 
      message: error.response?._data?.message || 'Zadanie sa nepodarilo odoslať.', 
      type: 'error' 
    })
  } finally {
    isActionLoading.value = false
  }
}

const downloadFile = async (doc: any) => {
  try {
    const response = await api.get(`/documents/${doc.id}/download`, {
      responseType: 'blob'
    }) as any

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