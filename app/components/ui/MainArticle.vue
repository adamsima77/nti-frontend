<template>
  <div class="grid md:grid-cols-2 gap-8 mb-20 bg-gray-50 rounded-2xl overflow-hidden shadow-[0_-10px_30px_rgba(0,0,0,0.08),0_10px_30px_rgba(0,0,0,0.08)]">

    <NuxtLink :to="link">
      <img 
        :src="image"
        :alt="alt"
        class="w-full h-64 md:h-full object-cover cursor-pointer hover:opacity-95 transition-all duration-300 ease-in-out"
      />
    </NuxtLink>

    <div class="flex flex-col justify-center p-6 sm:p-8">
      <NuxtLink :to="link">
        <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold cursor-pointer text-navy mb-4 hover:underline">
          {{ title }}
        </h2>
      </NuxtLink>

      <NuxtLink :to="link" class="text-sm text-blue-600 font-semibold mb-2">
        {{ category }}
      </NuxtLink>

      <p class="text-gray-500 text-base sm:text-lg md:text-xl lg:text-2xl mb-6">
        {{ description }}
      </p>

      <NuxtLink :to="link" class="w-fit cursor-pointer px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
        Čítať viac
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  image: { type: String, required: true },
  alt: { type: String, default: 'Featured article' },
  title: { type: String, required: true },
  category: { type: String, default: '' },
  description: { type: String, required: true },
  link: { type: String, required: true }
})
</script>