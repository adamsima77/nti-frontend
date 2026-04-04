<!-- pages/mentor/konzultacie/nova.vue -->
<template>
  <div class="max-w-2xl mx-auto px-6 py-10">

    <NuxtLink
      to="/mentor/konzultacie"
      class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors mb-6"
    >
      <ChevronLeft class="w-4 h-4" /> Späť na konzultácie
    </NuxtLink>

    <div class="mb-8">
      <h1 class="text-2xl font-bold text-navy mb-1">Nová konzultácia</h1>
      <p class="text-gray-500 text-sm">Zapíšte záznam z mentoringovej konzultácie</p>
    </div>

    <form @submit.prevent="handleSave" class="space-y-5">

      <div class="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
        <h2 class="text-base font-semibold text-navy flex items-center gap-2">
          <MessageSquare class="w-4 h-4 text-purple-500" /> Základné informácie
        </h2>

        <!-- Project select -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            Projekt <span class="text-danger-500">*</span>
          </label>
          <select
            v-model="form.projectId"
            class="w-full px-3 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            :class="errors.projectId ? 'border-danger-300' : 'border-gray-200'"
          >
            <option value="">Vyberte projekt...</option>
            <option v-for="p in projects" :key="p.id" :value="p.id">
              {{ p.name }} — {{ p.teamName }}
            </option>
          </select>
          <span v-if="errors.projectId" class="text-xs text-danger-600">{{ errors.projectId }}</span>
        </div>

        <FormField
          :field="{ name: 'title', type: 'text', label: 'Názov / téma', placeholder: 'Napr. Review sprint 2, Architektúra databázy', required: true }"
          v-model="form.title"
          :error="errors.title ?? undefined"
          @blur="() => { if (!form.title) errors.title = 'Názov je povinný' }"
        />

        <div class="grid grid-cols-2 gap-4">
          <FormField
            :field="{ name: 'date', type: 'date', label: 'Dátum', required: true }"
            v-model="form.date"
            :error="errors.date ?? undefined"
            @blur="() => { if (!form.date) errors.date = 'Dátum je povinný' }"
          />
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Trvanie (min)</label>
            <input
              v-model.number="form.duration"
              type="number"
              min="1"
              placeholder="60"
              class="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>

        <FormField
          :field="{
            name: 'type', type: 'select', label: 'Typ konzultácie',
            options: [
              { value: 'online',    label: 'Online (videohovor)' },
              { value: 'personal',  label: 'Osobne' },
              { value: 'written',   label: 'Písomná / e-mail' },
            ],
            required: true
          }"
          v-model="form.type"
        />
      </div>

      <div class="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
        <h2 class="text-base font-semibold text-navy flex items-center gap-2">
          <FileText class="w-4 h-4 text-purple-500" /> Záznam
        </h2>

        <FormField
          :field="{ name: 'summary', type: 'textarea', label: 'Zhrnutie konzultácie', placeholder: 'Čo sa riešilo, aké závery padli, na čom tím pracuje...', required: true }"
          v-model="form.summary"
          :error="errors.summary ?? undefined"
          @blur="() => { if (!form.summary) errors.summary = 'Záznam je povinný' }"
        />

        <!-- Action items -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Úlohy pre tím</label>
          <div class="space-y-2">
            <div v-for="(_, i) in form.actionItems" :key="i" class="flex gap-2">
              <input
                v-model="form.actionItems[i]"
                type="text"
                placeholder="Napr. Dopracovať databázovú schému do piatku"
                class="flex-1 px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                type="button"
                @click="form.actionItems.splice(i, 1)"
                class="text-gray-400 hover:text-danger-500 transition-colors p-1"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              @click="form.actionItems.push('')"
              class="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800"
            >
              <Plus class="w-4 h-4" /> Pridať úlohu
            </button>
          </div>
        </div>
      </div>

      <!-- Feedback -->
      <div v-if="saveError" class="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
        <AlertCircle class="w-4 h-4 shrink-0" /> {{ saveError }}
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <NuxtLink
          to="/mentor/konzultacie"
          class="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Zrušiť
        </NuxtLink>
        <button
          type="submit"
          :disabled="isSaving"
          class="px-6 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <svg v-if="isSaving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
          </svg>
          {{ isSaving ? 'Ukladám...' : 'Uložiť záznam' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ChevronLeft, MessageSquare, FileText, Plus, X, AlertCircle } from 'lucide-vue-next'

definePageMeta({ 
  layout: 'portal', 
  //middleware: 'auth', 
  roles: ['mentor'] 
})

useHead({ title: 'Nová konzultácia | NTI Mentor' })

const authStore = useAuthStore()

// TODO: remove when backend is available
if (!authStore.user) {
  authStore.user = { 
    id: 10, 
    email: 'mentor@nti.sk', 
    first_name: 'Matej', 
    last_name: 'Novotný', 
    role: 'mentor' 
  }
  authStore.token = 'mock-token'
}

const router = useRouter()
const route  = useRoute()

const isSaving  = ref(false)
const saveError = ref<string | null>(null)

// TODO: fetch from API
const projects = [
  { id: 1, name: 'EcoTrack – Sledovanie uhlíkovej stopy', teamName: 'GreenTech tím' },
  { id: 2, name: 'AI chatbot pre zákaznícku podporu',     teamName: 'AI Innovators' },
  { id: 3, name: 'StudyBuddy – AI asistent',              teamName: 'EduTech' },
]

const today = new Date().toISOString().split('T')[0] ?? ''

const form = reactive({
  projectId:   route.query.project ? Number(route.query.project) : ('' as number | ''),
  title:       '',
  date:        today,
  duration:    60,
  type:        'online',
  summary:     '',
  actionItems: [''] as string[],
})

const errors = reactive<Record<string, string | null>>({})

const validate = () => {
  errors.projectId = form.projectId  ? null : 'Vyberte projekt'
  errors.title     = form.title      ? null : 'Názov je povinný'
  errors.date      = form.date       ? null : 'Dátum je povinný'
  errors.summary   = form.summary    ? null : 'Záznam je povinný'
  return !Object.values(errors).some(Boolean)
}

const handleSave = async () => {
  if (!validate()) return
  isSaving.value  = true
  saveError.value = null
  try {
    // TODO: await api.post(`/mentor/projects/${form.projectId}/consultations`, form)
    await new Promise(r => setTimeout(r, 700))
    router.push('/mentor/konzultacie')
  } catch {
    saveError.value = 'Nastala chyba pri ukladaní. Skúste znova.'
  } finally {
    isSaving.value = false
  }
}
</script>