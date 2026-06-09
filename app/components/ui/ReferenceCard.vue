<template>
  <div class="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col">
    <div class="flex items-center gap-4 mb-4">
      <div class="w-12 h-12 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-sm text-slate-500">
        <template v-if="image">
          <img
            :src="image"
            :alt="name"
            class="w-full h-full object-cover"
          />
        </template>
        <span v-else>
          {{ initials }}
        </span>
      </div>
      <div>
        <span class="font-medium text-navy text-sm block">{{ name }}</span>
        <span class="text-xs text-gray-500">{{ role }}</span>
      </div>
    </div>

    <p class="text-sm text-gray-600 leading-relaxed">“{{ quote }}”</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  image: String,
  name: String,
  role: String,
  quote: String,
})

const initials = computed(() => {
  if (!props.name) return ''
  return props.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
})
</script>
