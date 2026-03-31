<template>
  <div class="bg-gray-50 p-6 rounded-2xl shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:shadow-md">
    <img
      :src="image"
      :alt="name"
      class="w-16 h-16 rounded-full mb-4 object-cover"
    />
    <p class="text-gray-700 mb-3">"{{ quote }}"</p>
    <span class="font-semibold text-navy">{{ name }}</span>
    <span class="text-sm text-gray-500">{{ role }}</span>
  </div>
</template>

<script setup>
defineProps({
  image: String,
  name: String,
  role: String,
  quote: String,
});
</script>