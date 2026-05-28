<!-- pages/mentor/konzultacie/nova.vue -->
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

        <!-- Project select -->
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
            >{{ errors.projectId }}</span
          >
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
            :field="{ name: 'date', type: 'date', label: t('mentor.consultationForm.date'), required: true }"
            v-model="form.date"
            :error="errors.date ?? undefined"
            @blur="
              () => {
                if (!form.date) errors.date = t('mentor.consultationForm.errors.date')
              }
            "
          />
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('mentor.consultationForm.duration') }}</label>
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
            name: 'type',
            type: 'select',
            label: t('mentor.consultationForm.type'),
            options: [
              { value: 'online', label: t('mentor.consultationForm.typeOnline') },
              { value: 'personal', label: t('mentor.consultationForm.typePersonal') },
              { value: 'written', label: t('mentor.consultationForm.typeWritten') },
            ],
            required: true,
          }"
          v-model="form.type"
        />
      </div>

      <div class="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
        <h2 class="text-base font-semibold text-navy flex items-center gap-2">
          <FileText class="w-4 h-4 text-purple-500" /> {{ t('mentor.consultationForm.record') }}
        </h2>

        <FormField
          :field="{
            name: 'summary',
            type: 'textarea',
            label: t('mentor.consultationForm.summary'),
            placeholder: t('mentor.consultationForm.summaryPlaceholder'),
            required: true,
          }"
          v-model="form.summary"
          :error="errors.summary ?? undefined"
          @blur="
            () => {
              if (!form.summary) errors.summary = t('mentor.consultationForm.errors.summary')
            }
          "
        />

        <!-- Action items -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('mentor.consultationForm.tasks') }}</label>
          <div class="space-y-2">
            <div
              v-for="(_, i) in form.actionItems"
              :key="i"
              class="flex gap-2"
            >
              <input
                v-model="form.actionItems[i]"
                type="text"
                :placeholder="t('mentor.consultationForm.taskPlaceholder')"
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
              <Plus class="w-4 h-4" /> {{ t('mentor.consultationForm.addTask') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Feedback -->
      <div
        v-if="saveError"
        class="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
      >
        <AlertCircle class="w-4 h-4 shrink-0" /> {{ saveError }}
      </div>

      <!-- Actions -->
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
import { ref, reactive, onMounted } from 'vue'
import { ChevronLeft, MessageSquare, FileText, Plus, X, AlertCircle } from 'lucide-vue-next'

const { t } = useI18n()

definePageMeta({
  layout: 'portal',
  //middleware: 'auth',
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
    projects.value = Array.isArray(res) ? (res as MentorProjectOption[]) : []
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
  date: today,
  duration: 60,
  type: 'online',
  summary: '',
  actionItems: [''] as string[],
})

const errors = reactive<Record<string, string | null>>({})

const validate = () => {
  errors.projectId = form.projectId ? null : t('mentor.consultationForm.errors.chooseProject')
  errors.title = form.title ? null : t('mentor.consultationForm.errors.title')
  errors.date = form.date ? null : t('mentor.consultationForm.errors.date')
  errors.summary = form.summary ? null : t('mentor.consultationForm.errors.summary')
  return !Object.values(errors).some(Boolean)
}

const handleSave = async () => {
  if (!validate()) return
  isSaving.value = true
  saveError.value = null
  try {
    const noteParts = [
      form.title.trim(),
      `Dátum: ${form.date}`,
      `Typ: ${form.type}`,
      `Trvanie: ${form.duration} min`,
      form.summary.trim(),
      form.actionItems.filter(Boolean).length ? `Úlohy: ${form.actionItems.filter(Boolean).join('; ')}` : '',
    ].filter(Boolean)

    await api.post(`/mentor/projects/${form.projectId}/consultations`, {
      note: noteParts.join('\n'),
    })
    router.push('/mentor/konzultacie')
  } catch {
    saveError.value = t('mentor.consultationForm.errors.saveFailed')
  } finally {
    isSaving.value = false
  }
}
</script>
