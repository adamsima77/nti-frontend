<template>
  <div> 
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
      @click="$emit('close-sidebar')"
    />

   
    <div
      class="fixed top-0 left-0 h-screen w-80 bg-navy text-white p-5 shadow-2xl
             transform transition-transform duration-500 ease-out flex flex-col gap-6 z-900"
      :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
    >

      
      <div class="flex justify-between items-center">
        <NuxtLink to="/">
          <img :src="logo" alt="Nitriansky technický inkubátor" />
        </NuxtLink>

        <button @click="$emit('close-sidebar')">
          <X class="w-6 h-6 hover:opacity-80 transition-opacity duration-300 cursor-pointer" />
        </button>
      </div>

      
      <div class="flex items-center">
        <NuxtLink to="/">
          <UserCircle class="w-6 h-6 text-blue-50 hover:text-blue-500 transition-colors duration-300" />
        </NuxtLink>
      </div>

     
      <ul class="flex flex-col gap-4
           text-base md:text-lg lg:text-xl">
           <li><NuxtLink to="/" class="text-blue-50 hover:text-blue-500 transition-colors duration-300">Novinky</NuxtLink></li>
           <li><NuxtLink to="/" class="text-blue-50 hover:text-blue-500 transition-colors duration-300">Program A</NuxtLink></li>
           <li><NuxtLink to="/" class="text-blue-50 hover:text-blue-500 transition-colors duration-300">Program B</NuxtLink></li>
           <li><NuxtLink to="/" class="text-blue-50 hover:text-blue-500 transition-colors duration-300">Partneri</NuxtLink></li>
           <li><NuxtLink to="/" class="text-blue-50 hover:text-blue-500 transition-colors duration-300">Výzvy a termíny</NuxtLink></li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue';
import { useRoute } from 'vue-router'
const logo = '/nti-logo.svg'

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close-sidebar']);
const route = useRoute();
watch(() => route.fullPath, (newRoute, oldRoute) => {
    emit('close-sidebar');
})
</script>