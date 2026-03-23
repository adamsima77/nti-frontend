<template>
<div
  class="fixed top-0 left-0 h-screen w-85 bg-[var(--color-navy)] text-white p-5 shadow-2xl
         transform transition-transform duration-500 ease-out flex flex-col gap-5"
  :class="props.isOpen ? 'translate-x-0' : '-translate-x-full'">
        <div class = "shrink-0 flex flex-row justify-between">
            <NuxtLink to = "/"><img :src="logo" class = "" alt="Nitriansky technický inkubátor"></NuxtLink>
            <button @click="toggleSidebar" class="md:hidden">
             <X @click = "$emit('close-sidebar')" class="w-6 h-6 text-white hover:opacity-80 transition-opacity duration-300 cursor-pointer" />
            </button>
        </div>
        <div class = "flex items-center">
            <NuxtLink to="/" class="inline-block">
            <UserCircle class="w-6 h-6 hover:text-[var(--color-blue-500)] transition-colors"/></NuxtLink>
        </div>

         <ul class = "gap-4 flex flex-col">
            <NuxtLink to = "" class = "text-[var(--color-blue-50)] hover:text-[var(--color-blue-500)] cursor-pointer transition text-color duration-300 ease-in-out"><li>Novinky</li></NuxtLink>
            <NuxtLink to = "" class = "text-[var(--color-blue-50)] hover:text-[var(--color-blue-500)] cursor-pointer transition text-color duration-300 ease-in-out"> <li>Program A</li></NuxtLink>
            <NuxtLink to = "" class = "text-[var(--color-blue-50)] hover:text-[var(--color-blue-500)] cursor-pointer transition text-color duration-300 ease-in-out"> <li>Program B</li></NuxtLink>
             <NuxtLink to = "" class = "text-[var(--color-blue-50)] hover:text-[var(--color-blue-500)] cursor-pointer transition text-color duration-300 ease-in-out"><li>Partneri</li></NuxtLink>
             <NuxtLink to = "" class = "text-[var(--color-blue-50)] hover:text-[var(--color-blue-500)] cursor-pointer transition text-color duration-300 ease-in-out"><li>Výzvy a termíny</li></NuxtLink>
        </ul>
    </div>
</template>

<script setup>
import { UserCircle, X } from 'lucide-vue-next'
const logo = '/nti-logo.svg'
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})
</script>