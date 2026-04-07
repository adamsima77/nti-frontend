<template>
  <form @submit.prevent="handleSubmit" class="space-y-8">
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
        <p v-if="section.description" class="text-sm text-gray-600">{{ section.description }}</p>
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
    <div v-else class="space-y-4">
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
}

interface Emits {
  (e: 'cancel'): void
  (e: 'save-draft', data: Record<string, any>): void
  (e: 'submit', data: Record<string, any>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formData = reactive<Record<string, any>>({})
const errors = reactive<Record<string, string>>({})
const isSubmitting = ref(false)

// Initialize form data
if (props.initialData) {
  Object.assign(formData, props.initialData)
}

// Setup debounced auto-save (30 seconds)
const { markDirty, lastSaveTime } = useAutoSave({
  debounceMs: 30000,
  onSave: () => {
    emit('save-draft', formData)
  },
})

// Watch for changes to trigger auto-save
watch(
  () => formData,
  () => {
    markDirty()
  },
  { deep: true }
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

  // Required validation
  if (field.required && !formData[fieldName]) {
    errors[fieldName] = `${field.label} je povinné`
    return
  }

  const value = formData[fieldName]

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
