<template>
  <section
    class="max-w-4xl mx-auto px-6 py-12"
    :class="`text-${data.alignment || 'left'}`"
  >
    <h2
      v-if="data.heading"
      class="text-2xl font-semibold text-navy mb-6"
    >
      {{ data.heading }}
    </h2>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div
      class="prose-content text-gray-800 leading-relaxed"
      v-html="data.content"
    />
  </section>
</template>

<script setup lang="ts">
import type { TextBlockData } from '~/types/cms'

defineProps<{
  data: TextBlockData
}>()
</script>

<style scoped>
.prose-content :deep(h1) {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-navy);
  margin-bottom: 1rem;
}

.prose-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 0.75rem;
}

.prose-content :deep(h3) {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--color-navy);
  margin-bottom: 0.5rem;
}

.prose-content :deep(p) {
  margin-bottom: 1rem;
}

.prose-content :deep(ul),
.prose-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.prose-content :deep(li) {
  margin-bottom: 0.25rem;
}

.prose-content :deep(a) {
  color: var(--color-blue-600);
  text-decoration: underline;
}

.prose-content :deep(a:hover) {
  color: var(--color-blue-500);
}

.prose-content :deep(blockquote) {
  border-left: 4px solid var(--color-blue-600);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--color-gray-500);
  font-style: italic;
}
</style>
