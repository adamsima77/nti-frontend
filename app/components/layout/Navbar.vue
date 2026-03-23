<template>
  <nav class="flex flex-row p-5 bg-[var(--color-navy)] text-white justify-between shadow-2xl">
    <div class="shrink-0">
      <NuxtLink to="/">
        <img :src="logo" alt="Nitriansky technický inkubátor" />
      </NuxtLink>
    </div>

    <ul class="hidden md:flex md:flex-row items-center gap-3 whitespace-nowrap">
      <NuxtLink
        to="/"
        class="text-[var(--color-blue-50)] hover:text-[var(--color-blue-500)] cursor-pointer transition-colors duration-300 ease-in-out"
      >
        <li>Novinky</li>
      </NuxtLink>
      <NuxtLink
        to="/"
        class="text-[var(--color-blue-50)] hover:text-[var(--color-blue-500)] cursor-pointer transition-colors duration-300 ease-in-out"
      >
        <li>Program A</li>
      </NuxtLink>
      <NuxtLink
        to="/"
        class="text-[var(--color-blue-50)] hover:text-[var(--color-blue-500)] cursor-pointer transition-colors duration-300 ease-in-out"
      >
        <li>Program B</li>
      </NuxtLink>
      <NuxtLink
        to="/"
        class="text-[var(--color-blue-50)] hover:text-[var(--color-blue-500)] cursor-pointer transition-colors duration-300 ease-in-out"
      >
        <li>Partneri</li>
      </NuxtLink>
      <NuxtLink
        to="/"
        class="text-[var(--color-blue-50)] hover:text-[var(--color-blue-500)] cursor-pointer transition-colors duration-300 ease-in-out"
      >
        <li>Výzvy a termíny</li>
      </NuxtLink>
    </ul>

    <div class="flex items-center gap-3">  
      <NuxtLink to="/" class="hidden md:inline-block">
        <UserCircle class="w-6 h-6 hover:text-[var(--color-blue-500)] transition-colors duration-300" />
      </NuxtLink>

      <button @click="toggleSidebar" class="md:hidden">
        <Menu v-if = "!isSidebarOpen" class="w-6 h-6 text-white hover:opacity-80 transition-opacity duration-300 cursor-pointer" />
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