<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-navy">{{ $t('cms.title') }}</h1>
        <p class="text-gray-500 mt-1">{{ $t('cms.subtitle') }}</p>
      </div>
      <UiButton v-if="activeTab !== 'email_templates'" @click="openCreateModal">
        <Plus class="w-4 h-4" />
        {{ $t('cms.addButton', { label: activeTabLabel }) }}
      </UiButton>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit flex-wrap">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="[
          'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
          activeTab === tab.key ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-gray-700',
        ]"
        @click="switchTab(tab.key)"
      >
        {{ $t(tab.label) }}
      </button>
    </div>

    <div class="bg-white rounded-lg border border-gray-200">
      <UiDataTable
        :columns="currentColumns"
        :rows="currentRows"
        :sort-by="sortBy"
        :sort-dir="sortDir"
        :loading="isLoading"
        @update:sort-by="sortBy = $event"
        @update:sort-dir="sortDir = $event"
        @update:current-page="onPageChange"
      >
        <template #cell-status="{ value }">
          <UiStatusBadge v-if="value" :status="value" />
        </template>

        <template #cell-website="{ value }">
          <a
            v-if="value"
            :href="value.startsWith('http') ? value : `https://${value}`"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 hover:underline text-sm"
          >
            {{ value }}
          </a>
        </template>

        <template #row-actions="{ row }">
          <div class="flex items-center gap-2">
            <button
              v-if="canEditContent"
              class="text-blue-600 hover:text-blue-800"
              :title="$t('cms.actions.edit')"
              @click="openEditModal(row)"
            >
              <Pencil class="w-4 h-4" />
            </button>
            <button
              v-if="canDeleteContent && activeTab !== 'email_templates'"
              class="text-gray-400 hover:text-danger-500"
              :title="$t('cms.actions.delete')"
              @click="openDeleteModal(row)"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </template>
      </UiDataTable>

      <!-- Pagination -->
      <div
        v-if="pagination.totalPages > 1"
        class="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50"
      >
        <span class="text-sm text-gray-500">
          {{ $t('cms.pagination.total', { count: pagination.total }) }}
        </span>
        <UiPagination
          :current-page="pagination.currentPage"
          :total-pages="pagination.totalPages"
          @update:current-page="onPageChange"
        />
      </div>
    </div>

    <!-- Modals -->
    <AdminCmsArticleModal
      v-model="showArticleModal"
      :article="editingItem"
      @saved="fetchData"
    />
    <AdminCmsPartnerModal
      v-model="showPartnerModal"
      :partner="editingItem"
      @saved="fetchData"
    />
    <AdminCmsFaqModal
      v-model="showFaqModal"
      :faq-item="editingItem"
      @saved="fetchData"
    />
    <AdminCmsBannerModal
      v-model="showBannerModal"
      :banner="editingItem"
      @saved="fetchData"
    />
    <AdminCmsNtiMembersModal
      v-model="showSiteMemberModal"
      :member="editingItem"
      @saved="fetchData"
    />
    <AdminConfirmDeleteModal
      v-model="showDeleteModal"
      :item-name="deletingItemName"
      :is-deleting="isDeleting"
      @confirm="handleDelete"
    />
    <AdminCmsMetaTagModal
      v-model="showMetaTagModal"
      :meta-tag="editingItem"
      @saved="fetchData"
    />
    <AdminCmsPartnerReferenceModal
      v-model="showPartnerReferenceModal"
      :reference="editingItem"
      @saved="fetchData"
    />
    <AdminCmsEmailTemplateModal
      v-model="showEmailTemplateModal"
      :template="editingItem"
      @saved="fetchData"
    />
  </div>
</template>

<script setup lang="ts">
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
  roles: ['cms_editor', 'nti_admin', 'nti_superadmin'],
})

useHead({ title: 'CMS | NTI' })

const api = useApi()
const { addToast } = useToast()
const { locale, t } = useI18n()
const authStore = useAuthStore()

const lang = computed(() => (locale.value === 'en' ? 'en' : 'sk'))

// ── Tabs ───────────────────────────────────────────────────

const tabs = [
  { key: 'clanky',             label: 'cms.tabs.articles' },
  { key: 'partneri',           label: 'cms.tabs.partners' },
  { key: 'faq',                label: 'cms.tabs.faq' },
  { key: 'bannery',            label: 'cms.tabs.banners' },
  { key: 'site_members',       label: 'cms.tabs.siteMembers' },
  { key: 'meta_tags',          label: 'cms.tabs.metaTags' },
  { key: 'partner_references', label: 'cms.tabs.partnerReferences' },
  { key: 'email_templates',    label: 'cms.tabs.emailTemplates' },
]

const activeTab = ref('clanky')
const activeTabLabel = computed(() => {
  const tab = tabs.find((tab) => tab.key === activeTab.value)
  return tab ? t(tab.label) : ''
})
const sortBy = ref<string | undefined>(undefined)
const sortDir = ref<'asc' | 'desc'>('asc')
const canEditContent = computed(() => authStore.hasPermission('content.edit_any'))
const canDeleteContent = computed(() => authStore.hasPermission('content.delete_any'))

type TabKey = 'clanky' | 'partneri' | 'faq' | 'bannery' | 'site_members' | 'meta_tags' | 'partner_references' | 'email_templates'

// ── Tab config ─────────────────────────────────────────────

const tabConfig: Record<TabKey, {
  columns: Array<{ key: string; label: string; sortable?: boolean }>
  endpoint: () => string
  deleteEndpoint: string
  paginated: boolean
}> = {
  clanky: {
    columns: [
      { key: 'title',        label: 'cms.columns.title',       sortable: true },
      { key: 'author',       label: 'cms.columns.author' },
      { key: 'category',     label: 'cms.columns.category' },
      { key: 'status',       label: 'cms.columns.status' },
      { key: 'published_at', label: 'cms.columns.publishedAt',  sortable: true },
    ],
    endpoint:       () => `/news/lang/${lang.value}`,
    deleteEndpoint: '/news',
    paginated:      true,
  },
  partneri: {
    columns: [
      { key: 'name',        label: 'cms.columns.name',        sortable: true },
      { key: 'description', label: 'cms.columns.description',  sortable: true },
      { key: 'status',      label: 'cms.columns.status' },
      { key: 'published_at', label: 'cms.columns.publishedAt', sortable: true },
    ],
    endpoint:       () => `/partners/lang/${lang.value}`,
    deleteEndpoint: '/partners',
    paginated:      true,
  },
  faq: {
    columns: [
      { key: 'question',    label: 'cms.columns.question',    sortable: true },
      { key: 'page',        label: 'cms.columns.page' },
      { key: 'published_at', label: 'cms.columns.publishedAt', sortable: true },
      { key: 'status',      label: 'cms.columns.status' },
    ],
    endpoint:       () => `/faq/lang/${lang.value}`,
    deleteEndpoint: '/faq',
    paginated:      true,
  },
  bannery: {
    columns: [
      { key: 'title',       label: 'cms.columns.title',       sortable: true },
      { key: 'page',        label: 'cms.columns.page' },
      { key: 'status',      label: 'cms.columns.status' },
      { key: 'published_at', label: 'cms.columns.publishedAt', sortable: true },
    ],
    endpoint:       () => `/hero-banners/lang/${lang.value}`,
    deleteEndpoint: '/hero-banners',
    paginated:      true,
  },
  site_members: {
    columns: [
      { key: 'name',         label: 'cms.columns.name',        sortable: true },
      { key: 'job_position', label: 'cms.columns.jobPosition',  sortable: true },
      { key: 'status',       label: 'cms.columns.status' },
      { key: 'published_at', label: 'cms.columns.publishedAt',  sortable: true },
    ],
    endpoint:       () => `/site-members/lang/${lang.value}`,
    deleteEndpoint: '/site-members',
    paginated:      false,
  },
  meta_tags: {
    columns: [
      { key: 'title',        label: 'cms.columns.title',       sortable: true },
      { key: 'page',         label: 'cms.columns.page' },
      { key: 'status',       label: 'cms.columns.status' },
      { key: 'published_at', label: 'cms.columns.publishedAt',  sortable: true },
    ],
    endpoint:       () => `/meta-tags/lang/${lang.value}`,
    deleteEndpoint: '/meta-tags',
    paginated:      true,
  },
  partner_references: {
    columns: [
      { key: 'name',         label: 'cms.columns.name',        sortable: true },
      { key: 'job_position', label: 'cms.columns.jobPosition',  sortable: true },
      { key: 'status',       label: 'cms.columns.status' },
      { key: 'published_at', label: 'cms.columns.publishedAt',  sortable: true },
    ],
    endpoint:       () => `/partner-references/lang/${lang.value}`,
    deleteEndpoint: '/partner-references',
    paginated:      true,
  },
  email_templates: {
    columns: [
      { key: 'slug',         label: 'cms.columns.slug',        sortable: true },
      { key: 'subject',      label: 'cms.columns.subject',     sortable: true },
      { key: 'published_at', label: 'cms.columns.publishedAt', sortable: true },
    ],
    endpoint:       () => `/email-templates/lang/${lang.value}`,
    deleteEndpoint: '/email-templates',
    paginated:      true,
  },
}

// ── Translation mappers ────────────────────────────────────

function mapArticles(raw: any[]): any[] {
  return raw.map((item) => {
    const langTranslations = item.news_translations ?? []
    const t = langTranslations.find((x: any) =>
      x.language?.name === lang.value,
    ) ?? langTranslations[0] ?? {}

    const catTranslations = item.category?.category_translations ?? []
    const cat = catTranslations.find((x: any) =>
      x.language_id && x.name,
    ) ?? catTranslations[0] ?? {}

    return {
      id:           item.id,
      title:        t.title   ?? '—',
      author: `${item.user?.name ?? ''} ${item.user?.surname ?? ''}`.trim() || '—',
      category:     cat.name  ?? item.category?.slug ?? '—',
      status: item.status_id === null ? '—' : item.status_id === 1 ? 'published' : 'concept',
      published_at: item.created_at?.slice(0, 10) ?? '—',
      _raw:         item,
    }
  })
}

function mapEmailTemplates(raw: any[]): any[] {
  return raw.map((item) => {
    const tr = item.email_template_translations?.find((x: any) =>
      x.language?.name === lang.value,
    ) ?? item.email_template_translations?.[0] ?? {}

    return {
      id:           item.id,
      slug:         item.slug ?? '—',
      subject:      item.subject ?? '—',
      published_at: item.created_at?.slice(0, 10) ?? '—',
      _raw:         item,
    }
  })
}

function mapReferences(raw: any[]): any[] {
  return raw.map((item) => {
    return {
      id:           item.id,
      name:         item.name         ?? '—',
      job_position: item.job_position ?? '—',
      status: item.status_id === null ? '—' : item.status_id === 1 ? 'published' : 'concept',
      published_at: item.created_at?.slice(0, 10) ?? '—',
      _raw:         item,
    }
  })
}

function mapMetaTags(raw: any[]): any[] {
  return raw.map((item) => {
    const tr = item.meta_tag_translations?.[0] ?? {}
    return {
      id:           item.id,
      title:        tr.title          ?? '—',
      page:         item.page?.name   ?? '—',
      status:       item.status_id === null ? '—' : item.status_id === 1 ? 'published' : 'concept',
      published_at: item.created_at?.slice(0, 10) ?? '—',
      _raw:         item,
    }
  })
}

function mapSiteMembers(raw: any[]): any[] {
  return raw.map((item) => {
    return {
      id:           item.id,
      name:         item.name ?? '—',
      job_position: item.job_position ?? '—',
      status:       item.status_id === null ? '—' : item.status_id === 1 ? 'published' : 'concept',
      published_at: item.created_at?.slice(0, 10) ?? '—',
      _raw:         item,
    }
  })
}

function mapPartners(raw: any[]): any[] {
  return raw.map((item) => {
    const tr = item.partner_translations?.[0] ?? {}
    const desc = tr.description ?? '—'
    return {
      id:          item.id,
      name:        item.name        ?? '—',
      description: desc.length > 50 ? desc.slice(0, 50) + '...' : desc,
      status:      item.status_id === null ? '—' : item.status_id === 1 ? 'published' : 'concept',
      published_at: item.created_at?.slice(0, 10) ?? '—',
      _raw:        item,
    }
  })
}

function mapFaq(raw: any[]): any[] {
  return raw.map((item) => {
    const tr = item.frequently_asked_question_translations?.[0] ?? {}
    return {
      id:           item.id,
      question:     tr.question  ?? '—',
      page:         item.page?.name  ?? '—',
      status:       item.status_id === null ? '—' : item.status_id === 1 ? 'published' : 'concept',
      published_at: item.created_at?.slice(0, 10) ?? '—',
      _raw:         item,
    }
  })
}

function mapBanners(raw: any[]): any[] {
  return raw.map((item) => {
    const tr = item.hero_banner_translations?.[0] ?? {}
    return {
      id:           item.id,
      title:        tr.title ?? '—',
      page:         item.page?.name ?? '—',
      status:       item.status_id === null ? '—' : item.status_id === 1 ? 'published' : 'concept',
      published_at: item.created_at?.slice(0, 10) ?? '—',
      _raw:         item,
    }
  })
}

function applyMapper(tab: TabKey, raw: any[]): any[] {
  const mappers: Record<TabKey, (r: any[]) => any[]> = {
    clanky:             mapArticles,
    partneri:           mapPartners,
    faq:                mapFaq,
    bannery:            mapBanners,
    site_members:       mapSiteMembers,
    meta_tags:          mapMetaTags,
    partner_references: mapReferences,
    email_templates:    mapEmailTemplates,
  }
  return mappers[tab](raw)
}

// ── Data & pagination ──────────────────────────────────────

const isLoading = ref(false)
const rows      = ref<any[]>([])

const pagination = ref({
  currentPage: 1,
  totalPages:  1,
  total:       0,
  perPage:     15,
})

const currentColumns = computed(() => {
  return (tabConfig[activeTab.value as TabKey]?.columns ?? []).map((col) => ({
    ...col,
    label: t(col.label),
  }))
})

const currentRows = computed(() => {
  const sortKey = sortBy.value
  if (!sortKey) return rows.value

  return [...rows.value].sort((a, b) => {
    const aValue = a[sortKey] ?? ''
    const bValue = b[sortKey] ?? ''

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDir.value === 'asc' ? aValue - bValue : bValue - aValue
    }

    const compare = String(aValue).localeCompare(String(bValue), 'sk', {
      numeric: true,
      sensitivity: 'base',
    })

    return sortDir.value === 'asc' ? compare : -compare
  })
})

async function fetchData() {
  const config = tabConfig[activeTab.value as TabKey]
  if (!config) return

  isLoading.value = true
  try {
    const params: Record<string, any> = {}
    if (config.paginated) {
      params.page     = pagination.value.currentPage
      params.per_page = pagination.value.perPage
    }

    const response = await api.get(config.endpoint(), { params }) as any
    let raw: any[]

    if (config.paginated) {
      raw = response?.data ?? []
      pagination.value.total       = response?.total        ?? 0
      pagination.value.currentPage = response?.current_page ?? 1
      pagination.value.totalPages  = response?.last_page    ?? 1
    } else {
      raw = Array.isArray(response) ? response : (response?.data ?? [])
      pagination.value.total      = raw.length
      pagination.value.totalPages = 1
    }

    rows.value = applyMapper(activeTab.value as TabKey, raw)
  } catch {
    // keep existing rows
  } finally {
    isLoading.value = false
  }
}

function onPageChange(page: number) {
  pagination.value.currentPage = page
  fetchData()
}

function switchTab(key: string) {
  activeTab.value              = key
  pagination.value.currentPage = 1
  pagination.value.totalPages  = 1
  pagination.value.total       = 0
  rows.value                   = []
  fetchData()
}

const route = useRoute()
const router = useRouter()

function handleRouteQuery(q: Record<string, any>) {
  const tab = q?.tab
  if (tab && tabs.some((t) => t.key === tab)) {
    activeTab.value = tab
  }

  const create = q?.create
  if (create === '1' || create === 'true') {
    openCreateModal()

    const newQuery = { ...route.query }
    delete newQuery.create
    router.replace({ path: route.path, query: newQuery }).catch(() => {})
  }
}

onMounted(() => {
  handleRouteQuery(route.query as any)
  fetchData()
})

watch(
  () => route.query,
  (q) => handleRouteQuery(q as any),
)

// ── Modals ─────────────────────────────────────────────────

const editingItem               = ref<any>(null)
const deletingItem              = ref<any>(null)
const showArticleModal          = ref(false)
const showPartnerModal          = ref(false)
const showFaqModal              = ref(false)
const showBannerModal           = ref(false)
const showDeleteModal           = ref(false)
const isDeleting                = ref(false)
const showMetaTagModal          = ref(false)
const showPartnerReferenceModal = ref(false)
const showSiteMemberModal       = ref(false)
const showEmailTemplateModal    = ref(false)

const deletingItemName = computed(() => {
  if (!deletingItem.value) return ''
  return deletingItem.value.title ?? deletingItem.value.name ?? deletingItem.value.question ?? ''
})

function openCreateModal() {
  editingItem.value = null
  openModalForTab()
}

async function openEditModal(row: any) {
  try {
    isLoading.value = true

    const endpointMap: Record<TabKey, string> = {
      clanky:             `/news/cms/${row.id}`,
      partneri:           `/partners/cms/${row.id}`,
      faq:                `/faq/cms/${row.id}`,
      bannery:            `/hero-banners/cms/${row.id}`,
      site_members:       `/site-members/cms/${row.id}`,
      meta_tags:          `/meta-tags/cms/${row.id}`,
      partner_references: `/partner-references/cms/${row.id}`,
      email_templates:    `/email-templates/cms/${row.id}`,
    }

    const endpoint = endpointMap[activeTab.value as TabKey]
    editingItem.value = await api.get(endpoint)
    openModalForTab()
  } catch {
    addToast({
      message: t('cms.toast.loadError'),
      type: 'error',
    })
  } finally {
    isLoading.value = false
  }
}

function openModalForTab() {
  const modalMap: Record<TabKey, Ref<boolean>> = {
    clanky:             showArticleModal,
    partneri:           showPartnerModal,
    faq:                showFaqModal,
    bannery:            showBannerModal,
    site_members:       showSiteMemberModal,
    meta_tags:          showMetaTagModal,
    partner_references: showPartnerReferenceModal,
    email_templates:    showEmailTemplateModal,
  }
  const modal = modalMap[activeTab.value as TabKey]
  if (modal) modal.value = true
}

function openDeleteModal(row: any) {
  deletingItem.value    = row
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!deletingItem.value) return
  const config = tabConfig[activeTab.value as TabKey]
  if (!config) return

  isDeleting.value = true
  try {
    await api.delete(`${config.deleteEndpoint}/${deletingItem.value.id}`)
    addToast({ message: t('cms.toast.deleteSuccess'), type: 'success' })
    showDeleteModal.value = false
    deletingItem.value    = null
    await fetchData()
  } catch (e: any) {
    addToast({ message: t('cms.toast.deleteError'), type: 'error' })
  } finally {
    isDeleting.value = false
  }
}
</script>