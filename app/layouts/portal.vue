<template>
  <div class="min-h-screen bg-gray-50">
    <ClientOnly>
      <LayoutPortalNavbar
        :sidebar-collapsed="sidebarCollapsed"
        @toggle-sidebar="mobileSidebarOpen = !mobileSidebarOpen"
      />
    </ClientOnly>

    <ClientOnly>
      <LayoutPortalSidebar
        :items="navItems"
        :is-open="mobileSidebarOpen"
        :is-collapsed="sidebarCollapsed"
        @close="mobileSidebarOpen = false"
        @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
      />
    </ClientOnly>

    <main :class="['pt-16 min-h-screen transition-all duration-300', sidebarCollapsed ? 'md:ml-20' : 'md:ml-64']">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
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
  FileCode,
  Megaphone,
  Mail,
  Download,
  Shield,
  ShieldCheck
} from 'lucide-vue-next'

const mobileSidebarOpen = ref(false)
const sidebarCollapsed  = ref(false)

const authStore  = useAuthStore()
const { t }      = useI18n()
const localePath = useLocalePath()

const handleStorageChange = async (e: StorageEvent) => {
  if (e.key === '_t' && e.newValue) {
    await authStore.getCurrentUser()
    return
  }

  if (e.key === '_t' && e.newValue === null) {
    authStore.$reset()
    await navigateTo('/auth/login')
  }
}

onMounted(() => {
  window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})

const navItems = computed(() => {
  const role = authStore.userRole

  if (role === 'admin') {
    return [
      { label: t('portal_sidebar_links.dashboard'),        to: localePath('/admin'),                   icon: LayoutDashboard, section: t('portal_sidebar_links.sectionManagement') },
      { label: t('portal_sidebar_links.users'),            to: localePath('/admin/pouzivatelia'),      icon: Users,           section: t('portal_sidebar_links.sectionManagement') },
      { label: t('portal_sidebar_links.challenges'),       to: localePath('/admin/vyzvy'),             icon: Megaphone,       section: t('portal_sidebar_links.sectionManagement') },
      { label: t('portal_sidebar_links.adminApplications'),to: localePath('/admin/prihlasky'),         icon: FileText,        section: t('portal_sidebar_links.sectionManagement') },
      { label: t('portal_sidebar_links.cms'),              to: localePath('/cms/management'),          icon: FileCode,        section: t('portal_sidebar_links.sectionContent') }, 
    ]
  }

  if(role === 'superadmin') {
    return [
      { label: t('portal_sidebar_links.dashboard'),        to: localePath('/super-admin'),              icon: LayoutDashboard, section: t('portal_sidebar_links.sectionManagement') },
      { label: t('portal_sidebar_links.users'),            to: localePath('/admin/pouzivatelia'),      icon: Users,           section: t('portal_sidebar_links.sectionManagement') },
      { label: t('portal_sidebar_links.challenges'),       to: localePath('/admin/vyzvy'),             icon: Megaphone,       section: t('portal_sidebar_links.sectionManagement') },
      { label: t('portal_sidebar_links.adminApplications'),to: localePath('/admin/prihlasky'),         icon: FileText,        section: t('portal_sidebar_links.sectionManagement') },
      { label: t('portal_sidebar_links.cms'),              to: localePath('/cms/management'),          icon: FileCode,        section: t('portal_sidebar_links.sectionContent') },
      { label: t('portal_sidebar_links.roles'),            to: localePath('/super-admin/role'),         icon: ShieldCheck,     section: t('portal_sidebar_links.sectionSystem') },
      { label: t('portal_sidebar_links.auditLog'),         to: localePath('/admin/audit-logs'),         icon: Shield,          section: t('portal_sidebar_links.sectionSystem') },
      
    ]
  }

  if (role === 'student') {
    return [
      { label: t('portal_sidebar_links.dashboard'),    to: localePath('/student'),           icon: LayoutDashboard },
      { label: t('portal_sidebar_links.applications'), to: localePath('/student/prihlasky'), icon: FileText },
      { label: t('portal_sidebar_links.teams'),        to: localePath('/student/timy'),      icon: Users },
      { label: t('portal_sidebar_links.profile'),      to: localePath('/student/profil'),    icon: UserCircle },
    ]
  }

  if (role === 'cms_editor') {
    return [
      { label: t('portal_sidebar_links.dashboard'),  to: localePath('/cms'),            icon: LayoutDashboard },
      { label: t('portal_sidebar_links.cms'),        to: localePath('/cms/management'), icon: FileCode },
      { label: t('portal_sidebar_links.cmsProfile'), to: localePath('/cms/profil'),     icon: UserCircle },
    ]
  }

  if (role === 'company') {
    return [
      { label: t('portal_sidebar_links.dashboard'),       to: localePath('/firma'),          icon: LayoutDashboard },
      { label: t('portal_sidebar_links.companyProfile'),  to: localePath('/firma/profil'),   icon: Building2 },
      { label: t('portal_sidebar_links.tasks'),           to: localePath('/firma/zadania'),  icon: ClipboardList },
      { label: t('portal_sidebar_links.members'),         to: localePath('/firma/clenovia'), icon: Users },
    ]
  }

  if (role === 'mentor') {
    return [
      { label: t('portal_sidebar_links.dashboard'),     to: localePath('/mentor'),             icon: LayoutDashboard },
      { label: t('portal_sidebar_links.projects'),      to: localePath('/mentor/projekty'),    icon: FolderKanban },
      { label: t('portal_sidebar_links.consultations'), to: localePath('/mentor/konzultacie'), icon: MessageSquare },
    ]
  }

  if (role === 'evaluator') {
    return [
      { label: t('portal_sidebar_links.dashboard'),   to: localePath('/hodnotenie'),        icon: LayoutDashboard },
      { label: t('portal_sidebar_links.evaluations'), to: localePath('/hodnotenie/zoznam'), icon: ClipboardCheck },
    ]
  }

  return [
    { label: t('portal_sidebar_links.dashboard'), to: localePath('/dashboard'), icon: LayoutDashboard },
  ]
})
</script>