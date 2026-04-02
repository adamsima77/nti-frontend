<template>
  <section class="max-w-4xl mx-auto px-6 py-12">
    <h2
      v-if="data.title"
      class="text-2xl sm:text-3xl font-bold text-navy mb-8"
    >
      {{ data.title }}
    </h2>
    <div class="space-y-3">
      <div
        v-for="(item, index) in data.items"
        :key="index"
        class="border border-gray-200 rounded-lg overflow-hidden"
      >
        <button
          class="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
          @click="toggle(index)"
        >
          <span class="font-medium text-navy pr-4">{{ item.question }}</span>
          <ChevronDown
            class="w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200"
            :class="{ 'rotate-180': openItems.has(index) }"
          />
        </button>
        <Transition name="faq-expand">
          <div
            v-if="openItems.has(index)"
            class="px-6 pb-4"
          >
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div
              class="text-gray-600 leading-relaxed"
              v-html="item.answer"
            />
          </div>
        </Transition>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import type { FaqBlockData } from '~/types/cms'

defineProps<{
  data: FaqBlockData
}>()

const openItems = ref<Set<number>>(new Set())

function toggle(index: number) {
  const next = new Set(openItems.value)
  if (next.has(index)) {
    next.delete(index)
  } else {
    next.add(index)
  }
  openItems.value = next
}
</script>

<style scoped>
.faq-expand-enter-active,
.faq-expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.faq-expand-enter-from,
.faq-expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.faq-expand-enter-to,
.faq-expand-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
