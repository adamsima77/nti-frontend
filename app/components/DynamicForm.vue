<template>
  <form
    @submit.prevent="handleSubmit"
    class="space-y-8"
  >
    <!-- Sections or flat fields -->
    <div
      v-if="formSchema.sections && formSchema.sections.length"
      v-for="section in formSchema.sections"
      :key="section.title"
      class="space-y-4"
    >
      <!-- Section Header -->
      <div class="pt-6 border-t border-gray-200">
        <h3 class="text-lg font-semibold text-navy mb-1">{{ section.title }}</h3>
        <p
          v-if="section.description"
          class="text-sm text-gray-600"
        >
          {{ section.description }}
        </p>
      </div>

      <!-- Fields in section -->
      <div class="space-y-4">
        <FormField
          v-for="fieldName in section.fields"
          :key="fieldName"
          :field="getFieldByName(fieldName)"
          v-model="formData[fieldName]"
          :error="errors[fieldName]"
          @blur="validateField(fieldName)"
        />
      </div>
    </div>

    <!-- Flat fields (no sections) -->
    <div
      v-else
      class="space-y-4"
    >
      <FormField
        v-for="field in formSchema.fields"
        :key="field.name"
        :field="field"
        v-model="formData[field.name]"
        :error="errors[field.name]"
        @blur="validateField(field.name)"
      />
    </div>

    <!-- Form Actions -->
    <div class="flex gap-3 pt-6 border-t">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
      >
        Zrušiť
      </button>

      <button
        type="button"
        @click="saveDraft"
        :disabled="isSubmitting"
        class="px-6 py-2.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
      >
        💾 Uložiť rozpracovanú
      </button>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 ml-auto"
      >
        <span v-if="!isSubmitting">Odoslať prihlášku</span>
        <span v-else>Odosielajú...</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onUnmounted } from 'vue'
import type { FormSchema, FormField as FormFieldType } from '~/stores/applications'

interface Props {
  formSchema: FormSchema
  initialData?: Record<string, any>
  /** Ak false, automatické ukladanie draftu sa nespúšťa (napr. chýba vybraný tím). */
  draftPersistEnabled?: boolean
}

interface Emits {
  (e: 'cancel'): void
  (e: 'save-draft', data: Record<string, any>): void
  (e: 'submit', data: Record<string, any>): void
}

const props = withDefaults(defineProps<Props>(), {
  draftPersistEnabled: true,
})
const emit = defineEmits<Emits>()

const formData = reactive<Record<string, any>>({})
const errors = reactive<Record<string, string>>({})
const isSubmitting = ref(false)

function coerceFieldValue(field: FormFieldType, raw: unknown): unknown {
  if (field.type === 'repeater') {
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw) as unknown
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return Array.isArray(raw) ? raw : []
  }
  if (field.type === 'checkbox') {
    if (typeof raw === 'string') {
      const s = raw.toLowerCase()
      return s === '1' || s === 'true' || s === 'yes' || s === 'on'
    }
    return Boolean(raw)
  }
  if (field.type === 'file') {
    if (raw === undefined) {
      return field.allowMultiple ? [] : undefined
    }
    return raw
  }
  if (raw == null) {
    return ''
  }
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
    return String(raw)
  }
  return raw
}

function syncFormFromProps() {
  const initial = props.initialData ?? {}
  for (const key of Object.keys(formData)) {
    delete formData[key]
  }
  for (const field of props.formSchema.fields) {
    const raw = initial[field.name]
    formData[field.name] = coerceFieldValue(field, raw)
  }
}

watch(
  [() => props.formSchema, () => props.initialData],
  () => {
    syncFormFromProps()
  },
  { deep: true, immediate: true },
)

// Setup debounced auto-save (30 seconds)
const { markDirty, lastSaveTime } = useAutoSave({
  debounceMs: 30000,
  onSave: () => {
    if (props.draftPersistEnabled) {
      emit('save-draft', formData)
    }
  },
})

// Watch for changes to trigger auto-save
watch(
  () => formData,
  () => {
    if (props.draftPersistEnabled) {
      markDirty()
    }
  },
  { deep: true },
)

const getFieldByName = (name: string): FormFieldType => {
  const field = props.formSchema.fields.find((f) => f.name === name)
  if (!field) throw new Error(`Field "${name}" not found in schema`)
  return field
}

const validateField = (fieldName: string) => {
  const field = getFieldByName(fieldName)
  if (!field) return

  errors[fieldName] = ''

  const value = formData[fieldName]

  // Required validation (vrátane súborov / document_ids ako pole čísel)
  if (field.required) {
    if (field.type === 'file') {
      const empty =
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0) ||
        (Array.isArray(value) &&
          value.every((x) => !(x instanceof File) && !(typeof x === 'number' && Number.isFinite(x) && x > 0)))
      if (empty) {
        errors[fieldName] = `${field.label} je povinné`
        return
      }
    } else if (field.type === 'repeater') {
      const arr = Array.isArray(value) ? value : []
      if (arr.length === 0) {
        errors[fieldName] = `${field.label}: pridajte aspoň jeden riadok`
        return
      }
    } else if (!value) {
      errors[fieldName] = `${field.label} je povinné`
      return
    }
  }

  // Length validation
  if (field.minLength && typeof value === 'string' && value.length < field.minLength) {
    errors[fieldName] = `Minimálne ${field.minLength} znakov`
    return
  }

  if (field.maxLength && typeof value === 'string' && value.length > field.maxLength) {
    errors[fieldName] = `Maximum ${field.maxLength} znakov`
    return
  }

  // Email validation
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      errors[fieldName] = 'Neplatný email'
      return
    }
  }

  // Custom validation
  if (field.validation && !field.validation(value)) {
    errors[fieldName] = field.validation.message || 'Chyba pri validácii'
  }
}

const validateForm = (): boolean => {
  let isValid = true

  props.formSchema.fields.forEach((field) => {
    validateField(field.name)
    if (errors[field.name]) {
      isValid = false
    }
  })

  return isValid
}

const saveDraft = () => {
  emit('save-draft', formData)
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    emit('submit', formData)
  } finally {
    isSubmitting.value = false
  }
}

// Cleanup on unmount
onUnmounted(() => {
  // Auto-save cleanup is handled by useAutoSave composable
})
</script>
