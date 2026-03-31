<template>
  <div v-if="field" class="flex flex-col gap-1.5">
    <!-- Label -->
    <label
      v-if="field.label"
      :for="`field-${field.name}`"
      class="text-sm font-medium text-gray-700"
    >
      {{ field.label }}
      <span v-if="field.required" class="text-danger-500">*</span>
    </label>

    <!-- Description -->
    <p v-if="field.description" class="text-xs text-gray-500">
      {{ field.description }}
    </p>

    <!-- Text Input -->
    <input
      v-if="field.type === 'text'"
      :id="`field-${field.name}`"
      type="text"
      :value="modelValue"
      :placeholder="field.placeholder"
      :required="field.required"
      :maxlength="field.maxLength"
      :class="[
        'px-3 py-2.5 rounded-md border text-sm transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        hasError
          ? 'border-danger-300 text-danger-700 focus:ring-danger-500 focus:border-danger-300'
          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500',
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur')"
    />

    <!-- Email Input -->
    <input
      v-if="field.type === 'email'"
      :id="`field-${field.name}`"
      type="email"
      :value="modelValue"
      :placeholder="field.placeholder"
      :required="field.required"
      :class="[
        'px-3 py-2.5 rounded-md border text-sm transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        hasError
          ? 'border-danger-300 text-danger-700 focus:ring-danger-500 focus:border-danger-300'
          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500',
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur')"
    />

    <!-- Number Input -->
    <input
      v-if="field.type === 'number'"
      :id="`field-${field.name}`"
      type="number"
      :value="modelValue"
      :placeholder="field.placeholder"
      :required="field.required"
      :class="[
        'px-3 py-2.5 rounded-md border text-sm transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        hasError
          ? 'border-danger-300 text-danger-700 focus:ring-danger-500 focus:border-danger-300'
          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500',
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur')"
    />

    <!-- Date Input -->
    <input
      v-if="field.type === 'date'"
      :id="`field-${field.name}`"
      type="date"
      :value="modelValue"
      :required="field.required"
      :class="[
        'px-3 py-2.5 rounded-md border text-sm transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        hasError
          ? 'border-danger-300 text-danger-700 focus:ring-danger-500 focus:border-danger-300'
          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500',
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur')"
    />

    <!-- Textarea -->
    <textarea
      v-if="field.type === 'textarea'"
      :id="`field-${field.name}`"
      :value="modelValue"
      :placeholder="field.placeholder"
      :required="field.required"
      :rows="5"
      :maxlength="field.maxLength"
      :class="[
        'px-3 py-2.5 rounded-md border text-sm transition-all duration-200 resize-y',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        hasError
          ? 'border-danger-300 text-danger-700 focus:ring-danger-500 focus:border-danger-300'
          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500',
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @blur="$emit('blur')"
    />

    <!-- Select -->
    <div v-if="field.type === 'select'" class="relative">
      <select
        :id="`field-${field.name}`"
        :value="modelValue"
        :required="field.required"
        :class="[
          'w-full px-3 py-2.5 rounded-md border text-sm transition-all duration-200 appearance-none pr-10',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          hasError
            ? 'border-danger-300 text-danger-700 focus:ring-danger-500 focus:border-danger-300'
            : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500',
        ]"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        @blur="$emit('blur')"
      >
        <option value="" disabled :selected="!modelValue">
          {{ field.placeholder || 'Vyberte...' }}
        </option>
        <option
          v-for="opt in field.options"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
      <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>

    <!-- Checkbox -->
    <div v-if="field.type === 'checkbox'" class="flex items-center gap-2">
      <input
        :id="`field-${field.name}`"
        type="checkbox"
        :checked="modelValue"
        :class="[
          'w-4 h-4 rounded border-gray-300 cursor-pointer',
          hasError ? 'border-danger-300 text-danger-500' : 'text-blue-600',
        ]"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
        @blur="$emit('blur')"
      />
      <label :for="`field-${field.name}`" class="text-sm text-gray-700 cursor-pointer">
        {{ field.label }}
      </label>
    </div>

    <!-- File Input -->
    <input
      v-if="field.type === 'file'"
      :id="`field-${field.name}`"
      type="file"
      :required="field.required"
      :class="[
        'px-3 py-2.5 rounded-md border text-sm transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        'file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-600',
        hasError
          ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-300'
          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500',
      ]"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).files?.[0])"
      @blur="$emit('blur')"
    />

    <!-- Error Message -->
    <span v-if="hasError" class="text-xs text-danger-600">
      {{ error || 'Chyba pri vyplnení' }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import type { FormField } from '~/stores/applications'

interface Props {
  field: FormField
  modelValue: any
  error?: string
}

interface Emits {
  (e: 'update:modelValue', value: any): void
  (e: 'blur'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const hasError = computed(() => !!props.error)
</script>
