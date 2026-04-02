<template>
  <section class="py-12 px-6">
    <h2
      v-if="data.title"
      class="text-2xl sm:text-3xl font-bold text-navy mb-10 text-center md:text-left"
    >
      {{ data.title }}
    </h2>
    <div
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 justify-items-center md:justify-items-start gap-6 sm:gap-8 md:gap-10"
    >
      <a
        v-for="(partner, index) in data.partners"
        :key="index"
        :href="partner.website || undefined"
        :target="partner.website ? '_blank' : undefined"
        :rel="partner.website ? 'noopener noreferrer' : undefined"
        class="flex items-center justify-center"
        :title="partner.name"
      >
        <img
          :src="partner.logoUrl"
          :alt="partner.name"
          class="h-16 sm:h-18 md:h-20 filter grayscale hover:grayscale-0 transition duration-300 object-contain"
        />
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PartnersBlockData } from '~/types/cms'

defineProps<{
  data: PartnersBlockData
}>()
</script>
