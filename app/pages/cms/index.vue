<!-- pages/cms/index.vue -->
<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <!-- Header -->
    <div class="mb-10">
      <ClientOnly>
      <h1 class="text-3xl font-bold text-navy mb-1">{{ $t('cmsDashboard.welcome', { name: userDisplayName }) }}</h1>
      </ClientOnly>
      <p class="text-gray-500">{{ $t('cmsDashboard.subtitle') }}</p>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-blue-600 p-5">
        <div class="text-3xl font-bold text-blue-600">{{ publicatedArticles }}</div>
        <p class="text-sm text-gray-500 mt-1">{{ $t('cmsDashboard.stats.publishedArticles') }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-amber-500 p-5">
        <div class="text-3xl font-bold text-amber-500">{{ draftCount }}</div>
        <p class="text-sm text-gray-500 mt-1">{{ $t('cmsDashboard.stats.drafts') }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-purple-500 p-5">
        <div class="text-3xl font-bold text-purple-600">{{ partnerCount }}</div>
        <p class="text-sm text-gray-500 mt-1">{{ $t('cmsDashboard.stats.partners') }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border-l-4 border-green-600 p-5">
        <div class="text-3xl font-bold text-green-600">{{ faqCount }}</div>
        <p class="text-sm text-gray-500 mt-1">{{ $t('cmsDashboard.stats.faqEntries') }}</p>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="mb-8">
      <h2 class="text-xl font-bold text-navy mb-4">{{ $t('cmsDashboard.quickActions.title') }}</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <NuxtLink
          v-for="action in quickActions"
          :key="action.labelKey"
          :to="action.to"
          class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3 hover:shadow-md hover:border-blue-200 transition group"
        >
          <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" :class="action.iconBg">
            <component :is="action.icon" class="w-5 h-5" :class="action.iconColor" />
          </div>
          <span class="text-sm font-medium text-navy group-hover:text-blue-600 transition">{{ $t(action.labelKey) }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Recently edited -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-navy">{{ $t('cmsDashboard.recentlyEdited.title') }}</h2>
        <NuxtLink
          :to="localePath('/cms/management')"
          class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          {{ $t('cmsDashboard.recentlyEdited.allItems') }}
          <ChevronRight class="w-4 h-4" />
        </NuxtLink>
      </div>
      <div class="space-y-3">
        <div
          v-for="item in recentlyEditedItems"
          :key="`${item.contentType}-${item.id}`"
          class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-4"
        >
          <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" :class="contentTypeStyle(item.type).bg">
            <component :is="contentTypeStyle(item.type).icon" class="w-4 h-4" :class="contentTypeStyle(item.type).color" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-navy text-sm truncate">{{ item.title }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ $t(`cmsDashboard.contentTypes.${item.contentType}`) }} · {{ $t('cmsDashboard.recentlyEdited.edited') }} {{ item.editedAt }}</p>
          </div>
          <NuxtLink
            :to="item.editLink"
            class="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-0.5 shrink-0"
          >
            {{ $t('cmsDashboard.recentlyEdited.edit') }}
            <ChevronRight class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>
        <p
          v-if="!recentlyEditedItems.length"
          class="text-sm text-gray-400 text-center py-6"
        >
          {{ $t('cmsDashboard.recentlyEdited.empty') }}
        </p>
      </div>
    </div>

    <!-- Content overview table -->
    <div class="mb-8">
      <h2 class="text-xl font-bold text-navy mb-4">{{ $t('cmsDashboard.overview.title') }}</h2>
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th class="text-left px-5 py-3 font-medium text-gray-500">{{ $t('cmsDashboard.overview.columns.section') }}</th>
                <th class="text-left px-5 py-3 font-medium text-gray-500">{{ $t('cmsDashboard.overview.columns.published') }}</th>
                <th class="text-left px-5 py-3 font-medium text-gray-500">{{ $t('cmsDashboard.overview.columns.drafts') }}</th>
                <th class="text-left px-5 py-3 font-medium text-gray-500">{{ $t('cmsDashboard.overview.columns.lastEdited') }}</th>
                <th class="text-left px-5 py-3 font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="section in contentSections"
                :key="section.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-5 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-md flex items-center justify-center" :class="section.iconBg">
                      <component :is="section.icon" class="w-4 h-4" :class="section.iconColor" />
                    </div>
                    <span class="font-medium text-navy">{{ $t(section.nameKey) }}</span>
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
                    {{ $t('cmsDashboard.overview.manage') }}
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

useHead({ title: 'CMS Dashboard | NTI' })

const api = useApi()
const authStore = useAuthStore()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const lang   = computed(() => (locale.value === 'en' ? 'en' : 'sk'))
const langId = computed(() => lang.value === 'en' ? 2 : 1)

const userDisplayName = computed(() => {
  const u = authStore.user
  if (!u) return t('cmsDashboard.defaultUser')
  return u.name ? `${u.name} ${u.surname ?? ''}`.trim() : u.email ?? t('cmsDashboard.defaultUser')
})

// ── Stats ──────────────────────────────────────────────────

const publicatedArticles = ref(0)
const draftCount         = ref(0)
const partnerCount       = ref(0)
const faqCount           = ref(0)

// ── Content overview ───────────────────────────────────────

const contentOverview = ref<Record<string, any>>({})

const sectionMeta: Record<string, { nameKey: string; link: string; icon: any; iconBg: string; iconColor: string }> = {
  news:               { nameKey: 'cmsDashboard.sections.news',               link: localePath('/cms/management?tab=clanky'),             icon: Newspaper,  iconBg: 'bg-blue-50',   iconColor: 'text-blue-600' },
  partners:           { nameKey: 'cmsDashboard.sections.partners',           link: localePath('/cms/management?tab=partneri'),           icon: Users,      iconBg: 'bg-green-50',  iconColor: 'text-green-600' },
  faq:                { nameKey: 'cmsDashboard.sections.faq',                link: localePath('/cms/management?tab=faq'),                icon: HelpCircle, iconBg: 'bg-amber-50',  iconColor: 'text-amber-600' },
  hero_banners:       { nameKey: 'cmsDashboard.sections.heroBanners',        link: localePath('/cms/management?tab=bannery'),            icon: Image,      iconBg: 'bg-pink-50',   iconColor: 'text-pink-600' },
  meta_tags:          { nameKey: 'cmsDashboard.sections.metaTags',           link: localePath('/cms/management?tab=meta_tags'),          icon: Layout,     iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  partner_references: { nameKey: 'cmsDashboard.sections.partnerReferences',  link: localePath('/cms/management?tab=partner_references'), icon: FileText,   iconBg: 'bg-gray-100',  iconColor: 'text-gray-600' },
}

const contentSections = computed(() =>
  Object.entries(sectionMeta).map(([key, meta], i) => {
    const data = contentOverview.value[key] ?? {}
    return {
      id:         i + 1,
      nameKey:    meta.nameKey,
      published:  data.published ?? 0,
      drafts:     data.concepts  ?? 0,
      lastEdited: data.last_updated?.updated_at?.slice(0, 10) ?? '—',
      link:       meta.link,
      icon:       meta.icon,
      iconBg:     meta.iconBg,
      iconColor:  meta.iconColor,
    }
  }),
)

// ── Translation helper ─────────────────────────────────────

function getTranslation(translations: any[]): any {
  if (!Array.isArray(translations) || !translations.length) return {}
  return translations.find((tr) => tr.language_id === langId.value) ?? translations[0]
}

// ── Recently edited ────────────────────────────────────────

const recentlyEditedItems = computed(() => {
  const items: any[] = []
  const o = contentOverview.value

  if (o.news?.last_updated) {
    const item = o.news.last_updated
    const tr = getTranslation(item.news_translations ?? [])
    items.push({
      id:          item.id,
      title:       tr.title ?? item.slug ?? '—',
      contentType: 'news',
      editedAt:    item.updated_at?.slice(0, 10) ?? '—',
      editLink:    { path: localePath('/cms/management'), query: { tab: 'clanky' } },
    })
  }

  if (o.partners?.last_updated) {
    const item = o.partners.last_updated
    const tr = getTranslation(item.partner_translations ?? [])
    items.push({
      id:          item.id,
      title:       item.name ?? tr.description?.slice(0, 60) ?? '—',
      contentType: 'partner',
      editedAt:    item.updated_at?.slice(0, 10) ?? '—',
      editLink:    { path: localePath('/cms/management'), query: { tab: 'partneri' } },
    })
  }

  if (o.faq?.last_updated) {
    const item = o.faq.last_updated
    const tr = getTranslation(item.frequently_asked_question_translations ?? [])
    items.push({
      id:          item.id,
      title:       tr.question ?? '—',
      contentType: 'faq',
      editedAt:    item.updated_at?.slice(0, 10) ?? '—',
      editLink:    { path: localePath('/cms/management'), query: { tab: 'faq' } },
    })
  }

  if (o.hero_banners?.last_updated) {
    const item = o.hero_banners.last_updated
    const tr = getTranslation(item.hero_banner_translations ?? [])
    items.push({
      id:          item.id,
      title:       tr.title ?? `Banner #${item.id}`,
      contentType: 'hero_banner',
      editedAt:    item.updated_at?.slice(0, 10) ?? '—',
      editLink:    { path: localePath('/cms/management'), query: { tab: 'bannery' } },
    })
  }

  if (o.meta_tags?.last_updated) {
    const item = o.meta_tags.last_updated
    const tr = getTranslation(item.meta_tag_translations ?? [])
    items.push({
      id:          item.id,
      title:       tr.title ?? '—',
      contentType: 'meta_tag',
      editedAt:    item.updated_at?.slice(0, 10) ?? '—',
      editLink:    { path: localePath('/cms/management'), query: { tab: 'meta_tags' } },
    })
  }

  if (o.partner_references?.last_updated) {
    const item = o.partner_references.last_updated
    items.push({
      id:          item.id,
      title:       item.name ?? '—',
      contentType: 'partner_reference',
      editedAt:    item.updated_at?.slice(0, 10) ?? '—',
      editLink:    { path: localePath('/cms/management'), query: { tab: 'partner_references' } },
    })
  }

  return items
})

// ── Fetch ──────────────────────────────────────────────────

onMounted(async () => {
  try {
    const response = await api.get('/content-overview') as Record<string, any>
    contentOverview.value = response

    publicatedArticles.value = response.news?.published     ?? 0
    partnerCount.value       = response.partners?.published ?? 0
    faqCount.value           = response.faq?.published      ?? 0
    draftCount.value         = Object.values(response).reduce(
      (sum: number, s: any) => sum + (s?.concepts ?? 0), 0,
    )
  } catch (error) {
    console.error('Failed to fetch content overview:', error)
  }
})

// ── Quick actions ──────────────────────────────────────────

const quickActions = [
  { labelKey: 'cmsDashboard.quickActions.newArticle',  to: { path: localePath('/cms/management'), query: { tab: 'clanky',    create: '1' } }, icon: Plus,   iconBg: 'bg-blue-50',   iconColor: 'text-blue-600' },
  { labelKey: 'cmsDashboard.quickActions.newMetadata', to: { path: localePath('/cms/management'), query: { tab: 'meta_tags', create: '1' } }, icon: Layout, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  { labelKey: 'cmsDashboard.quickActions.partners',    to: { path: localePath('/cms/management'), query: { tab: 'partneri',  create: '1' } }, icon: Users,  iconBg: 'bg-green-50',  iconColor: 'text-green-600' },
  { labelKey: 'cmsDashboard.quickActions.publicWeb',   to: localePath('/'),                                                                   icon: Globe,  iconBg: 'bg-gray-100',  iconColor: 'text-gray-600' },
]

// ── Helpers ────────────────────────────────────────────────

const contentTypeStyle = (contentType: string) => {
  const map: Record<string, { bg: string; color: string; icon: any }> = {
    news:              { bg: 'bg-blue-50',   color: 'text-blue-600',   icon: Newspaper },
    partner:           { bg: 'bg-green-50',  color: 'text-green-600',  icon: Users },
    faq:               { bg: 'bg-amber-50',  color: 'text-amber-600',  icon: HelpCircle },
    meta_tag:          { bg: 'bg-purple-50', color: 'text-purple-600', icon: Layout },
    hero_banner:       { bg: 'bg-pink-50',   color: 'text-pink-600',   icon: Image },
    partner_reference: { bg: 'bg-gray-100',  color: 'text-gray-600',   icon: FileText },
  }
  return map[contentType] ?? { bg: 'bg-gray-100', color: 'text-gray-500', icon: FileText }
}
</script>