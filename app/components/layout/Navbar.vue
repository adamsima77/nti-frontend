<template>
<nav class="flex flex-row p-4 md:p-5 bg-navy text-white justify-between shadow-2xl fixed z-100 w-full">
  <div class="shrink-0">
    <NuxtLink to="/">
      <img
        :src="logo"
        class="h-10 md:h-12 lg:h-15 w-auto"
        alt="Nitriansky technický inkubátor"
      />
    </NuxtLink>
  </div>

  
  <ul class="hidden md:flex items-center gap-4 lg:gap-6 whitespace-nowrap
             text-sm md:text-base lg:text-lg">

    <li><NuxtLink to="/" class="text-blue-50 hover:text-blue-500 transition-colors duration-300">Novinky</NuxtLink></li>
    <li><NuxtLink to="/" class="text-blue-50 hover:text-blue-500 transition-colors duration-300">Program A</NuxtLink></li>
    <li><NuxtLink to="/" class="text-blue-50 hover:text-blue-500 transition-colors duration-300">Program B</NuxtLink></li>
    <li><NuxtLink to="/" class="text-blue-50 hover:text-blue-500 transition-colors duration-300">Partneri</NuxtLink></li>
    <li><NuxtLink to="/" class="text-blue-50 hover:text-blue-500 transition-colors duration-300">Výzvy a termíny</NuxtLink></li>

  </ul>

  
  <div class="flex items-center gap-3">

    <NuxtLink to="/" class="hidden md:inline-block">
      <UserCircle class="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 hover:text-blue-500 transition-colors duration-300" />
    </NuxtLink>

    <button @click="toggleSidebar" class="md:hidden">
      <Menu
        v-if="!isSidebarOpen"
        class="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity duration-300 ease-in-out"
      />
    </button>

  </div>
</nav>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(false)
const logo = '/nti-logo.svg'

const emit = defineEmits(['open-sidebar'])
function toggleSidebar() {
  open.value = !open.value
  emit('open-sidebar', open.value)
}

const props = defineProps({
  isSidebarOpen: { type: Boolean, default: false }
})
</script>