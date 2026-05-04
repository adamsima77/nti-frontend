<!-- components/FormField.vue -->
<template>
  <div>
    <label class="block text-xs font-semibold text-slate-500 mb-1.5">
      {{ label }}
      <span v-if="hint" class="font-normal text-slate-400">({{ hint }})</span>
    </label>
    <div
      class="flex items-center border rounded-xl bg-white transition-all duration-200"
      :class="{
        'border-slate-200': !touched[field],
        'border-green-400 bg-green-50 ring-2 ring-green-100': touched[field] && isValid(field),
        'border-red-400 bg-red-50 ring-2 ring-red-100': touched[field] && !isValid(field),
      }"
    >
      <input
        :type="type ?? 'text'"
        :value="modelValue"
        :placeholder="placeholder"
        :maxlength="maxlength"
        class="flex-1 px-3.5 py-2.5 text-sm text-slate-800 bg-transparent rounded-xl focus:outline-none"
        :class="{ 'font-mono': mono }"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value); $emit('touch', field)"
      />
      <span
        v-if="touched[field]"
        class="pr-3 text-sm font-bold w-7 text-right"
        :class="isValid(field) ? 'text-green-500' : 'text-red-500'"
      >
        {{ isValid(field) ? '✓' : '✗' }}
      </span>
    </div>
    <p v-if="error && touched[field] && !isValid(field)" class="text-xs text-red-500 mt-1">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  label: string
  hint?: string
  placeholder?: string
  type?: string
  field: string
  maxlength?: number
  mono?: boolean
  error?: string
  touched: Record<string, boolean>
  isValid: (field: string) => boolean
}>()
defineEmits(['update:modelValue', 'touch'])
</script>