<template>
  <div class="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col">
    
    <div class="flex items-center gap-4 mb-4">
      <img
        :src="image"
        :alt="name"
        class="w-12 h-12 rounded-full object-cover"
      />
      <div>
        <span class="font-medium text-navy text-sm block">{{ name }}</span>
        <span class="text-xs text-gray-500">{{ role }}</span>
      </div>
    </div>

    <p class="text-sm text-gray-600 leading-relaxed">
      “{{ quote }}”
    </p>
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