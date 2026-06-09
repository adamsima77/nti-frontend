<template>
  <div
    class="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md p-5 flex items-start h-full gap-4 transition"
  >
    <div class="w-12 h-12 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-sm text-slate-500">
      <template v-if="image">
        <img
          :src="image"
          :alt="alt"
          class="w-full h-full object-cover"
        />
      </template>
      <span v-else>
        {{ initials }}
      </span>
    </div>

    <div class="min-w-0">
      <h3 class="text-sm font-medium text-navy truncate">
        {{ name }}
      </h3>
      <p class="text-xs text-gray-500">
        {{ role }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  image: { type: String },
  alt: { type: String, default: '' },
  name: { type: String, required: true },
  role: { type: String, required: true },
})

const initials = computed(() => {
  return props.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
})
</script>
