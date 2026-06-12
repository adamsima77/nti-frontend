<!-- pages/firma/zadania/[id]/edit.vue -->
<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <NuxtLink
      :to="localePath(`/firma/zadania/${route.params.id}`)"
      class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors mb-6"
    >
      <ChevronLeft class="w-4 h-4" />
      {{ $t('firma.zadanie_detail.back_detail') }}
    </NuxtLink>

    <div class="flex items-start justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-navy mb-1">{{ $t('firma.zadanie_detail.edit_title') }}</h1>
      </div>
      <UiStatusBadge
        v-if="taskData"
        :status="taskData.rawStatus"
      />
    </div>

    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="space-y-4"
    >
      <div
        v-for="i in 4"
        :key="i"
        class="bg-white rounded-lg border border-gray-100 p-6 animate-pulse"
      >
        <div class="h-4 bg-gray-200 rounded w-1/4 mb-4" />
        <div class="space-y-3">
          <div class="h-10 bg-gray-100 rounded" />
          <div class="h-10 bg-gray-100 rounded" />
        </div>
      </div>
    </div>

    <ZadanieForm
      v-else-if="taskData"
      :is-new="false"
      :initial-data="taskData"
      :can-delete="canDeleteTask"
      @saved="handleSaved"
      @delete="handleDelete"
    />

    <!-- Delete confirm modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div
        class="absolute inset-0 bg-black/40"
        @click="showDeleteModal = false"
      />
      <div class="relative bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
        <h3 class="font-semibold text-navy mb-2">{{ $t('firma.zadanie_detail.delete_confirm') }}</h3>
        <div class="flex gap-3">
          <button
            @click="showDeleteModal = false"
            class="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            {{ $t('firma.zadanie_detail.delete_cancel') }}
          </button>
          <button
            @click="confirmDelete"
            class="flex-1 px-4 py-2.5 bg-danger-500 text-white rounded-lg text-sm font-medium hover:bg-danger-600"
          >
            {{ $t('firma.zadanie_detail.delete_confirm_btn') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChevronLeft } from 'lucide-vue-next'
import ZadanieForm from '~/components/ui/ZadanieForm.vue'
import { normalizeTaskStatus } from '~/composables/useTaskStatus'
import { useI18n } from 'vue-i18n'

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['partner'],
})

useHead({ title: 'Upraviť zadanie | NTI Firma' })

const orgDashboard = useOrgDashboard()
await orgDashboard.load()
if (orgDashboard.myRole.value !== 'organization_admin') {
  await navigateTo(useLocalePath()('/firma'))
}

const authStore = useAuthStore()
const api = useApi()
const route = useRoute()
const router = useRouter()
const { addToast } = useToast()
const { t } = useI18n()
const localePath = useLocalePath()

const canDeleteTask = computed(() => {
  if (!taskData.value) return false
  
  const hasPermission = authStore.hasPermission('organizations.edit_own')

  const deletableStatuses = ['Draft', 'Čaká na schválenie']
  const isCorrectStatus = deletableStatuses.includes(taskData.value.rawStatus)
  
  return hasPermission && isCorrectStatus
})

const isLoading = ref(true)
const showDeleteModal = ref(false)
const taskData = ref<Record<string, any> | null>(null)

const mapCallToFormData = (call: any) => ({
  id: call.id,
  title: call.name,
  description: call.description ?? '',
  program: call.program?.id ? String(call.program.id) : '',
  application_start: call.application_start,
  application_deadline: call.application_deadline,
  project_start: call.project_start,
  project_end: call.project_end,
  tech_spec: call.tech_spec ?? '',
  requirements: call.call_criteria?.map((c: any) => c.name).filter(Boolean) ?? [''],
  tech_tags: call.tech_tags ?? [],
  attachments: call.documents ?? [],
  po_name: [call.product_owner?.name, call.product_owner?.surname].filter(Boolean).join(' ') || '',
  po_email: call.product_owner?.email ?? '',
  budget: call.budget ? Number(call.budget) : null,
  budget_type: call.budget_type ?? 'milestone',
  status: normalizeTaskStatus(call.status?.name ?? ''),
  rawStatus: call.status?.name ?? '',
})

onMounted(async () => {
  try {
    const rawResponse = await api.get(`/v1/admin/calls/${route.params.id}`) as any
    const call = rawResponse?.data ?? rawResponse
    if (!call?.id) { taskData.value = null; return }
    taskData.value = mapCallToFormData(call)
  } catch {
    taskData.value = null
  } finally {
    isLoading.value = false
  }
})

const handleSaved = () => {
  router.push(localePath(`/firma/zadania/${route.params.id}`))
}

const handleDelete = () => {
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  try {
    await api.delete(`/v1/admin/calls/${route.params.id}`)
    addToast({
      message: t('firma.zadanie_detail.toast_deleted'),
      type: 'success'
    })
    showDeleteModal.value = false
    router.push(localePath('/firma/zadania'))
  } catch (err: any) {
    showDeleteModal.value = false

    const errorMsg = err?.data?.message ?? t('firma.zadanie_detail.toast_delete_error')

    addToast({ 
      message: errorMsg, 
      type: 'error' 
    })
  }
}
</script>
