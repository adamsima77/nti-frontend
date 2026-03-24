<template>
  <div>
    <LayoutNavbar
      @open-sidebar="sidebarOpen = true"
      :isSidebarOpen="sidebarOpen"
    />

    <LayoutSidebar
      :isOpen="sidebarOpen"
      @close-sidebar="sidebarOpen = false"
    />

    <main class = "p-5 md:p-15">
      <slot />
    </main>

    <LayoutFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const sidebarOpen = ref(false)
</script>