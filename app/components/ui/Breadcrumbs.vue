<template>
  <nav
    aria-label="Breadcrumb"
    class="flex items-center gap-1 text-sm"
  >
    <template
      v-for="(item, index) in items"
      :key="index"
    >
      <ChevronRight
        v-if="index > 0"
        class="w-4 h-4 text-gray-400 shrink-0"
      />
      <NuxtLink
        v-if="item.to && index < items.length - 1"
        :to="item.to"
        class="text-gray-500 hover:text-blue-600 transition-colors duration-200 truncate"
      >
        {{ item.label }}
      </NuxtLink>
      <span
        v-else
        class="font-medium text-navy truncate"
      >
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>

<script setup>
import { ChevronRight } from 'lucide-vue-next'

defineProps({
  items: {
    type: Array,
    required: true,
  },
})
</script>
