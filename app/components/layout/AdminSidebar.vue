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
        isCollapsed ? 'md:w-20' : 'md:w-64',
      ]"
    >
      <!-- Logo + admin badge + collapse toggle -->
      <div class="flex flex-col border-b border-white/10">
        <div class="flex items-center justify-between px-4 py-4">
          <NuxtLink
            v-if="!isCollapsed"
            to="/"
            class="flex items-center"
          >
            <img
              src="/nti-logo.svg"
              alt="NTI"
              class="h-8 w-auto"
            />
          </NuxtLink>

          <button
            class="hidden md:block text-white/60 hover:text-white transition-colors"
            @click="emit('toggle-collapse')"
          >
            <component
              :is="isCollapsed ? ChevronRight : ChevronLeft"
              class="w-5 h-5"
            />
          </button>
        </div>

        <span
          v-if="!isCollapsed"
          class="text-[10px] font-semibold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full mx-4 mb-3 w-fit"
          >Admin</span
        >
      </div>

      <!-- Nav items grouped by section -->
      <nav class="flex-1 overflow-y-auto py-4">
        <template
          v-for="(sectionItems, sectionName) in groupedItems"
          :key="sectionName"
        >
          <div
            v-if="!isCollapsed && sectionName"
            class="text-xs uppercase tracking-wider text-white/40 px-3 pt-4 pb-1"
          >
            {{ sectionName }}
          </div>

          <ul class="flex flex-col gap-1 px-2">
            <li
              v-for="item in sectionItems"
              :key="item.to"
            >
              <NuxtLink
                :to="item.to"
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200',
                  isCollapsed ? 'justify-center' : '',
                  isActive(item.to)
                    ? 'bg-white/10 text-white border-l-3 border-purple-500'
                    : 'text-white/70 hover:bg-white/5 hover:text-white',
                ]"
                :title="isCollapsed ? item.label : undefined"
                @click="closeMobileIfOpen"
              >
                <component
                  :is="item.icon"
                  class="w-5 h-5 shrink-0"
                />
                <span
                  v-if="!isCollapsed"
                  class="truncate"
                  >{{ item.label }}</span
                >
              </NuxtLink>
            </li>
          </ul>
        </template>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { Component } from 'vue'

interface NavItem {
  label: string
  to: string
  icon: Component
  section?: string
}

const props = defineProps<{
  items: NavItem[]
  isOpen: boolean
  isCollapsed: boolean
}>()

const emit = defineEmits<{
  close: []
  'toggle-collapse': []
}>()

const route = useRoute()

const groupedItems = computed(() => {
  const groups: Record<string, NavItem[]> = {}
  for (const item of props.items) {
    const section = item.section ?? ''
    if (!groups[section]) {
      groups[section] = []
    }
    groups[section].push(item)
  }
  return groups
})

const isActive = (to: string) => {
  return route.path === to || route.path.startsWith(to + '/')
}

const closeMobileIfOpen = () => {
  if (props.isOpen) {
    emit('close')
  }
}
</script>
