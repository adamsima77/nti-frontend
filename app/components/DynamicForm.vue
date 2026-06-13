<template>
  <div :class="readonly ? 'space-y-6' : 'space-y-6'">

    <div v-if="!readonly && formError" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
      {{ formError }}
    </div>

    <div class="space-y-5">
      <div
        v-for="field in schema.fields"
        :key="field.name"
        class="space-y-1.5"
      >
        <label :for="`field-${field.name}`" class="block text-sm font-medium text-navy">
          {{ field.label }}
          <span v-if="!readonly && field.required" class="text-red-500 ml-0.5">*</span>
        </label>

        <p v-if="field.help_text" class="text-xs text-gray-500 -mt-0.5">{{ field.help_text }}</p>

        <template v-if="readonly">

          <div v-if="field.type === 'file'">
            <div
              v-if="resolvedFileIds(field.name).length"
              class="flex flex-wrap gap-2"
            >
              <span
                v-for="docId in resolvedFileIds(field.name)"
                :key="docId"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-700"
              >
                <FileText class="w-3.5 h-3.5 flex-shrink-0" />
                Príloha #{{ docId }}
              </span>
            </div>
            <p v-else class="text-sm text-gray-400 italic">—</p>
          </div>

          <div v-else-if="field.type === 'checkbox'">
            <p class="text-sm text-navy">
              {{ Array.isArray(formData[field.name]) && formData[field.name].length
                ? (formData[field.name] as string[]).join(', ')
                : '—' }}
            </p>
          </div>

          <p
            v-else-if="field.type === 'textarea'"
            class="text-sm text-navy whitespace-pre-wrap min-h-[2rem] bg-gray-50 border border-gray-100 rounded-lg px-3 py-2"
          >{{ formData[field.name] || '—' }}</p>

          <p v-else class="text-sm text-navy bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 min-h-[2.25rem] flex items-center">
            {{ formData[field.name] || '—' }}
          </p>

        </template>

        <template v-else>

          <input
            :id="`field-${field.name}`"
            v-if="field.type === 'text'"
            v-model="formData[field.name]"
            type="text"
            :placeholder="field.placeholder || ''"
            :class="inputClass(field.name)"
            @blur="validateField(field)"
          />

          <input
            :id="`field-${field.name}`"
            v-else-if="field.type === 'email'"
            v-model="formData[field.name]"
            type="email"
            :placeholder="field.placeholder || ''"
            :class="inputClass(field.name)"
            @blur="validateField(field)"
          />

          <input
            :id="`field-${field.name}`"
            v-else-if="field.type === 'number'"
            v-model.number="formData[field.name]"
            type="number"
            :placeholder="field.placeholder || ''"
            :class="inputClass(field.name)"
            @blur="validateField(field)"
          />

          <input
            :id="`field-${field.name}`"
            v-else-if="field.type === 'date'"
            v-model="formData[field.name]"
            type="date"
            :class="inputClass(field.name)"
            @blur="validateField(field)"
          />

          <textarea
            :id="`field-${field.name}`"
            v-else-if="field.type === 'textarea'"
            v-model="formData[field.name]"
            rows="4"
            :placeholder="field.placeholder || ''"
            :class="[inputClass(field.name), 'resize-none']"
            @blur="validateField(field)"
          />

          <select
            :id="`field-${field.name}`"
            v-else-if="field.type === 'select'"
            v-model="formData[field.name]"
            :class="[inputClass(field.name), 'bg-white']"
            @blur="validateField(field)"
            @change="validateField(field)"
          >
            <option value="" disabled>Vyberte možnosť…</option>
            <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <div v-else-if="field.type === 'radio'" class="space-y-2 pt-0.5">
            <label
              v-for="opt in field.options"
              :key="opt"
              class="flex items-center gap-2.5 cursor-pointer"
            >
              <input
                v-model="formData[field.name]"
                type="radio"
                :value="opt"
                :name="field.name"
                class="accent-blue-600"
                @change="validateField(field)"
              />
              <span class="text-sm text-navy">{{ opt }}</span>
            </label>
          </div>

          <div v-else-if="field.type === 'checkbox'" class="space-y-2 pt-0.5">
            <label
              v-for="opt in field.options"
              :key="opt"
              class="flex items-center gap-2.5 cursor-pointer"
            >
              <input
                type="checkbox"
                :value="opt"
                :checked="Array.isArray(formData[field.name]) && formData[field.name].includes(opt)"
                class="accent-blue-600"
                @change="onCheckboxChange(field.name, opt, ($event.target as HTMLInputElement).checked)"
              />
              <span class="text-sm text-navy">{{ opt }}</span>
            </label>
          </div>

          <div v-else-if="field.type === 'file'" class="space-y-2">
            <div
              :class="[
                'relative rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors',
                uploadingFiles[field.name]
                  ? 'border-blue-300 bg-blue-50/50 cursor-wait'
                  : isDragging[field.name]
                    ? 'border-blue-400 bg-blue-50 cursor-copy'
                    : errors[field.name]
                      ? 'border-red-300 bg-red-50/30 cursor-pointer'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer',
              ]"
              @click="!uploadingFiles[field.name] && triggerFileInput(field.name)"
              @dragover.prevent="isDragging[field.name] = true"
              @dragleave="isDragging[field.name] = false"
              @drop.prevent="onFileDrop(field, $event)"
            >
              <input
                :ref="(el) => { fileInputs[field.name] = el as HTMLInputElement }"
                type="file"
                :accept="field.accept || undefined"
                class="sr-only"
                @change="onFileChange(field, $event)"
              />
              <div v-if="uploadingFiles[field.name]" class="flex flex-col items-center gap-2">
                <span class="w-5 h-5 border-2 border-blue-400/40 border-t-blue-500 rounded-full animate-spin" />
                <p class="text-sm text-blue-600">Nahrávam súbor…</p>
              </div>
              <div v-else>
                <Paperclip class="w-6 h-6 mx-auto text-gray-300 mb-1.5" />
                <p class="text-sm text-gray-500">Kliknite alebo presuňte súbor sem</p>
                <p v-if="field.accept" class="text-xs text-gray-400 mt-1">{{ field.accept }}</p>
              </div>
            </div>

            <div
              v-if="selectedFiles[field.name] || resolvedFileIds(field.name).length"
              class="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100"
            >
              <FileText class="w-4 h-4 text-blue-500 flex-shrink-0" />
              
              <span v-if="selectedFiles[field.name]" class="text-sm text-navy flex-1 truncate">
                {{ selectedFiles[field.name]!.name }}
              </span>
              <span v-else class="text-sm text-navy flex-1 truncate">
                Príloha #{{ resolvedFileIds(field.name).join(', ') }}
              </span>

              <span v-if="selectedFiles[field.name]" class="text-xs text-gray-400 flex-shrink-0">
                {{ formatFileSize(selectedFiles[field.name]!.size) }}
              </span>
              
              <button
                type="button"
                class="text-gray-400 hover:text-red-500 transition-colors"
                @click.stop="clearFile(field.name)"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </template>

        <p v-if="!readonly && errors[field.name]" class="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle class="w-3 h-3 flex-shrink-0" />
          {{ errors[field.name] }}
        </p>
      </div>
    </div>

    <div v-if="!readonly" class="flex items-center gap-3 pt-4 border-t border-gray-100">
      <button
        type="button"
        class="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        @click="emit('cancel')"
      >
        Zrušiť
      </button>

      <button
        v-if="draftPersistEnabled"
        type="button"
        :disabled="isSubmitting"
        class="px-5 py-2.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
        @click="saveDraft"
      >
        Uložiť ako rozpracovanú
      </button>

      <button
        type="button"
        :disabled="isSubmitting"
        class="ml-auto px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
        @click="handleSubmit"
      >
        <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        {{ isSubmitting ? 'Odosiela sa…' : submitLabel }}
      </button>
    </div>

    <p v-if="!readonly && lastSaved" class="text-xs text-gray-400 text-right -mt-3">
      Automaticky uložené o {{ lastSaved }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onUnmounted } from 'vue'
import { Paperclip, FileText, X, AlertCircle } from 'lucide-vue-next'

// ── Types ──────────────────────────────────────────────────────────────────

type FieldType = 'text' | 'textarea' | 'number' | 'email' | 'select' | 'radio' | 'checkbox' | 'date' | 'file'

export interface SchemaField {
  id: string
  type: FieldType
  label: string
  name: string
  placeholder?: string
  required?: boolean
  help_text?: string
  options?: string[]
  accept?: string
}

export interface FormSchema {
  fields: SchemaField[]
}

// ── Props / emits ──────────────────────────────────────────────────────────

const props = withDefaults(defineProps<{
  formSchema: FormSchema
  initialData?: Record<string, any>
  /**
   * When true, all fields render as plain text (no inputs, no submit button).
   * Used when application is locked (e.g. status = Podané).
   */
  readonly?: boolean
  /**
   * Label for the primary action button. Defaults to "Odoslať prihlášku".
   * Set to "Odoslať doplnenie" on the supplement re-submit flow.
   */
  submitLabel?: string
  /** Disable auto-draft save (e.g. team not yet selected) */
  draftPersistEnabled?: boolean
}>(), {
  readonly: false,
  submitLabel: 'Odoslať prihlášku',
  draftPersistEnabled: true,
})

const emit = defineEmits<{
  cancel: []
  'save-draft': [data: Record<string, any>]
  submit: [data: Record<string, any>]
}>()

// ── Composables ────────────────────────────────────────────────────────────

const api = useApi()

// ── State ──────────────────────────────────────────────────────────────────

const schema = computed(() => props.formSchema)

const formData     = reactive<Record<string, any>>({})
const errors       = reactive<Record<string, string>>({})
const formError    = ref<string | null>(null)
const isSubmitting = ref(false)
const lastSaved    = ref<string | null>(null)

// File handling
const selectedFiles  = reactive<Record<string, File | null>>({})
const fileInputs     = reactive<Record<string, HTMLInputElement | null>>({})
const isDragging     = reactive<Record<string, boolean>>({})
const uploadingFiles = reactive<Record<string, boolean>>({})

// ── Schema / initial data sync ─────────────────────────────────────────────

function initFormData() {
  const initial = props.initialData ?? {}

  Object.keys(formData).forEach((k) => delete formData[k])
  Object.keys(selectedFiles).forEach((k) => { selectedFiles[k] = null })
  Object.keys(errors).forEach((k) => delete errors[k])

  for (const field of schema.value.fields) {
    const raw = initial[field.name]

    if (field.type === 'checkbox') {
      if (Array.isArray(raw)) {
        formData[field.name] = [...raw]
      } else if (typeof raw === 'string') {
        try { formData[field.name] = JSON.parse(raw) } catch { formData[field.name] = [] }
      } else {
        formData[field.name] = []
      }
    } else if (field.type === 'file') {
      // Stored as document ID (number) or JSON string of IDs from a previous draft
      formData[field.name] = raw !== undefined && raw !== '' ? raw : null
      selectedFiles[field.name] = null
      isDragging[field.name] = false
      uploadingFiles[field.name] = false
    } else if (field.type === 'number') {
      formData[field.name] = raw !== undefined && raw !== '' ? Number(raw) : ''
    } else {
      formData[field.name] = raw !== undefined ? String(raw) : ''
    }
  }
}

watch([schema, () => props.initialData], initFormData, { deep: true, immediate: true })

// ── Readonly helper: resolve document IDs from stored value ─────────────────

function resolvedFileIds(fieldName: string): number[] {
  const val = formData[fieldName]
  if (val == null || val === '') return []
  if (typeof val === 'number') return val > 0 ? [val] : []
  if (Array.isArray(val)) return val.map(Number).filter((n) => n > 0)
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed)) return parsed.map(Number).filter((n: number) => n > 0)
      if (typeof parsed === 'number' && parsed > 0) return [parsed]
    } catch {
      if (/^\d+$/.test(val)) return [Number(val)]
    }
  }
  return []
}

// ── File upload helpers ────────────────────────────────────────────────────

function triggerFileInput(name: string) {
  fileInputs[name]?.click()
}

function onFileChange(field: SchemaField, event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) uploadFile(field, file)
}

function onFileDrop(field: SchemaField, event: DragEvent) {
  isDragging[field.name] = false
  const file = event.dataTransfer?.files[0]
  if (file) uploadFile(field, file)
}

/**
 * Upload the file to POST /documents.
 * Backend creates Document + DocumentVersion records and returns the document ID.
 * The ID is stored in formData so it's ready for serialisation on draft save / submit.
 */
async function uploadFile(field: SchemaField, file: File) {
  if (field.accept) {
    const allowed = field.accept.split(',').map((s) => s.trim().toLowerCase())
    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '')
    const mime = file.type.toLowerCase()
    if (!allowed.some((a) => a === ext || (a.endsWith('/*') && mime.startsWith(a.replace('*', ''))))) {
      errors[field.name] = `Nepodporovaný formát. Povolené: ${field.accept}`
      return
    }
  }

  uploadingFiles[field.name] = true
  delete errors[field.name]

  try {
    const payload = new FormData()
    payload.append('file', file)


    if (field.accept) {
      const cleanAccept = field.accept.replace(/[\s.]/g, '')
      payload.append('accept', cleanAccept)
    }

    // Backend teraz v $request->input('accept') dostane napr. "pdf,docx,xls"
    const response = await api.post<{ document_id: number }>('/documents', payload)

    selectedFiles[field.name] = file
    formData[field.name] = response.document_id
  } catch (err: any) {
    const msg =
      err?.data?.errors?.file?.[0] ??
      err?.data?.message ??
      'Nepodarilo sa nahrať súbor. Skúste znova.'
    errors[field.name] = msg
  } finally {
    uploadingFiles[field.name] = false
  }
}

function clearFile(name: string) {
  selectedFiles[name] = null
  formData[name] = null
  if (fileInputs[name]) fileInputs[name]!.value = ''
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// ── Checkbox helpers ───────────────────────────────────────────────────────

function onCheckboxChange(name: string, value: string, checked: boolean) {
  if (!Array.isArray(formData[name])) formData[name] = []
  if (checked) {
    if (!formData[name].includes(value)) formData[name].push(value)
  } else {
    formData[name] = formData[name].filter((v: string) => v !== value)
  }
}

// ── Validation ─────────────────────────────────────────────────────────────

function validateField(field: SchemaField): boolean {
  delete errors[field.name]
  const value = formData[field.name]

  if (field.required) {
    const empty =
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (field.type === 'file' && !value)

    if (empty) {
      errors[field.name] = `${field.label} je povinné`
      return false
    }
  }

  if (field.type === 'email' && value && typeof value === 'string') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[field.name] = 'Neplatná e-mailová adresa'
      return false
    }
  }

  return true
}

function validateAll(): boolean {
  formError.value = null
  let valid = true
  for (const field of schema.value.fields) {
    if (!validateField(field)) valid = false
  }
  if (!valid) formError.value = 'Skontrolujte chyby vo formulári.'
  return valid
}

// ── Auto-save ──────────────────────────────────────────────────────────────

let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

function scheduleAutoSave() {
  if (!props.draftPersistEnabled || props.readonly) return
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(() => {
    emit('save-draft', { ...formData })
    lastSaved.value = new Date().toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })
  }, 30_000)
}

watch(() => ({ ...formData }), scheduleAutoSave, { deep: true })

onUnmounted(() => { if (autoSaveTimer) clearTimeout(autoSaveTimer) })

// ── Actions ────────────────────────────────────────────────────────────────

function saveDraft() {
  emit('save-draft', { ...formData })
  lastSaved.value = new Date().toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })
}

async function handleSubmit() {
  if (!validateAll()) return
  isSubmitting.value = true
  try {
    emit('submit', { ...formData })
  } finally {
    isSubmitting.value = false
  }
}

// ── Style helpers ──────────────────────────────────────────────────────────

function inputClass(name: string): string {
  return [
    'w-full rounded-lg border px-3 py-2 text-sm text-navy placeholder-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-blue-300 transition',
    errors[name] ? 'border-red-400 bg-red-50/20' : 'border-gray-200',
  ].join(' ')
}
</script>