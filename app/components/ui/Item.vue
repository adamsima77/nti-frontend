<template>
  <div class="bg-gray-50 rounded-2xl shadow-[0_-8px_20px_rgba(0,0,0,0.06),0_8px_20px_rgba(0,0,0,0.06)] p-6 sm:p-8 flex flex-col h-full">
    <img 
      :src="image"
      :alt="alt"
      class="rounded-lg mb-4 sm:mb-5 hover:opacity-90 shadow-lg transition-opacity duration-300 ease-in-out cursor-pointer"
    />

    <div class="flex-1 flex flex-col justify-between">
      <NuxtLink :to="link">
        <h3 class="text-lg sm:text-xl md:text-xl font-bold text-blue-700 mb-2 hover:underline">
          {{ title }}
        </h3>
      </NuxtLink>
      <NuxtLink to="" class="text-sm text-blue-600 font-semibold mb-2">{{ category }}</NuxtLink>
      <p class="text-sm sm:text-base md:text-base text-gray-500">
        {{ description }}
      </p>

      <NuxtLink :to="link" class="mt-3 text-blue-500 font-bold hover:underline">
        Čítať viac →
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  description: String,
  category: String,
  image: String,
  alt: String,
  link: String
})
</script>