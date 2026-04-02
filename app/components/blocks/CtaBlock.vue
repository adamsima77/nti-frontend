<template>
  <section :class="['py-16 px-6 rounded-lg', data.backgroundClass || 'bg-blue-50']">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-2xl sm:text-3xl font-bold text-navy mb-4">
        {{ data.title }}
      </h2>
      <p
        v-if="data.description"
        class="text-gray-600 text-lg mb-8 max-w-2xl mx-auto"
      >
        {{ data.description }}
      </p>
      <UiButton
        :variant="data.variant || 'primary'"
        size="lg"
        @click="navigateTo(data.buttonLink)"
      >
        {{ data.buttonText }}
      </UiButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CtaBlockData } from '~/types/cms'

defineProps<{
  data: CtaBlockData
}>()
</script>
