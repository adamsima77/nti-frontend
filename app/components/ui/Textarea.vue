<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="`textarea-${id}`" class="text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-danger-500">*</span>
    </label>

    <textarea
      :id="`textarea-${id}`"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :rows="rows"
      :maxlength="maxLength"
      @input="emit('update:modelValue', $event.target.value)"
      @blur="validateInput"
      :class="[
        'px-3 py-2.5 rounded-md border text-sm transition-all duration-200 resize-y',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        'disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500',
        hasError
          ? 'border-danger-300 text-danger-700 focus:ring-danger-500 focus:border-danger-300'
          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
      ]"
    />

    <div v-if="showCount && maxLength" class="text-xs text-gray-400 text-right">
      {{ (modelValue || '').length }} / {{ maxLength }}
    </div>

    <span v-if="hasError" class="text-xs text-danger-600">
      {{ error || validationError || 'Chyba pri vyplnení' }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: String,
  placeholder: String,
  disabled: Boolean,
  required: Boolean,
  error: String,
  validate: Function,
  rows: {
    type: Number,
    default: 4
  },
  maxLength: Number,
  showCount: Boolean
})

const emit = defineEmits(['update:modelValue', 'error'])

const id = Math.random().toString(36).substr(2, 9)
const validationError = ref(null)

const hasError = computed(() => !!props.error || !!validationError.value)

const validateInput = () => {
  validationError.value = null

  if (props.required && !props.modelValue) {
    validationError.value = 'Toto pole je povinné'
    emit('error', validationError.value)
    return
  }

  if (props.validate) {
    const customError = props.validate(props.modelValue)
    if (customError) {
      validationError.value = customError
      emit('error', customError)
    }
  }
}
</script>
