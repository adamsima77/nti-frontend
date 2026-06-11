<template>
  <div class="max-w-2xl mx-auto px-6 py-10">
    <NuxtLink
      to="/mentor/konzultacie"
      class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors mb-6"
    >
      <ChevronLeft class="w-4 h-4" /> {{ t('mentor.consultationForm.back') }}
    </NuxtLink>

    <div class="mb-8">
      <h1 class="text-2xl font-bold text-navy mb-1">{{ t('mentor.consultationForm.title') }}</h1>
      <p class="text-gray-500 text-sm">{{ t('mentor.consultationForm.subtitle') }}</p>
    </div>

    <form
      @submit.prevent="handleSave"
      class="space-y-5"
    >
      <div class="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
        <h2 class="text-base font-semibold text-navy flex items-center gap-2">
          <MessageSquare class="w-4 h-4 text-purple-500" /> {{ t('mentor.consultationForm.basicInfo') }}
        </h2>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            {{ t('mentor.consultationForm.project') }} <span class="text-danger-500">*</span>
          </label>
          <select
            v-model="form.projectId"
            class="w-full px-3 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            :class="errors.projectId ? 'border-danger-300' : 'border-gray-200'"
          >
            <option value="">{{ t('mentor.consultationForm.chooseProject') }}</option>
            <option
              v-for="p in projects"
              :key="p.id"
              :value="p.id"
            >
              {{ p.name }} — {{ p.teamName }}
            </option>
          </select>
          <span
            v-if="errors.projectId"
            class="text-xs text-danger-600"
          >{{ errors.projectId }}</span>
        </div>

        <FormField
          :field="{
            name: 'title',
            type: 'text',
            label: t('mentor.consultationForm.topic'),
            placeholder: t('mentor.consultationForm.topicPlaceholder'),
            required: true,
          }"
          v-model="form.title"
          :error="errors.title ?? undefined"
          @blur="
            () => {
              if (!form.title) errors.title = t('mentor.consultationForm.errors.title')
            }
          "
        />

        <div class="grid grid-cols-2 gap-4">
          <FormField
            :field="{ name: 'scheduled_at', type: 'date', label: t('mentor.consultationForm.date'), required: true }"
            v-model="form.scheduled_at"
            :error="errors.scheduled_at ?? undefined"
            @blur="
              () => {
                if (!form.scheduled_at) errors.scheduled_at = t('mentor.consultationForm.errors.date')
              }
            "
          />

        <div>
  <label class="block text-xs font-semibold text-slate-500 mb-1.5">
    Čas stretnutia <span class="text-red-500">*</span>
  </label>
  <div 
    class="flex items-center border rounded-xl bg-white transition-all duration-200"
    :class="errors.scheduled_time ? 'border-red-400 bg-red-50 ring-2 ring-red-100' : 'border-slate-200'"
  >
    <input
      type="time"
      v-model="form.scheduled_time"
      class="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-transparent rounded-xl focus:outline-none"
      @blur="() => { if (!form.scheduled_time) errors.scheduled_time = 'Zadajte čas stretnutia.' }"
    />
  </div>
  <p v-if="errors.scheduled_time" class="text-xs text-red-500 mt-1">
    {{ errors.scheduled_time }}
  </p>
</div>
          <FormField
  :field="{
    name: 'duration',
    type: 'number',
    label: 'Trvanie (min)',
    placeholder: '60',
    required: true,
  }"
  v-model="form.duration"
  :error="errors.duration ?? undefined"
  @blur="
    () => {
      if (!form.duration || form.duration < 1) {
        errors.duration = 'Zadajte platnú dĺžku stretnutia.'
      } else {
        errors.duration = null
      }
    }
  "
/>
          
          <FormField
            :field="{
              name: 'type',
              type: 'select',
              label: t('mentor.consultationForm.type'),
              options: [
                { value: 'online', label: t('mentor.consultationForm.typeOnline') },
                { value: 'offline', label: t('mentor.consultationForm.typePersonal') },
              ],
              required: true,
            }"
            v-model="form.type"
          />
        </div>

        <div v-if="form.type === 'online'">
          <FormField
            :field="{
              name: 'meeting_url',
              type: 'text',
              label: 'Odkaz na stretnutie (Meeting URL)',
              placeholder: 'https://teams.microsoft.com/... alebo https://meet.google.com/...',
              required: true,
            }"
            v-model="form.meeting_url"
            :error="errors.meeting_url ?? undefined"
            @blur="
              () => {
                if (form.type === 'online' && !form.meeting_url) errors.meeting_url = 'Pre online stretnutie je potrebné zadať odkaz.'
              }
            "
          />
        </div>
      </div>

      <div class="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
        <h2 class="text-base font-semibold text-navy flex items-center gap-2">
          <FileText class="w-4 h-4 text-purple-500" /> Doplňujúce údaje
        </h2>

        <FormField
          :field="{
            name: 'agenda',
            type: 'textarea',
            label: 'Agenda',
            placeholder: 'Zadajte agendu...',
            required: false,
          }"
          v-model="form.agenda"
          :error="errors.agenda ?? undefined"
        />
      </div>

      <div
        v-if="saveError"
        class="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
      >
        <AlertCircle class="w-4 h-4 shrink-0" /> {{ saveError }}
      </div>

      <div class="flex justify-end gap-3">
        <NuxtLink
          to="/mentor/konzultacie"
          class="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          {{ t('mentor.consultationForm.cancel') }}
        </NuxtLink>
        <button
          type="submit"
          :disabled="isSaving"
          class="px-6 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <svg
            v-if="isSaving"
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
          {{ isSaving ? t('mentor.consultationForm.saving') : t('mentor.consultationForm.save') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ChevronLeft, MessageSquare, FileText, AlertCircle } from 'lucide-vue-next'

const { t } = useI18n()

definePageMeta({
  layout: 'portal',
  roles: ['mentor'],
})

useHead({ title: t('mentor.consultationForm.pageTitle') })

const router = useRouter()
const route = useRoute()
const api = useApi()

const isSaving = ref(false)
const saveError = ref<string | null>(null)
const loadingProjects = ref(false)

type MentorProjectOption = {
  id: number
  name: string
  teamName?: string | null
}

const projects = ref<MentorProjectOption[]>([])

const fetchProjects = async () => {
  loadingProjects.value = true
  try {
    const res = await api.get('/mentor/projects')
    projects.value = Array.isArray(res.data) ? (res.data as MentorProjectOption[]) : []
  } catch {
    projects.value = []
  } finally {
    loadingProjects.value = false
  }
}

onMounted(fetchProjects)

const today = new Date().toISOString().split('T')[0] ?? ''

const form = reactive({
  projectId: route.query.project ? Number(route.query.project) : ('' as number | ''),
  title: '',
  scheduled_at: today,
  scheduled_time: '10:00',
  type: 'online',
  meeting_url: '',
  agenda: '',
  duration: 60,
})

const errors = reactive<Record<string, string | null>>({})

// Ak sa zmení typ na offline, vymažeme chybovú hlášku a hodnotu pre meeting_url
watch(() => form.type, (newType) => {
  if (newType === 'offline') {
    form.meeting_url = ''
    errors.meeting_url = null
  }
})

const validate = () => {
  errors.projectId = form.projectId ? null : t('mentor.consultationForm.errors.chooseProject')
  errors.title = form.title ? null : t('mentor.consultationForm.errors.title')
  errors.scheduled_at = form.scheduled_at ? null : t('mentor.consultationForm.errors.date')
  errors.scheduled_time = null
  
  if (form.type === 'online') {
    errors.meeting_url = form.meeting_url.trim() ? null : 'Pre online stretnutie je potrebné zadať odkaz.'
  } else {
    errors.meeting_url = null
  }

  errors.duration =
  form.duration && form.duration >= 1
    ? null
    : 'Zadajte platnú dĺžku stretnutia.'

  return !Object.values(errors).some(Boolean)
}

const handleSave = async () => {
  if (!validate()) return
  isSaving.value = true
  saveError.value = null
  
  try {
    // Spojíme dátum z kalendára a čas z time-pickeru do jedného stringu
    // Výsledok bude napríklad: "2026-06-10 14:30:00"
    const fullTimestamp = `${form.scheduled_at} ${form.scheduled_time}:00`

    await api.post(`/mentor/projects/${form.projectId}/consultations`, {
      title: form.title.trim(),
      type: form.type,
      duration: Number(form.duration),
      scheduled_at: fullTimestamp, // <-- Sem pošleme spojený timestamp
      meeting_url: form.type === 'online' ? form.meeting_url.trim() : null,
      agenda: form.agenda.trim() || null,
    })
    
    router.push('/mentor/konzultacie')
  } catch (err: any) {
    if (err?.response?._data?.message) {
      saveError.value = err.response._data.message
    } else {
      saveError.value = t('mentor.consultationForm.errors.saveFailed')
    }
  } finally {
    isSaving.value = false
  }
}
</script>