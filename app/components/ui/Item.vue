<template>
  <div
    class="bg-gray-50 rounded-2xl shadow-[0_-8px_20px_rgba(0,0,0,0.06),0_8px_20px_rgba(0,0,0,0.06)] p-6 sm:p-8 flex flex-col h-full"
  >
    <div class="rounded-lg mb-4 sm:mb-5 overflow-hidden bg-slate-100">
      <template v-if="image">
        <img
          :src="image"
          :alt="alt"
          class="w-full h-52 sm:h-56 object-cover hover:opacity-90 shadow-lg transition-opacity duration-300 ease-in-out cursor-pointer"
        />
      </template>
      <div v-else class="w-full h-52 sm:h-56 flex items-center justify-center text-sm text-slate-500">
        {{ $t ? $t('news.image_not_available') : 'Image not available' }}
      </div>
    </div>

    <div class="flex-1 flex flex-col justify-between">
      <NuxtLink :to="link">
        <h3 class="text-lg sm:text-xl md:text-xl font-bold text-blue-700 mb-2 hover:underline">
          {{ title }}
        </h3>
      </NuxtLink>
      <NuxtLink
        to=""
        class="text-sm text-blue-600 font-semibold mb-2"
        >{{ category }}</NuxtLink
      >

     <p class="text-lg text-gray-600 mb-4">
  {{ (main_description ?? '').substring(0, 250) + (main_description?.length > 250 ? '...' : '') }}
</p>

      <NuxtLink
        :to="link"
        class="mt-3 text-blue-500 font-bold hover:underline"
      >
        {{ $t('news.read_more') }} →
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
  main_description: { type: String, default: '' },
  alt: String,
  link: String,
})
</script>
