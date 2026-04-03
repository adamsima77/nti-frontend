<!-- pages/firma/zadania/[id]/edit.vue -->
<template>
  <div class="max-w-4xl mx-auto px-6 py-10">

    <NuxtLink
      :to="`/firma/zadania/${route.params.id}`"
      class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors mb-6"
    >
      <ChevronLeft class="w-4 h-4" />
      Späť na detail zadania
    </NuxtLink>

    <div class="flex items-start justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-navy mb-1">Upraviť zadanie</h1>
        <p class="text-gray-500 text-sm">Program B — živá prax</p>
      </div>
      <UiStatusBadge v-if="taskData" :status="taskData.status" />
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 4" :key="i" class="bg-white rounded-lg border border-gray-100 p-6 animate-pulse">
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
      @saved="handleSaved"
      @delete="handleDelete"
    />

    <!-- Delete confirm modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-black/40" @click="showDeleteModal = false" />
      <div class="relative bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
        <h3 class="font-semibold text-navy mb-2">Zmazať zadanie?</h3>
        <p class="text-sm text-gray-500 mb-6">
          Táto akcia je nevratná. Zadanie a všetky prihlášky budú trvalo odstránené.
        </p>
        <div class="flex gap-3">
          <button
            @click="showDeleteModal = false"
            class="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Zrušiť
          </button>
          <button
            @click="confirmDelete"
            class="flex-1 px-4 py-2.5 bg-danger-500 text-white rounded-lg text-sm font-medium hover:bg-danger-600"
          >
            Zmazať
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ChevronLeft } from 'lucide-vue-next'
import ZadanieForm from '~/components/ui/ZadanieForm.vue'

definePageMeta({
  layout: 'portal',
  //middleware: 'auth',
  roles: ['company'],
})

useHead({ title: 'Upraviť zadanie | NTI Firma' })

const authStore = useAuthStore()

// TODO: remove when backend is available
if (!authStore.user) {
  authStore.user = {
    id: 2,
    email: 'info@techfirma.sk',
    organization_name: 'TechFirma s.r.o.',
    role: 'company',
  }
  authStore.token = 'mock-token'
}

const route  = useRoute()
const router = useRouter()

const isLoading      = ref(true)
const showDeleteModal = ref(false)
const taskData       = ref<Record<string, any> | null>(null)

onMounted(async () => {
  // TODO: const data = await api.get(`/firma/zadania/${route.params.id}`)
  await new Promise(r => setTimeout(r, 400))
  taskData.value = {
    id: route.params.id,
    title: 'AI chatbot pre zákaznícku podporu',
    description: 'Vyvíjate inteligentného chatbota schopného riešiť bežné otázky zákazníkov.',
    program: 'B',
    deadline: '2026-06-30',
    tech_spec: 'Riešenie musí byť integrované do existujúceho Salesforce CRM cez REST API.',
    requirements: ['Skúsenosti s NLP/LLM frameworkmi', 'Znalosť REST API integrácie', 'Minimálne 3 členovia tímu'],
    tech_tags: ['Python', 'OpenAI API', 'Salesforce', 'FastAPI'],
    po_name: 'Peter Kováč',
    po_email: 'peter.kovac@techfirma.sk',
    po_phone: '+421 905 123 456',
    po_position: 'CTO',
    budget: 8000,
    budget_type: 'milestone',
    max_teams: 1,
    status: 'published',
  }
  isLoading.value = false
})

const handleSaved = () => {
  router.push(`/firma/zadania/${route.params.id}`)
}

const handleDelete = () => {
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  // TODO: await api.delete(`/firma/zadania/${route.params.id}`)
  await new Promise(r => setTimeout(r, 600))
  showDeleteModal.value = false
  router.push('/firma/zadania')
}
</script>