<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="htmlFor" class="text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-danger-500">*</span>
    </label>

    <slot />

    <span v-if="error" class="text-xs text-danger-600">
      {{ error }}
    </span>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  required: Boolean,
  error: String,
  htmlFor: String
})
</script>
