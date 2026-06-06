<!-- components/firma/ZadanieForm.vue -->
<template>
  <form
    @submit.prevent="handleSave"
    class="space-y-6"
  >
    <!-- Status flow (len pri editácii) -->
    <div
      v-if="!isNew"
      class="bg-white border border-gray-100 rounded-lg p-4"
    >
      <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Stav zadania</p>
      <div class="flex items-center gap-1 flex-wrap">
        <template
          v-for="(step, i) in statusFlow"
          :key="step.value"
        >
          <div
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            :class="statusStepClass(step.value)"
          >
            {{ step.label }}
          </div>
          <ChevronRight
            v-if="i < statusFlow.length - 1"
            class="w-3.5 h-3.5 text-gray-300 shrink-0"
          />
        </template>
      </div>
      <div
        v-if="availableActions.length"
        class="flex gap-2 mt-3 pt-3 border-t border-gray-100"
      >
        <button
          v-for="action in availableActions"
          :key="action.to"
          type="button"
          @click="handleStatusChange(action.to)"
          :disabled="isActionLoading"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          :class="action.class"
        >
          {{ action.label }}
        </button>
      </div>
    </div>

    <!-- 1. Základné informácie -->
    <div class="bg-white rounded-lg border border-gray-100 p-6">
      <h2 class="text-base font-semibold text-navy mb-4 flex items-center gap-2">
        <FileText class="w-4 h-4 text-blue-600" />
        Základné informácie
      </h2>
      <div class="space-y-4">
        <FormField
          :field="{
            name: 'title',
            type: 'text',
            label: 'Názov zadania',
            placeholder: 'Napr. AI chatbot pre zákaznícku podporu',
            required: true,
          }"
          v-model="form.title"
          :error="errors.title ?? undefined"
          @blur="
            () => {
              if (!form.title) errors.title = 'Názov je povinný'
            }
          "
        />
        <FormField
          :field="{
            name: 'description',
            type: 'textarea',
            label: 'Stručný popis',
            placeholder: 'Čo chcete dosiahnuť? Pre koho je riešenie určené?',
            required: true,
          }"
          v-model="form.description"
          :error="errors.description ?? undefined"
          @blur="
            () => {
              if (!form.description) errors.description = 'Popis je povinný'
            }
          "
        />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            :field="{ name: 'deadline', type: 'date', label: 'Deadline realizácie', required: true }"
            v-model="form.deadline"
            :error="errors.deadline ?? undefined"
          />
        </div>
      </div>
    </div>

    <!-- 2. Technická špecifikácia -->
    <div class="bg-white rounded-lg border border-gray-100 p-6">
      <h2 class="text-base font-semibold text-navy mb-4 flex items-center gap-2">
        <Code class="w-4 h-4 text-blue-600" />
        Technická špecifikácia
      </h2>
      <div class="space-y-4">
        <FormField
          :field="{
            name: 'tech_spec',
            type: 'textarea',
            label: 'Popis technického riešenia',
            placeholder:
              'Popíšte technický kontext, existujúce systémy, preferované technológie, obmedzenia a cieľovú architektúru...',
            required: true,
          }"
          v-model="form.tech_spec"
        />
        <div class="pt-4 border-t border-gray-50">
          <FormField
            :field="{
              name: 'attachments',
              type: 'file',
              label: 'Prílohy a dokumentácia',
              description: 'Nahrajte detailnú špecifikáciu, diagramy alebo iné podklady pre študentov.',
              allowMultiple: true,
              required: true,
              maxFileSize: 10 * 1024 * 1024,
              accept: '.pdf,.doc,.docx,.zip,.jpg,.png',
            }"
            v-model="form.attachments"
            :error="errors.attachments ?? undefined"
          />
        </div>

        <!-- Requirements -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Požiadavky na tím</label>
          <div class="space-y-2">
            <div
              v-for="(_, i) in form.requirements"
              :key="i"
              class="flex items-center gap-2"
            >
              <input
                v-model="form.requirements[i]"
                type="text"
                placeholder="Napr. Skúsenosti s React a Node.js"
                class="flex-1 px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                @click="removeRequirement(Number(i))"
                class="text-gray-400 hover:text-danger-500 transition-colors p-1"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              @click="addRequirement"
              class="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800"
            >
              <Plus class="w-4 h-4" />
              Pridať požiadavku
            </button>
          </div>
        </div>

        <!-- Tech tags -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Preferované technológie</label>
          <div class="flex flex-wrap gap-2 mb-2">
            <span
              v-for="tag in form.tech_tags"
              :key="tag"
              class="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
            >
              {{ tag }}
              <button
                type="button"
                @click="removeTag(tag)"
              >
                <X class="w-3 h-3" />
              </button>
            </span>
          </div>
          <div class="flex gap-2">
            <input
              v-model="newTag"
              type="text"
              placeholder="Napr. React, Python, Laravel..."
              @keydown.enter.prevent="addTag"
              class="flex-1 px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              @click="addTag"
              class="px-3 py-2 bg-blue-50 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              Pridať
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Product Owner -->
    <div class="bg-white rounded-lg border border-gray-100 p-6">
      <h2 class="text-base font-semibold text-navy mb-1 flex items-center gap-2">
        <UserCircle class="w-4 h-4 text-blue-600" />
        Product Owner
      </h2>
      <p class="text-xs text-gray-400 mb-4">Osoba zodpovedná za komunikáciu s realizačným tímom zo strany firmy</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          :field="{
            name: 'po_name',
            type: 'text',
            label: 'Meno a priezvisko',
            placeholder: 'Ján Novák',
            required: true,
          }"
          v-model="form.po_name"
        />
        <FormField
          :field="{
            name: 'po_email',
            type: 'email',
            label: 'E-mail',
            placeholder: 'jan.novak@firma.sk',
            required: true,
          }"
          v-model="form.po_email"
          :error="errors.po_email ?? undefined"
          @blur="validatePoEmail"
        />
      </div>
    </div>

    <!-- 4. Rozpočet -->
    <div class="bg-white rounded-lg border border-gray-100 p-6">
      <h2 class="text-base font-semibold text-navy mb-1 flex items-center gap-2">
        <Wallet class="w-4 h-4 text-blue-600" />
        Rozpočet
      </h2>
      <p class="text-xs text-gray-400 mb-4">Odmena pre realizačný tím študentov</p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Budget -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            Celkový rozpočet (€) <span class="text-danger-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            <input
              v-model.number="form.budget"
              type="number"
              min="0"
              step="100"
              placeholder="5000"
              class="w-full pl-7 pr-3 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="errors.budget ? 'border-danger-300' : 'border-gray-200'"
            />
          </div>
          <span
            v-if="errors.budget"
            class="text-xs text-danger-600"
            >{{ errors.budget }}</span
          >
        </div>
        <FormField
          :field="{
            name: 'budget_type',
            type: 'select',
            label: 'Spôsob výplaty',
            required: true,
            options: [
              { value: 'milestone', label: 'Po míľnikoch' },
              { value: 'monthly', label: 'Mesačne' },
              { value: 'completion', label: 'Po odovzdaní' },
            ],
          }"
          v-model="form.budget_type"
        />
        <FormField
          :field="{ name: 'max_teams', type: 'number', label: 'Počet tímov (max)', placeholder: '1', required: true }"
          v-model="form.max_teams"
        />
      </div>

      <div
        v-if="form.budget"
        class="mt-4 p-4 bg-blue-50 rounded-lg"
      >
        <p class="text-xs font-medium text-blue-700 mb-2">Odhadovaný rozpad rozpočtu</p>
        <div class="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p class="text-xs text-blue-500">Na tím</p>
            <p class="font-semibold text-blue-800">
              {{ formatCurrency(form.budget / Math.max(form.max_teams || 1, 1)) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-blue-500">NTI poplatok (10%)</p>
            <p class="font-semibold text-blue-800">{{ formatCurrency(form.budget * 0.1) }}</p>
          </div>
          <div>
            <p class="text-xs text-blue-500">Čistá odmena</p>
            <p class="font-semibold text-blue-800">
              {{ formatCurrency((form.budget * 0.9) / Math.max(form.max_teams || 1, 1)) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Feedback -->
    <div
      v-if="saveSuccess"
      class="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
    >
      <CheckCircle class="w-4 h-4 shrink-0" />
      Zadanie bolo uložené.
    </div>
    <div
      v-if="saveError"
      class="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
    >
      <AlertCircle class="w-4 h-4 shrink-0" />
      {{ saveError }}
    </div>

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row justify-between gap-3">
      <button
        v-if="!isNew && canDelete"
        type="button"
        @click="$emit('delete')"
        class="inline-flex items-center gap-2 px-4 py-2.5 border border-danger-200 text-danger-600 rounded-lg text-sm font-medium hover:bg-danger-50 transition-colors"
      >
        <Trash2 class="w-4 h-4" />
        Zmazať zadanie
      </button>
      <div class="flex gap-3 sm:ml-auto">
        <button
          type="button"
          @click="handleSaveDraft"
          :disabled="isSaving"
          class="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Uložiť ako draft
        </button>
        <button
          type="submit"
          :disabled="isSaving"
          class="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
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
          {{ isSaving ? 'Ukladám...' : isNew ? 'Vytvoriť zadanie' : 'Uložiť zmeny' }}
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { apiTaskStatusState } from '~/composables/useTaskStatus'
import { ref, reactive, computed, onMounted } from 'vue'
import {
  ChevronRight,
  FileText,
  Code,
  UserCircle,
  Wallet,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Trash2,
  MirrorRectangularIcon,
} from 'lucide-vue-next'

const { locale } = useI18n()

const langId = computed(() => locale.value === 'sk' ? 1 : 2)

const props = withDefaults(defineProps<{
  isNew: boolean
  initialData?: Record<string, any>
  canDelete?: boolean
}>(), {
  canDelete: true,
})

const emit = defineEmits<{
  (e: 'saved', id: number | null): void
  (e: 'delete'): void
}>()

const api = useApi()

const getProgramLabel = (program: any) => {
  return (
    program?.programTranslations?.[0]?.name ??
    program?.program_translations?.[0]?.name ??
    program?.name ??
    program?.typeOfProgram?.name ??
    'Program'
  )
}

const loadPrograms = async () => {
  if (form.program) MirrorRectangularIcon
  try {
    const response = await api.get('/programs/lang/sk') as any
    const all = (response ?? [])
    const programB = all.find((p: any) => {
      const name = getProgramLabel(p).toLowerCase()
      return name.includes('program b') || name.includes('živá prax') || name.includes('ziva prax')
    }) ?? all.find((p: any) => p.id === 2)
    
    if (programB) {
      form.program = String(programB.id)
    }
  } catch {}
}

onMounted(loadPrograms)

const statusFlow = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending',   label: 'Čaká na schválenie' },
  { value: 'published', label: 'Publikované' },
  { value: 'matching', label: 'V párovaní' },
  { value: 'assigned', label: 'Pridelené' },
  { value: 'in_progress', label: 'V realizácii' },
  { value: 'closed', label: 'Uzavreté' },
]

const statusTransitions: Record<string, { to: string; label: string; class: string }[]> = {
  draft:       [{ to: 'pending', label: 'Odoslať na schválenie', class: 'bg-blue-600 text-white hover:bg-blue-700' }],
}

const statusStepClass = (stepValue: string) => {
  const currentIndex = statusFlow.findIndex((s) => s.value === form.status)
  const stepIndex = statusFlow.findIndex((s) => s.value === stepValue)
  if (stepValue === form.status) return 'bg-blue-600 text-white'
  if (stepIndex < currentIndex) return 'bg-success-50 text-success-500'
  return 'bg-gray-100 text-gray-400'
}

const availableActions = computed(() => statusTransitions[form.status] ?? [])

// ── Form ─────────────────────────────────────────────────────
const form = reactive({
  title: props.initialData?.title ?? '',
  description: props.initialData?.description ?? '',
  program: props.initialData?.program ? String(props.initialData.program) : '',
  deadline: props.initialData?.deadline ?? '',
  tech_spec: props.initialData?.tech_spec ?? '',
  requirements: props.initialData?.requirements ?? ([''] as string[]),
  tech_tags: props.initialData?.tech_tags ?? ([] as string[]),
  attachments: props.initialData?.attachments ?? ([] as any[]),
  po_name: props.initialData?.po_name ?? '',
  po_email: props.initialData?.po_email ?? '',
  budget: props.initialData?.budget ?? (null as number | null),
  budget_type: props.initialData?.budget_type ?? 'milestone',
  max_teams: props.initialData?.max_teams ?? 1,
  status: props.initialData?.status ?? ('draft' as string),
})

const errors = reactive<Record<string, string | null>>({})
const isSaving = ref(false)
const isActionLoading = ref(false)
const saveSuccess = ref(false)
const saveError = ref<string | null>(null)
const newTag = ref('')

// ── Requirements ─────────────────────────────────────────────
const addRequirement = () => form.requirements.push('')
const removeRequirement = (i: number) => form.requirements.splice(i, 1)

// ── Tags ─────────────────────────────────────────────────────
const addTag = () => {
  const t = newTag.value.trim()
  if (t && !form.tech_tags.includes(t)) form.tech_tags.push(t)
  newTag.value = ''
}
const removeTag = (tag: string) => {
  form.tech_tags = form.tech_tags.filter((t: string) => t !== tag)
}

// ── Validation ───────────────────────────────────────────────
const validatePoEmail = () => {
  errors.po_email = form.po_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.po_email) ? 'Neplatný e-mail' : null
}

const validate = () => {
  errors.title = form.title ? null : 'Názov je povinný'
  errors.description = form.description ? null : 'Popis je povinný'
  errors.budget = form.budget && form.budget > 0 ? null : 'Zadajte rozpočet'
  errors.deadline = form.deadline ? null : 'Deadline je povinný'
  validatePoEmail()
  return !Object.values(errors).some(Boolean)
}

// ── Save ─────────────────────────────────────────────────────
const save = async (asDraft = false) => {
  if (!asDraft && !validate()) return
  isSaving.value = true
  saveError.value = null

  let programId = Number(form.program)
    if (!programId) {
      try {
        const response = await api.get('/programs/lang/sk') as any
        const all = response ?? []
        const programB = all.find((p: any) => {
          const name = getProgramLabel(p).toLowerCase()
          return name.includes('živá prax') || name.includes('ziva prax') || name.includes('program b')
        })
        programId = programB?.id ?? all[0]?.id ?? 0
      } catch {}
    }

  try {
    if (asDraft) form.status = 'draft'

    const payload = {
      name: form.title,
      description: form.description,
      program_id: programId,
      application_start: form.deadline ? new Date().toISOString() : null,
      application_deadline: form.deadline || null,
      project_start: form.deadline ? new Date().toISOString() : null,
      project_end: form.deadline ? new Date(form.deadline).toISOString() : null,
      budget: form.budget,
      budget_type: form.budget_type,
      max_teams: form.max_teams,
      tech_spec: form.tech_spec,
      tech_tags: form.tech_tags,
      po_email: form.po_email || null,
      language_id: langId.value,
    }

    const response = props.isNew
      ? await api.post('/v1/admin/calls', payload)
      : await api.put(`/v1/admin/calls/${props.initialData?.id}`, payload)

    saveSuccess.value = true
    setTimeout(() => {
      saveSuccess.value = false
    }, 4000)
    emit('saved', (response as any)?.id ?? props.initialData?.id ?? null)
  } catch (error) {
    saveError.value = 'Nastala chyba pri ukladaní.'
  } finally {
    isSaving.value = false
  }
}

const handleSave = () => save(false)
const handleSaveDraft = () => save(true)

// ── Status change ─────────────────────────────────────────────
const handleStatusChange = async (newStatus: string) => {
  if (!props.initialData?.id) return
  isActionLoading.value = true
  try {
    await api.patch(`/v1/calls/${props.initialData.id}/workflow`, {
      state: apiTaskStatusState(newStatus),
    })
    form.status = newStatus
  } catch {
    saveError.value = 'Zmena stavu zlyhala.'
  } finally {
    isActionLoading.value = false
  }
}

// ── Helpers ──────────────────────────────────────────────────
const formatCurrency = (val: number) =>
  new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
</script>
