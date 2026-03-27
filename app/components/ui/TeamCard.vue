<template>
  <div class="bg-white rounded-2xl shadow-md hover:shadow-xl p-6 flex flex-col items-center transition-all duration-300">
    <img 
      :src="image" 
      :alt="alt" 
      class="shadow-xl w-32 h-32 rounded-full object-cover"
    />
    <h3 class="text-lg sm:text-xl font-bold text-navy mb-1">{{ name }}</h3>
    <p class="text-gray-500 text-sm sm:text-base">{{ role }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  image: { type: String, required: true },
  alt: { type: String, default: '' },
  name: { type: String, required: true },
  role: { type: String, required: true }
})
</script>