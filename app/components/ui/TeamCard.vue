<template>
  <div
    class="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md p-5 flex items-center gap-4 transition"
  >
    <img
      :src="image"
      :alt="alt"
      class="w-12 h-12 rounded-full object-cover"
    />

    <div class="min-w-0">
      <h3 class="text-sm font-medium text-navy truncate">
        {{ name }}
      </h3>
      <p class="text-xs text-gray-500">
        {{ role }}
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  image: { type: String, required: true },
  alt: { type: String, default: '' },
  name: { type: String, required: true },
  role: { type: String, required: true },
})
</script>
