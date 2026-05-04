<template>
  <div class="h-screen flex items-center justify-center bg-navy px-4">
    <div class="max-w-xl w-full text-center">
      <h1 class="text-6xl sm:text-7xl md:text-8xl font-bold text-white mb-4 tracking-tight">
        {{ error.statusCode || '404' }}
      </h1>

      <p class="text-base sm:text-lg md:text-xl text-gray-500 mb-6">
        {{ error.statusMessage || t('error_page.err_message') }}
      </p>

      <div class="w-16 h-1 bg-blue-500 mx-auto mb-8 rounded-full"></div>

      <NuxtLink
        :to="localePath('/')"
        class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition all duration-300 ease-in-out shadow-md text-sm sm:text-base"
      >
        {{ $t('error_page.home_button') }}
      </NuxtLink>

      <p class="mt-6 text-sm sm:text-base text-gray-500">
        {{ $t('error_page.err_desc_1') }}
        <NuxtLink
          :to="localePath('/kontakt')"
          class="text-blue-500 hover:text-blue-600 underline underline-offset-4 transition all duration-300 ease-in-out font-medium"
        >
           {{ $t('error_page.err_desc_2') }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  error: Object,
})

const localePath = useLocalePath()
const { t } = useI18n()
</script>
