<template>
  <div v-bind="$attrs">
    <div
      v-for="i in count"
      :key="i"
      class="skeleton"
      :style="{
        width: variant === 'circle'
          ? computedHeight
          : (i === count && variant === 'text' ? '75%' : width),
        height: computedHeight,
        borderRadius: variant === 'circle' ? '9999px' : '10px',
        marginBottom: count > 1 && i < count ? '10px' : undefined,
      }"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'text',
    validator: (v) => ['text', 'circle', 'rect'].includes(v),
  },
  width: { type: String, default: '100%' },
  height: { type: String, default: undefined },
  count: { type: Number, default: 1 },
})

const computedHeight = computed(() => {
  if (props.height) return props.height
  if (props.variant === 'rect') return '3rem'
  if (props.variant === 'circle') return '3rem'
  return '1rem'
})
</script>

<style scoped>
.skeleton {
  display: block;
  width: 100%;
  min-height: 16px;

  /* slightly more gray, still soft */
  background: linear-gradient(
    90deg,
    #dfe3e8 0%,
    #eceff3 50%,
    #dfe3e8 100%
  );

  background-size: 200% 100%;
  background-repeat: no-repeat;

  animation: shimmer 2.8s ease-in-out infinite;

  border-radius: 6px;
  will-change: background-position;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
  }
}
</style>