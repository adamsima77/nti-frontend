<template>
  <footer class="bg-[var(--color-navy)] text-white p-4 shadow-2xl">
    <div class="flex flex-col justify-between items-center md:flex-row gap-8">

        <div class = "">
            <NuxtLink to = "/" class = ""><img class = "" :src="logo" alt="Nitriansky technický inkubátor"></NuxtLink>
        </div>

      <div class="flex items-center gap-3 whitespace-nowrap">
          <NuxtLink to="/" class="hover:text-[var(--color-blue-500)] transition-colors">O NTI</NuxtLink>
          <hr class="w-px h-5 bg-gray-400 border-0">
          <NuxtLink to="/" class = "hover:text-[var(--color-blue-500)] transition-colors">Kontakt</NuxtLink>
      </div>
        
        <div class="flex gap-3 items-center">
          <a href="#" target="_blank" class="hover:text-[var(--color-blue-500)] transition-colors">
            <Facebook class="w-6 h-6" />
          </a>
          <a href="#" target="_blank" class="hover:text-[var(--color-blue-500)] transition-colors">
            <Twitter class="w-6 h-6" />
          </a>
          <a href="#" target="_blank" class="hover:text-[var(--color-blue-500)] transition-colors">
            <Linkedin class="w-6 h-6" />
          </a>
        </div>
    </div>
  </footer>
</template>
<script setup>
import { Facebook, Twitter, Linkedin } from 'lucide-vue-next'
const logo = '/nti-logo.svg'
</script>