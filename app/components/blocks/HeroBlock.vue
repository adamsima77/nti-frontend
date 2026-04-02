<template>
  <div
    class="relative bg-blue-500 text-white py-24 sm:py-28 md:py-32 px-6 md:px-20 overflow-hidden rounded-lg shadow-2xl"
    :style="
      data.backgroundImage
        ? { backgroundImage: `url(${data.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {}
    "
  >
    <div class="relative z-10 md:flex md:items-center md:justify-between gap-12">
      <div class="md:w-1/2 space-y-6">
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
          {{ data.title }}
        </h1>
        <p class="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80">
          {{ data.description }}
        </p>
        <div
          v-if="data.primaryCtaText || data.secondaryCtaText"
          class="flex flex-col md:flex-row gap-4 mt-6 sm:mt-8"
        >
          <NuxtLink
            v-if="data.primaryCtaText && data.primaryCtaLink"
            :to="data.primaryCtaLink"
            class="bg-white text-blue-600 py-4 px-8 sm:px-10 rounded-full font-bold shadow-lg hover:bg-blue-50 transition-all duration-300 ease-in-out text-center"
          >
            {{ data.primaryCtaText }}
          </NuxtLink>
          <NuxtLink
            v-if="data.secondaryCtaText && data.secondaryCtaLink"
            :to="data.secondaryCtaLink"
            class="border-2 border-white text-white py-4 px-8 sm:px-10 rounded-full font-bold hover:bg-white hover:text-blue-600 transition-all text-center"
          >
            {{ data.secondaryCtaText }}
          </NuxtLink>
        </div>
      </div>
      <div class="md:w-1/2 relative flex justify-center md:justify-end mt-10 md:mt-0">
        <div class="absolute w-64 sm:w-72 md:w-80 h-64 sm:h-72 md:h-80 bg-white/10 rounded-full -top-12 -right-12" />
      </div>
    </div>
    <div
      class="absolute inset-0 bg-linear-to-b from-blue-500/70 to-blue-700/70 mix-blend-multiply pointer-events-none"
    />
  </div>
</template>

<script setup lang="ts">
import type { HeroBlockData } from '~/types/cms'

defineProps<{
  data: HeroBlockData
}>()
</script>
