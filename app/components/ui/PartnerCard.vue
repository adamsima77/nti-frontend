<template>
  <div class="bg-white rounded-2xl shadow-md hover:shadow-xl p-6 flex flex-col items-center text-center transition-all duration-300">
    <img
      :src="image"
      :alt="alt"
      class="h-16 mb-4 filter grayscale hover:grayscale-0 transition duration-300"
    />
    <h3 class="text-lg font-semibold text-navy">
      {{ name }}
    </h3>
    <p class="mt-2 text-sm text-gray-600">
      {{ description }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  image: String,
  alt: String,
  name: String,
  description: String,
});
</script>