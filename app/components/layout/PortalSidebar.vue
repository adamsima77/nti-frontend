<template>
  <div>
    <!-- Mobile backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
      @click="emit('close')"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 h-screen bg-navy text-white flex flex-col z-50 transition-all duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0',
        isCollapsed ? 'md:w-20' : 'md:w-64'
      ]"
    >
      <!-- Logo + collapse toggle -->
      <div class="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <NuxtLink v-if="!isCollapsed" to="/" class="flex items-center">
          <img src="/nti-logo.svg" alt="NTI" class="h-8 w-auto" />
        </NuxtLink>

        <button
          @click="emit('toggle-collapse')"
          class="hidden md:block text-white/60 hover:text-white transition-colors"
        >
          <component :is="isCollapsed ? ChevronRight : ChevronLeft" class="w-5 h-5" />
        </button>
      </div>

      <!-- Nav items -->
      <nav class="flex-1 overflow-y-auto py-4">
        <ul class="flex flex-col gap-1 px-2">
          <li v-for="item in items" :key="item.to">
            <NuxtLink
              :to="item.to"
              :class="[
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200',
                isCollapsed ? 'justify-center' : '',
                isActive(item.to)
                  ? 'bg-white/10 text-white border-l-3 border-blue-500'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              ]"
              :title="isCollapsed ? item.label : undefined"
              @click="closeMobileIfOpen"
            >
              <component :is="item.icon" class="w-5 h-5 shrink-0" />
              <span v-if="!isCollapsed" class="truncate">{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>

<script setup>
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  isOpen: {
    type: Boolean,
    default: false
  },
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'toggle-collapse'])

const route = useRoute()

const isActive = (to) => {
  return route.path === to || route.path.startsWith(to + '/')
}

const closeMobileIfOpen = () => {
  if (props.isOpen) {
    emit('close')
  }
}
</script>
