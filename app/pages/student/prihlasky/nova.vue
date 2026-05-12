<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <!-- Breadcrumbs -->
    <div class="mb-8">
      <UiBreadcrumbs
        :items="[
          { label: 'Prihlášky', to: localePath('/student/prihlasky') },
          { label: 'Nová prihláška' },
        ]"
      />
    </div>

    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-navy mb-2">Nová prihláška</h1>
      <p class="text-gray-600">Vyberte výzvu a vyplňte formulár pre prihlášku vášho tímu</p>
    </div>

    <!-- Step 1: Select Call -->
    <div
      v-if="!selectedCall"
      class="space-y-6"
    >
      <!-- Loading -->
      <div
        v-if="callsStore.isLoading"
        class="grid gap-4"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-40 animate-pulse"
        />
      </div>

      <!-- Available Calls -->
      <div
        v-else-if="callsStore.openCalls.length"
        class="grid gap-4"
      >
        <div
          v-for="call in callsStore.openCalls"
          :key="call.id"
          @click="selectCall(call)"
          class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:border-blue-200 transition"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="text-xl font-bold text-navy">{{ call.title }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ call.programName }}</p>
            </div>
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700"
            >
              Otvorené
            </span>
          </div>

          <p class="text-sm text-gray-600 mb-4">{{ call.description }}</p>

          <div class="flex items-center gap-4 text-sm text-gray-500">
            <span class="flex items-center gap-1">
              <Calendar class="w-4 h-4" />
              {{ formatDate(call.startDate) }} - {{ formatDate(call.endDate) }}
            </span>
            <span class="flex items-center gap-1">
              <Users class="w-4 h-4" />
              {{ call.applicantsCount || 0 }} prihlášok
            </span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="bg-white rounded-lg shadow-sm border border-gray-100"
      >
        <UiEmptyState
          :icon="FileText"
          title="Žiadne otvorené výzvy"
          description="V tomto momente nie sú dostupné žiadne otvorené výzvy. Skúste neskôr."
        >
          <NuxtLink :to="localePath('/student/prihlasky')">
            <UiButton variant="outline">Späť na prihlášky</UiButton>
          </NuxtLink>
        </UiEmptyState>
      </div>
    </div>

    <!-- Step 2: Fill Form -->
    <div
      v-else
      class="bg-white rounded-lg shadow-sm border border-gray-100 p-8"
    >
      <!-- Call Header -->
      <div class="mb-8 pb-8 border-b">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold text-navy">{{ selectedCall.title }}</h2>
            <p class="text-sm text-gray-500 mt-1">{{ selectedCall.programName }}</p>
          </div>
          <button
            @click="selectedCall = null"
            class="text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            ✕ Zmeniť výzvu
          </button>
        </div>

        <!-- Team selection -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Tím</label>
          <select
            v-model.number="selectedTeamId"
            class="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option
              value=""
              disabled
            >
              Vyberte tím
            </option>
            <option
              v-for="team in teamsStore.teams"
              :key="team.id"
              :value="team.id"
            >
              {{ team.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Form -->
      <DynamicForm
        v-if="selectedCall.formSchema"
        :form-schema="selectedCall.formSchema"
        :initial-data="draftData"
        @cancel="handleCancel"
        @save-draft="handleSaveDraft"
        @submit="handleSubmit"
      />
      <div
        v-else
        class="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
      >
        Táto výzva zatiaľ neobsahuje schému dynamického formulára z API. Prihlášku je možné dokončiť po doplnení backendu
        (napr. definícia polí a nahrávanie dokumentov s vrátením <code class="text-xs">document_ids</code>).
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Calendar, Users, FileText } from 'lucide-vue-next'
import type { Call } from '~/stores/calls'

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
})

useHead({ title: 'Nová prihláška | NTI' })

const router = useRouter()
const localePath = useLocalePath()
const callsStore = useCallsStore()
const teamsStore = useTeamsStore()
const applicationsStore = useApplicationsStore()
const { addToast } = useToast()

const selectedCall = ref<Call | null>(null)
const selectedTeamId = ref<number | null>(null)
const draftData = ref<Record<string, any>>({})
const isSubmitting = ref(false)

// Load calls and teams on mount
onMounted(async () => {
  await Promise.all([callsStore.fetchOpenCalls(), teamsStore.fetchTeams()])
})

const selectCall = async (call: Call) => {
  selectedCall.value = call
  selectedTeamId.value = null

  // Check if there's a draft for this call
  if (teamsStore.teams.length > 0) {
    const draft = applicationsStore.getDraft(teamsStore.teams[0]!.id, call.id)
    if (draft) {
      draftData.value = draft.data
      addToast({
        message: 'Načítavam rozpracovanú prihlášku',
        type: 'info',
      })
    }
  }
}

const handleSaveDraft = (data: Record<string, any>) => {
  if (!selectedTeamId.value || !selectedCall.value) return

  applicationsStore.saveDraft(selectedTeamId.value, selectedCall.value.id, data)
  addToast({
    message: 'Rozpracovaná prihláška uložená',
    type: 'success',
  })
}

const handleSubmit = async (data: Record<string, any>) => {
  if (!selectedTeamId.value || !selectedCall.value) {
    addToast({ message: 'Vyberte tím', type: 'error' })
    return
  }

  const rawIds = (data as { document_ids?: unknown }).document_ids
  const documentIds = Array.isArray(rawIds)
    ? rawIds.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0)
    : []

  isSubmitting.value = true

  try {
    const application = await applicationsStore.createApplication({
      callId: selectedCall.value.id,
      teamId: Number(selectedTeamId.value),
      documentIds,
    })

    addToast({
      message: 'Prihláška bola vytvorená.',
      type: 'success',
    })

    applicationsStore.clearDraft(Number(selectedTeamId.value), selectedCall.value.id)

    await router.push(localePath(`/student/prihlasky/${application.id}`))
  } catch (err: any) {
    const msg = err?.data?.message ?? err?.message ?? 'Odoslanie zlyhalo'
    addToast({ message: msg, type: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  if (confirm('Zrušiť rozpracovanú prihlášku bez uloženia?')) {
    selectedCall.value = null
    selectedTeamId.value = null
    draftData.value = {}
    router.push(localePath('/student/prihlasky'))
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('sk-SK')
}
</script>
