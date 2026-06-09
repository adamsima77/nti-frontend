<template>
  <div
    class="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md p-6 flex flex-col items-center text-center transition"
  >
    <div class="mb-4 h-14 w-full rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
      <template v-if="image">
        <img
          :src="image"
          :alt="alt"
          class="h-full w-full object-contain"
        />
      </template>
      <div v-else class="h-full w-full flex items-center justify-center text-xs text-slate-500">
        {{ initials }}
      </div>
    </div>
    <h3 class="text-sm font-semibold text-navy">
      {{ name }}
    </h3>
    <p class="mt-2 text-xs text-gray-500 line-clamp-3">
      {{ description }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  image: String,
  alt: String,
  name: String,
  description: String,
})

const initials = computed(() => {
  if (!props.name) return 'NTI'
  return props.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
})
</script>
