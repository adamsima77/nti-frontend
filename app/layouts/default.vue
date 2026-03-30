<template>
  <div>
    <LayoutNavbar
      :is-sidebar-open="sidebarOpen"
      @open-sidebar="sidebarOpen = true"
    />

    <LayoutSidebar
      :is-open="sidebarOpen"
      @close-sidebar="sidebarOpen = false"
    />

    <main class="p-5 md:p-15">
      <slot />
    </main>

    <LayoutFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const sidebarOpen = ref(false)
</script>
