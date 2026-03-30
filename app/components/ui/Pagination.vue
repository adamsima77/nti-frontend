<template>
  <nav
    v-if="totalPages > 1"
    aria-label="Stránkovanie"
    class="flex items-center gap-1"
  >
    <!-- Prev -->
    <button
      :disabled="currentPage <= 1"
      class="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
      aria-label="Predchádzajúca strana"
      @click="emit('update:currentPage', currentPage - 1)"
    >
      <ChevronLeft class="w-4 h-4" />
    </button>

    <!-- Page buttons -->
    <template
      v-for="page in visiblePages"
      :key="page"
    >
      <span
        v-if="page === '...'"
        class="px-2 py-1 text-sm text-gray-400"
      >
        ...
      </span>
      <button
        v-else
        :class="[
          'min-w-[2rem] h-8 px-2 rounded-md text-sm font-medium transition-colors duration-200',
          page === currentPage ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100',
        ]"
        :aria-current="page === currentPage ? 'page' : undefined"
        @click="emit('update:currentPage', page)"
      >
        {{ page }}
      </button>
    </template>

    <!-- Next -->
    <button
      :disabled="currentPage >= totalPages"
      class="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
      aria-label="Nasledujúca strana"
      @click="emit('update:currentPage', currentPage + 1)"
    >
      <ChevronRight class="w-4 h-4" />
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  maxVisible: {
    type: Number,
    default: 5,
  },
})

const emit = defineEmits(['update:currentPage'])

const visiblePages = computed(() => {
  const total = props.totalPages
  const current = props.currentPage
  const max = props.maxVisible

  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages = []
  const half = Math.floor(max / 2)
  let start = Math.max(2, current - half)
  let end = Math.min(total - 1, current + half)

  if (current <= half + 1) {
    end = max - 1
  }
  if (current >= total - half) {
    start = total - max + 2
  }

  pages.push(1)
  if (start > 2) pages.push('...')

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (end < total - 1) pages.push('...')
  pages.push(total)

  return pages
})
</script>
