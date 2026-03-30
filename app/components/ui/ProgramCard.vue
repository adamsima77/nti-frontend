<template>
  <div
    class="bg-white rounded-2xl shadow-xl p-8 sm:p-10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full"
  >
    <h3 class="text-lg sm:text-xl md:text-2xl font-bold text-blue-700 mb-3">{{ props.title }}</h3>
    <p class="text-sm sm:text-base md:text-lg text-gray-500 mb-4 md:mb-6 flex-1">{{ props.description }}</p>
    <NuxtLink
      href="#"
      class="text-blue-500 font-bold hover:underline mt-2 md:mt-0"
      >Viac info →</NuxtLink
    >
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  description: String,
})
</script>
