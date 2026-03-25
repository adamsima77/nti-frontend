<template>
  <footer class="bg-navy text-white p-4 md:p-5 shadow-2xl">

  <div class="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
    <div>
      <NuxtLink to="/">
        <img :src="logo" class="h-10 md:h-12 lg:h-15 w-auto" />
      </NuxtLink>
    </div>

   
    <div class="flex items-center gap-3 whitespace-nowrap
                text-sm md:text-base lg:text-lg text-blue-50">

      <NuxtLink to="/" class="hover:text-blue-500 transition-colors duration-300">
        O NTI
      </NuxtLink>

      <hr class="w-px h-5 bg-gray-500 border-0">

      <NuxtLink to="/kontakt" class="hover:text-blue-500 transition-colors duration-300">
        Kontakt
      </NuxtLink>

    </div>

   
    <div class="flex gap-3 items-center">

      <a href="#" class="text-blue-50 hover:text-blue-500 transition-colors duration-300">
        <Facebook class="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
      </a>

      <a href="#" class="text-blue-50 hover:text-blue-500 transition-colors duration-300">
        <Twitter class="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
      </a>

      <a href="#" class="text-blue-50 hover:text-blue-500 transition-colors duration-300">
        <Linkedin class="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
      </a>

    </div>

  </div>
</footer>
</template>
<script setup>
const logo = '/nti-logo.svg'
</script>