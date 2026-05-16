<!-- pages/cms/index.vue -->
<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-navy mb-1">Vitajte, {{ userDisplayName }}!</h1>
      <p class="text-gray-500">Správa obsahu verejnej časti webu</p>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-blue-600 p-5">
        <div class="text-3xl font-bold text-blue-600">{{ publicatedArticles }}</div>
        <p class="text-sm text-gray-500 mt-1">Publikované články</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-amber-500 p-5">
        <div class="text-3xl font-bold text-amber-500">{{ draftCount }}</div>
        <p class="text-sm text-gray-500 mt-1">Koncepty</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-purple-500 p-5">
        <div class="text-3xl font-bold text-purple-600">{{ partnerCount }}</div>
        <p class="text-sm text-gray-500 mt-1">Partneri</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-green-600 p-5">
        <div class="text-3xl font-bold text-green-600">{{ faqCount }}</div>
        <p class="text-sm text-gray-500 mt-1">FAQ záznamy</p>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="mb-8">
      <h2 class="text-xl font-bold text-navy mb-4">Rýchle akcie</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <NuxtLink
          v-for="action in quickActions"
          :key="action.label"
          :to="action.to"
          class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3 hover:shadow-md hover:border-blue-200 transition group"
        >
          <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" :class="action.iconBg">
            <component :is="action.icon" class="w-5 h-5" :class="action.iconColor" />
          </div>
          <span class="text-sm font-medium text-navy group-hover:text-blue-600 transition">{{ action.label }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Recently edited + Drafts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Recently edited -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-navy">Naposledy upravené</h2>
          <NuxtLink
            to="/cms/novinky"
            class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Všetky články
            <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </div>
        <div class="space-y-3">
          <div
            v-for="item in mockRecentlyEdited"
            :key="item.id"
            class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-4"
          >
            <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" :class="contentTypeStyle(item.type).bg">
              <component :is="contentTypeStyle(item.type).icon" class="w-4 h-4" :class="contentTypeStyle(item.type).color" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-navy text-sm truncate">{{ item.title }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ item.type }} · upravené {{ item.editedAt }}</p>
            </div>
            <NuxtLink
              :to="item.link"
              class="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-0.5 shrink-0"
            >
              Upraviť
              <ChevronRight class="w-3.5 h-3.5" />
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Drafts -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-navy">Koncepty na dopracovanie</h2>
          <NuxtLink
            to="/cms/novinky?status=draft"
            class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Zobraziť všetky
            <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </div>
        <div class="space-y-3">
          <div
            v-for="draft in mockDrafts"
            :key="draft.id"
            class="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1 min-w-0 mr-2">
                <p class="font-medium text-navy text-sm truncate">{{ draft.title }}</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ draft.type }} · vytvorené {{ draft.createdAt }}</p>
              </div>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 shrink-0">
                Koncept
              </span>
            </div>
            <div class="flex gap-2 mt-3">
              <NuxtLink
                :to="draft.link"
                class="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
              >
                Pokračovať v úprave
                <ChevronRight class="w-3.5 h-3.5" />
              </NuxtLink>
            </div>
          </div>
          <p
            v-if="!mockDrafts.length"
            class="text-sm text-gray-400 text-center py-6"
          >
            Žiadne koncepty
          </p>
        </div>
      </div>
    </div>

    <!-- Content overview table -->
    <div class="mb-8">
      <h2 class="text-xl font-bold text-navy mb-4">Prehľad obsahu</h2>
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th class="text-left px-5 py-3 font-medium text-gray-500">Sekcia</th>
                <th class="text-left px-5 py-3 font-medium text-gray-500">Publikované</th>
                <th class="text-left px-5 py-3 font-medium text-gray-500">Koncepty</th>
                <th class="text-left px-5 py-3 font-medium text-gray-500">Naposledy upravené</th>
                <th class="text-left px-5 py-3 font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="section in mockContentSections"
                :key="section.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-5 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-md flex items-center justify-center" :class="section.iconBg">
                      <component :is="section.icon" class="w-4 h-4" :class="section.iconColor" />
                    </div>
                    <span class="font-medium text-navy">{{ section.name }}</span>
                  </div>
                </td>
                <td class="px-5 py-4 text-gray-600">{{ section.published }}</td>
                <td class="px-5 py-4">
                  <span
                    v-if="section.drafts > 0"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700"
                  >
                    {{ section.drafts }}
                  </span>
                  <span v-else class="text-gray-400">—</span>
                </td>
                <td class="px-5 py-4 text-gray-500 text-xs">{{ section.lastEdited }}</td>
                <td class="px-5 py-4">
                  <NuxtLink
                    :to="section.link"
                    class="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                  >
                    Spravovať
                    <ChevronRight class="w-3.5 h-3.5" />
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ChevronRight,
  FileText,
  Users,
  HelpCircle,
  Image,
  Newspaper,
  Layout,
  Plus,
  Globe,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['cms_editor'],
})

const api = useApi()

useHead({
  title: 'CMS Dashboard | NTI',
})

const authStore = useAuthStore()

const userDisplayName = computed(() => {
  const u = authStore.user
  if (!u) return 'Editor'
  return u.name ? `${u.name} ${u.surname ?? ''}`.trim() : u.email ?? 'Editor'
})

const publicatedArticles = ref<number>(0)
const draftCount = ref<number>(0)
const partnerCount = ref<number>(0)
const faqCount = ref<number>(0)

onMounted(async () => {
  const [published, concepts, partners, faqs] = await Promise.all([
    api.get('/publicated-articles'),
    api.get('/concept-count'),
    api.get('/partner-count'),
    api.get('/faq-count'),
  ])
  publicatedArticles.value = published.count
  draftCount.value = concepts.count
  partnerCount.value = partners.count
  faqCount.value = faqs.count
})


// ── Mock data ──────────────────────────────────────────────

const quickActions = [
  // Navigate to management and open the "new article" modal via query params
  { label: 'Nový článok', to: { path: '/cms/management', query: { tab: 'clanky', create: '1' } }, icon: Plus, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { label: 'Nové metadáta', to: { path: '/cms/management', query: { tab: 'meta_tags', create: '1' } }, icon: Layout, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  { label: 'Partneri', to: { path: '/cms/management', query: { tab: 'partneri', create: '1' } }, icon: Users, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
  { label: 'Verejný web', to: '/', icon: Globe, iconBg: 'bg-gray-100', iconColor: 'text-gray-600' },
]

const mockRecentlyEdited = [
  { id: 1, title: 'Program A — popis a podmienky', type: 'Stránka', editedAt: '14.05.2026', link: '/cms/stranky/1' },
  { id: 2, title: 'NTI víťazi 2025 — výsledky', type: 'Článok', editedAt: '13.05.2026', link: '/cms/novinky/2' },
  { id: 3, title: 'FAQ — Program B', type: 'FAQ', editedAt: '12.05.2026', link: '/cms/faq/3' },
  { id: 4, title: 'Partner: TechCorp Slovakia', type: 'Partner', editedAt: '10.05.2026', link: '/cms/partneri/4' },
]

const mockDrafts = [
  { id: 1, title: 'Výzva pre firmy — jún 2026', type: 'Článok', createdAt: '12.05.2026', link: '/cms/novinky/5' },
  { id: 2, title: 'O NTI — aktualizovaná verzia', type: 'Stránka', createdAt: '08.05.2026', link: '/cms/stranky/2' },
  { id: 3, title: 'Ako sa prihlásiť do Programu A', type: 'FAQ', createdAt: '05.05.2026', link: '/cms/faq/10' },
]

const mockContentSections = [
  { id: 1, name: 'Novinky', published: 14, drafts: 2, lastEdited: '14.05.2026', link: '/cms/novinky', icon: Newspaper, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { id: 2, name: 'Stránky', published: 6, drafts: 1, lastEdited: '13.05.2026', link: '/cms/stranky', icon: Layout, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  { id: 3, name: 'Partneri', published: 8, drafts: 0, lastEdited: '10.05.2026', link: '/cms/partneri', icon: Users, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
  { id: 4, name: 'FAQ', published: 22, drafts: 0, lastEdited: '12.05.2026', link: '/cms/faq', icon: HelpCircle, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  { id: 5, name: 'Bannery & Hero sekcie', published: 3, drafts: 0, lastEdited: '09.05.2026', link: '/cms/bannery', icon: Image, iconBg: 'bg-pink-50', iconColor: 'text-pink-600' },
  { id: 6, name: 'Statické stránky', published: 4, drafts: 0, lastEdited: '01.05.2026', link: '/cms/staticke', icon: FileText, iconBg: 'bg-gray-100', iconColor: 'text-gray-500' },
]

// ── Helpers ────────────────────────────────────────────────

const contentTypeStyle = (type: string) => {
  const map: Record<string, { bg: string; color: string; icon: any }> = {
    'Článok':  { bg: 'bg-blue-50',   color: 'text-blue-600',   icon: Newspaper },
    'Stránka': { bg: 'bg-purple-50', color: 'text-purple-600', icon: Layout },
    'FAQ':     { bg: 'bg-amber-50',  color: 'text-amber-600',  icon: HelpCircle },
    'Partner': { bg: 'bg-green-50',  color: 'text-green-600',  icon: Users },
  }
  return map[type] ?? { bg: 'bg-gray-100', color: 'text-gray-500', icon: FileText }
}
</script>