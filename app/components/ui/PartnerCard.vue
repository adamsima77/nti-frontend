<template>
  <div
    class="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md p-6 flex flex-col items-center text-center transition"
  >
    <img
      :src="image"
      :alt="alt"
      class="h-14 mb-4 grayscale hover:grayscale-0 transition"
    />
    <h3 class="text-sm font-semibold text-navy">
      {{ name }}
    </h3>
    <p class="mt-2 text-xs text-gray-500 line-clamp-3">
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
})
</script>
