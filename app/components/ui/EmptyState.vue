<template>
  <div class="text-center py-12">
    <div class="mx-auto mb-3">
      <slot name="icon">
        <component
          :is="icon"
          class="w-12 h-12 text-gray-200 mx-auto"
        />
      </slot>
    </div>
    <h3 class="text-gray-500 font-medium">{{ title }}</h3>
    <p
      v-if="description"
      class="text-sm text-gray-400 mt-1"
    >
      {{ description }}
    </p>
    <div
      v-if="$slots.default"
      class="mt-4"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
import { Inbox } from 'lucide-vue-next'

defineProps({
  icon: {
    type: [Object, Function],
    default: () => Inbox,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: undefined,
  },
})
</script>
