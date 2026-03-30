<template>
  <div class="min-h-screen bg-gray-50">
    <LayoutPortalNavbar :sidebar-collapsed="sidebarCollapsed" @toggle-sidebar="mobileSidebarOpen = !mobileSidebarOpen" />

    <LayoutPortalSidebar
      :items="navItems"
      :is-open="mobileSidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="mobileSidebarOpen = false"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
    />

    <main
      :class="[
        'pt-16 min-h-screen transition-all duration-300',
        sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
      ]"
    >
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  LayoutDashboard,
  Users,
  Megaphone,
  FileText,
  FileCode,
  Mail,
  Download,
  Shield
} from 'lucide-vue-next'

const mobileSidebarOpen = ref(false)
const sidebarCollapsed = ref(false)

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Používatelia', to: '/admin/pouzivatelia', icon: Users },
  { label: 'Výzvy', to: '/admin/vyzvy', icon: Megaphone },
  { label: 'Prihlášky', to: '/admin/prihlasky', icon: FileText },
  { label: 'CMS', to: '/admin/cms', icon: FileCode },
  { label: 'Šablóny emailov', to: '/admin/sablony-emailov', icon: Mail },
  { label: 'Exporty', to: '/admin/exporty', icon: Download },
  { label: 'Audit log', to: '/admin/audit-log', icon: Shield },
]
</script>
