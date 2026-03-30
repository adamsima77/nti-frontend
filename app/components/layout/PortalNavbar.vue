<template>
  <nav class="fixed top-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 z-40 left-0 md:left-64 transition-all duration-300" :class="sidebarCollapsed ? 'md:!left-20' : ''">
    <div class="flex items-center gap-3">
      <button @click="emit('toggle-sidebar')" class="md:hidden text-gray-600 hover:text-navy transition-colors">
        <Menu class="w-6 h-6" />
      </button>

      <div class="text-sm text-gray-500">
        <slot name="breadcrumb" />
      </div>
    </div>

    <div class="flex items-center gap-4">
      <button class="text-gray-500 hover:text-navy transition-colors relative">
        <Bell class="w-5 h-5" />
      </button>

      <span class="hidden sm:inline text-sm font-medium text-navy">{{ userName }}</span>

      <button
        @click="handleLogout"
        class="text-gray-500 hover:text-danger-600 transition-colors"
        title="Odhlásiť sa"
      >
        <LogOut class="w-5 h-5" />
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { Menu, Bell, LogOut } from 'lucide-vue-next'

defineProps({
  sidebarCollapsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-sidebar'])

const authStore = useAuthStore()

const userName = computed(() => {
  const user = authStore.user
  if (!user) return ''
  if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`
  if (user.organization_name) return user.organization_name
  return user.email || ''
})

const handleLogout = async () => {
  await authStore.logout()
  navigateTo('/auth/login')
}
</script>
