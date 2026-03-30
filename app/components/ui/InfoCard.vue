<template>
  <div class="bg-gray-50 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300">
    <h3 class="text-lg sm:text-xl font-bold text-navy mb-2">{{ title }}</h3>
    <p class="text-gray-500 text-sm sm:text-base">{{ description }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
})
</script>
