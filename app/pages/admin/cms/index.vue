<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-navy">CMS</h1>
        <p class="text-gray-500 mt-1">Sprava obsahu, stranok a clankov</p>
      </div>
      <UiButton>
        <Plus class="w-4 h-4" />
        Pridat {{ activeTab }}
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
      >
        <template #cell-status="{ value }">
          <UiStatusBadge
            v-if="value"
            :status="value"
          />
        </template>

        <template #row-actions>
          <div class="flex items-center gap-2">
            <button class="text-blue-600 hover:text-blue-800">
              <Pencil class="w-4 h-4" />
            </button>
            <button class="text-gray-400 hover:text-danger-500">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </template>
      </UiDataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  // middleware: ['auth'], // TODO: re-enable when backend is available
})

useHead({ title: 'CMS — Admin | NTI' })

const tabs = [
  { key: 'stranky', label: 'Stranky' },
  { key: 'clanky', label: 'Clanky' },
  { key: 'partneri', label: 'Partneri' },
  { key: 'faq', label: 'FAQ' },
]

const activeTab = ref('stranky')

const tabData: Record<
  string,
  { columns: Array<{ key: string; label: string; sortable?: boolean }>; rows: Array<Record<string, any>> }
> = {
  stranky: {
    columns: [
      { key: 'title', label: 'Nazov', sortable: true },
      { key: 'slug', label: 'URL slug' },
      { key: 'status', label: 'Stav', sortable: true },
      { key: 'updated', label: 'Posledna uprava', sortable: true },
    ],
    rows: [
      { id: 1, title: 'Domov', slug: '/', status: 'active', updated: '20.03.2026' },
      { id: 2, title: 'O nas', slug: '/o-nas', status: 'active', updated: '18.03.2026' },
      { id: 3, title: 'Programy', slug: '/programy', status: 'draft', updated: '25.03.2026' },
    ],
  },
  clanky: {
    columns: [
      { key: 'title', label: 'Nazov', sortable: true },
      { key: 'author', label: 'Autor' },
      { key: 'status', label: 'Stav', sortable: true },
      { key: 'published', label: 'Publikovane', sortable: true },
    ],
    rows: [
      { id: 1, title: 'NTI otvara jarny inkubator', author: 'Marek Dvorak', status: 'active', published: '01.03.2026' },
      { id: 2, title: 'Uspesne timy zimy 2025', author: 'Lucia Nemcova', status: 'active', published: '15.02.2026' },
      { id: 3, title: 'Ako napisat dobru prihlasku', author: 'Tomas Benes', status: 'draft', published: '—' },
      { id: 4, title: 'Partneri NTI pre rok 2026', author: 'Admin', status: 'active', published: '10.01.2026' },
    ],
  },
  partneri: {
    columns: [
      { key: 'name', label: 'Nazov', sortable: true },
      { key: 'type', label: 'Typ' },
      { key: 'website', label: 'Web' },
    ],
    rows: [
      { id: 1, name: 'TechCorp Slovakia', type: 'Hlavny partner', website: 'techcorp.sk' },
      { id: 2, name: 'InnoFund', type: 'Investor', website: 'innofund.sk' },
      { id: 3, name: 'UKF Nitra', type: 'Akademicky partner', website: 'ukf.sk' },
    ],
  },
  faq: {
    columns: [
      { key: 'question', label: 'Otazka', sortable: true },
      { key: 'category', label: 'Kategoria' },
      { key: 'updated', label: 'Posledna uprava', sortable: true },
    ],
    rows: [
      { id: 1, question: 'Ako sa prihlasit do programu?', category: 'Prihlasovanie', updated: '15.03.2026' },
      { id: 2, question: 'Kolko clenov moze mat tim?', category: 'Timy', updated: '10.03.2026' },
      { id: 3, question: 'Ake su terminy?', category: 'Vseobecne', updated: '01.03.2026' },
    ],
  },
}

const currentColumns = computed(() => tabData[activeTab.value]?.columns ?? [])
const currentRows = computed(() => tabData[activeTab.value]?.rows ?? [])
</script>
