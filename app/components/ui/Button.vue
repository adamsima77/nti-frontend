<template>
  <button
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200',
      'px-4 py-2.5 text-sm',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses,
      sizeClasses,
      $attrs.class,
    ]"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'outline', 'ghost', 'success', 'danger'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
})

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  success: 'bg-success-500 text-white hover:bg-success-700 focus:ring-success-500',
  danger: 'bg-danger-500 text-white hover:bg-danger-700 focus:ring-danger-500',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

const variantClasses = computed(() => variants[props.variant])
const sizeClasses = computed(() => sizes[props.size])
</script>
