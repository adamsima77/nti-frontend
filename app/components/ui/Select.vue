<template>
  <div class="flex flex-col gap-1.5">
    <label
      v-if="label"
      :for="id"
      class="text-sm font-medium text-gray-700"
    >
      {{ label }}
      <span
        v-if="required"
        class="text-danger-500"
      >*</span>
    </label>

    <div class="relative">
      <select
        :id="id"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :class="[
          'w-full px-3 py-2.5 rounded-md border text-sm transition-all duration-200 appearance-none pr-10',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500',
          hasError
            ? 'border-danger-300 text-danger-700 focus:ring-danger-500 focus:border-danger-300'
            : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500',
        ]"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        @blur="validateInput"
      >
        <option
          value=""
          disabled
        >
          {{ placeholder }}
        </option>
        <option
          v-for="opt in normalizedOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>

      <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>

    <span
      v-if="hasError"
      class="text-xs text-danger-600"
    >
      {{ error || validationError || 'Chyba pri vyplnení' }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useId } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  label: String,
  placeholder: {
    type: String,
    default: 'Vyberte...',
  },
  disabled: Boolean,
  required: Boolean,
  error: String,
  validate: Function,
})

const emit = defineEmits(['update:modelValue', 'error'])

// Swapped Math.random() out for Nuxt/Vue secure useId()
const id = useId()
const validationError = ref<string | null>(null)

const hasError = computed(() => !!props.error || !!validationError.value)

const normalizedOptions = computed(() =>
  props.options.map((opt: any) => (typeof opt === 'string' ? { value: opt, label: opt } : opt)),
)

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