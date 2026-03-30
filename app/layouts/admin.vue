<template>
  <div class="min-h-screen bg-gray-50">
    <LayoutPortalNavbar
      :sidebar-collapsed="sidebarCollapsed"
      @toggle-sidebar="mobileSidebarOpen = !mobileSidebarOpen"
    />

    <LayoutAdminSidebar
      :items="navItems"
      :is-open="mobileSidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="mobileSidebarOpen = false"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
    />

    <main :class="['pt-16 min-h-screen transition-all duration-300', sidebarCollapsed ? 'md:ml-20' : 'md:ml-64']">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { LayoutDashboard, Users, Megaphone, FileText, FileCode, Mail, Download, Shield } from 'lucide-vue-next'

const mobileSidebarOpen = ref(false)
const sidebarCollapsed = ref(false)

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, section: 'Správa' },
  { label: 'Používatelia', to: '/admin/pouzivatelia', icon: Users, section: 'Správa' },
  { label: 'Výzvy', to: '/admin/vyzvy', icon: Megaphone, section: 'Správa' },
  { label: 'Prihlášky', to: '/admin/prihlasky', icon: FileText, section: 'Správa' },
  { label: 'CMS', to: '/admin/cms', icon: FileCode, section: 'Obsah' },
  { label: 'Šablóny emailov', to: '/admin/sablony-emailov', icon: Mail, section: 'Obsah' },
  { label: 'Exporty', to: '/admin/exporty', icon: Download, section: 'Systém' },
  { label: 'Audit log', to: '/admin/audit-log', icon: Shield, section: 'Systém' },
]
</script>
