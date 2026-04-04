<template>
  <div class="min-h-screen bg-gray-50">
    <LayoutPortalNavbar
      :sidebar-collapsed="sidebarCollapsed"
      @toggle-sidebar="mobileSidebarOpen = !mobileSidebarOpen"
    />

    <LayoutPortalSidebar
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
import { ref, computed } from 'vue'
import {
  LayoutDashboard,
  FileText,
  Users,
  UserCircle,
  Building2,
  ClipboardList,
  FolderKanban,
  MessageSquare,
  ClipboardCheck,
} from 'lucide-vue-next'

const mobileSidebarOpen = ref(false)
const sidebarCollapsed = ref(false)

const authStore = useAuthStore()

const navItems = computed(() => {
  const role = authStore.userRole

  if (role === 'student' || role === 'team_lead') {
    return [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { label: 'Moje prihlášky', to: '/prihlasky', icon: FileText },
      { label: 'Moje tímy', to: '/timy', icon: Users },
      { label: 'Môj profil', to: '/profil', icon: UserCircle }
    ]
  }

  if (role === 'company') {
    return [
      { label: 'Dashboard', to: '/firma', icon: LayoutDashboard },
      { label: 'Profil organizácie', to: '/firma/profil', icon: Building2 },
      { label: 'Zadania', to: '/firma/zadania', icon: ClipboardList },
      { label: 'Správa členov', to: '/firma/clenovia', icon: Users }
    ]
  }

  if (role === 'mentor') {
    return [
      { label: 'Dashboard', to: '/mentor', icon: LayoutDashboard },
      { label: 'Projekty', to: '/mentor/projekty', icon: FolderKanban },
      { label: 'Konzultácie', to: '/mentor/konzultacie', icon: MessageSquare }
    ]
  }

  if (role === 'evaluator') {
    return [
      { label: 'Dashboard', to: '/hodnotenie', icon: LayoutDashboard },
      { label: 'Hodnotenia',  to: '/hodnotenie/zoznam', icon: ClipboardCheck },
    ]
  }

  return [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }]
})
</script>