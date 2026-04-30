<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-navy">CMS</h1>
        <p class="text-gray-500 mt-1">Správa obsahu, stránok a článkov</p>
      </div>
      <UiButton @click="openCreateModal">
        <Plus class="w-4 h-4" />
        Pridať {{ activeTabLabel }}
      </UiButton>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="[
          'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
          activeTab === tab.key ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-gray-700',
        ]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="bg-white rounded-lg border border-gray-200">
      <UiDataTable
        :columns="currentColumns"
        :rows="currentRows"
        :loading="isLoading"
      >
        <template #cell-status="{ value }">
          <UiStatusBadge
            v-if="value"
            :status="value"
          />
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
              v-if="activeTab === 'stranky'"
              class="text-blue-600 hover:text-blue-800"
              title="Upraviť bloky"
              @click="navigateTo(localePath(`/admin/cms/${row.id}`))"
            >
              <LayoutGrid class="w-4 h-4" />
            </button>
            <button
              class="text-blue-600 hover:text-blue-800"
              title="Upraviť"
              @click="openEditModal(row)"
            >
              <Pencil class="w-4 h-4" />
            </button>
            <button
              class="text-gray-400 hover:text-danger-500"
              title="Vymazať"
              @click="openDeleteModal(row)"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </template>
      </UiDataTable>
    </div>

    <!-- Modals -->
    <AdminCmsBannerModal
      v-model="showBannerModal"
      :banner="editingItem"
      @saved="fetchData"
    />
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
    <AdminConfirmDeleteModal
      v-model="showDeleteModal"
      :item-name="deletingItemName"
      :is-deleting="isDeleting"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { Plus, Pencil, Trash2, LayoutGrid } from 'lucide-vue-next'

const localePath = useLocalePath()

definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
})

useHead({ title: 'CMS — Admin | NTI' })

const api = useApi()
const { addToast } = useToast()

const tabs = [
  { key: 'stranky', label: 'Stránky' },
  { key: 'clanky', label: 'Články' },
  { key: 'partneri', label: 'Partneri' },
  { key: 'faq', label: 'FAQ' },
  { key: 'bannery', label: 'Bannery / CTA' },
]

const activeTab = ref('stranky')
const activeTabLabel = computed(() => tabs.find((t) => t.key === activeTab.value)?.label || '')
const isLoading = ref(false)

// Tab data
const tabConfig: Record<
  string,
  { columns: Array<{ key: string; label: string; sortable?: boolean }>; endpoint: string }
> = {
  stranky: {
    columns: [
      { key: 'title', label: 'Názov', sortable: true },
      { key: 'slug', label: 'URL slug' },
      { key: 'status', label: 'Stav', sortable: true },
      { key: 'updated_at', label: 'Posledná úprava', sortable: true },
    ],
    endpoint: '/v1/admin/cms/pages',
  },
  clanky: {
    columns: [
      { key: 'title', label: 'Názov', sortable: true },
      { key: 'author', label: 'Autor' },
      { key: 'status', label: 'Stav', sortable: true },
      { key: 'published_at', label: 'Publikované', sortable: true },
    ],
    endpoint: '/v1/admin/cms/articles',
  },
  partneri: {
    columns: [
      { key: 'name', label: 'Názov', sortable: true },
      { key: 'type', label: 'Typ' },
      { key: 'website', label: 'Web' },
    ],
    endpoint: '/v1/admin/cms/partners',
  },
  faq: {
    columns: [
      { key: 'question', label: 'Otázka', sortable: true },
      { key: 'category', label: 'Kategória' },
      { key: 'updated_at', label: 'Posledná úprava', sortable: true },
    ],
    endpoint: '/v1/admin/cms/faq',
  },
  bannery: {
    columns: [
      { key: 'title', label: 'Názov', sortable: true },
      { key: 'buttonText', label: 'Tlačidlo' },
      { key: 'placement', label: 'Umiestnenie' },
      { key: 'status', label: 'Stav', sortable: true },
      { key: 'updated_at', label: 'Posledná úprava', sortable: true },
    ],
    endpoint: '/v1/admin/cms/banners',
  },
}

const mockData: Record<string, any[]> = {
  stranky: [
    { id: 1, title: 'Domov', slug: '/', status: 'active', updated_at: '20.03.2026' },
    { id: 2, title: 'O nás', slug: '/o-nas', status: 'active', updated_at: '18.03.2026' },
    { id: 3, title: 'Programy', slug: '/programy', status: 'draft', updated_at: '25.03.2026' },
    { id: 4, title: 'Kontakt', slug: '/kontakt', status: 'active', updated_at: '10.03.2026' },
  ],
  clanky: [
    {
      id: 1,
      title: 'NTI otvára jarný inkubátor',
      author: 'Marek Dvořák',
      status: 'active',
      published_at: '01.03.2026',
    },
    { id: 2, title: 'Úspešné tímy zimy 2025', author: 'Lucia Nemcová', status: 'active', published_at: '15.02.2026' },
    { id: 3, title: 'Ako napísať dobrú prihlášku', author: 'Tomáš Beneš', status: 'draft', published_at: '—' },
    { id: 4, title: 'Partneri NTI pre rok 2026', author: 'Admin', status: 'active', published_at: '10.01.2026' },
  ],
  partneri: [
    { id: 1, name: 'TechCorp Slovakia', type: 'Hlavný partner', website: 'techcorp.sk' },
    { id: 2, name: 'InnoFund', type: 'Investor', website: 'innofund.sk' },
    { id: 3, name: 'UKF Nitra', type: 'Akademický partner', website: 'ukf.sk' },
    { id: 4, name: 'DataHouse', type: 'Technologický partner', website: 'datahouse.sk' },
  ],
  faq: [
    { id: 1, question: 'Ako sa prihlásiť do programu?', category: 'Prihlasovanie', updated_at: '15.03.2026' },
    { id: 2, question: 'Koľko členov môže mať tím?', category: 'Tímy', updated_at: '10.03.2026' },
    { id: 3, question: 'Aké sú termíny?', category: 'Všeobecné', updated_at: '01.03.2026' },
  ],
  bannery: [
    {
      id: 1,
      title: 'Jarný inkubátor 2026',
      buttonText: 'Prihlásiť sa',
      placement: 'homepage-top',
      status: 'active',
      updated_at: '20.03.2026',
    },
    {
      id: 2,
      title: 'Deň otvorených dverí',
      buttonText: 'Zistiť viac',
      placement: 'homepage-bottom',
      status: 'draft',
      updated_at: '15.03.2026',
    },
  ],
}

const rows = ref<Record<string, any[]>>({
  stranky: [...mockData.stranky],
  clanky: [...mockData.clanky],
  partneri: [...mockData.partneri],
  faq: [...mockData.faq],
  bannery: [...mockData.bannery],
})

const currentColumns = computed(() => tabConfig[activeTab.value]?.columns ?? [])
const currentRows = computed(() => rows.value[activeTab.value] ?? [])

// Fetch data
async function fetchData() {
  const config = tabConfig[activeTab.value]
  if (!config) return
  isLoading.value = true
  try {
    const response = await api.get(config.endpoint)
    rows.value[activeTab.value] = response.data || response || []
  } catch {
    // Keep existing data on error
  } finally {
    isLoading.value = false
  }
}

watch(activeTab, () => fetchData(), { immediate: true })

// Modal state
const editingItem = ref<any>(null)
const deletingItem = ref<any>(null)
const showBannerModal = ref(false)
const showArticleModal = ref(false)
const showPartnerModal = ref(false)
const showFaqModal = ref(false)
const showDeleteModal = ref(false)
const isDeleting = ref(false)

const deletingItemName = computed(() => {
  if (!deletingItem.value) return ''
  return deletingItem.value.title || deletingItem.value.name || deletingItem.value.question || ''
})

function openCreateModal() {
  editingItem.value = null
  openModalForTab()
}

function openEditModal(row: any) {
  editingItem.value = row
  openModalForTab()
}

function openModalForTab() {
  const modalMap: Record<string, Ref<boolean>> = {
    stranky: showBannerModal, // Pages use the page editor route instead
    clanky: showArticleModal,
    partneri: showPartnerModal,
    faq: showFaqModal,
    bannery: showBannerModal,
  }

  // For stranky (pages), navigate to editor if editing, or create via simple modal
  if (activeTab.value === 'stranky' && editingItem.value) {
    navigateTo(localePath(`/admin/cms/${editingItem.value.id}`))
    return
  }

  const modal = modalMap[activeTab.value]
  if (modal) modal.value = true
}

function openDeleteModal(row: any) {
  deletingItem.value = row
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!deletingItem.value) return
  const config = tabConfig[activeTab.value]
  if (!config) return

  isDeleting.value = true
  try {
    await api.delete(`${config.endpoint}/${deletingItem.value.id}`)
    addToast({ message: 'Položka bola vymazaná', type: 'success' })
    showDeleteModal.value = false
    deletingItem.value = null
    await fetchData()
  } catch {
    addToast({ message: 'Nepodarilo sa vymazať položku', type: 'error' })
  } finally {
    isDeleting.value = false
  }
}
</script>
