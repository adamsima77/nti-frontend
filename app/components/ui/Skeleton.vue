<template>
  <div
    v-for="i in count"
    :key="i"
    :class="['animate-pulse bg-gray-200', shapeClass]"
    :style="{
      width: variant === 'circle' ? computedHeight : i === count && variant === 'text' ? '75%' : width,
      height: computedHeight,
    }"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'circle', 'rect'].includes(value),
  },
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: undefined,
  },
  count: {
    type: Number,
    default: 1,
  },
})

const computedHeight = computed(() => {
  if (props.height) return props.height
  if (props.variant === 'rect') return '3rem'
  if (props.variant === 'circle') return '3rem'
  return '1rem'
})

const shapeClass = computed(() => {
  if (props.variant === 'circle') return 'rounded-full'
  return 'rounded'
})
</script>
