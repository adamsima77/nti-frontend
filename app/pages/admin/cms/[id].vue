<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <!-- Breadcrumbs -->
    <UiBreadcrumbs
      :items="breadcrumbs"
      class="mb-6"
    />

    <!-- Page header -->
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold text-navy">Úprava stránky</h1>
      <div class="flex items-center gap-3">
        <UiButton
          variant="ghost"
          @click="navigateTo(localePath('/admin/cms'))"
        >
          Zrušiť
        </UiButton>
        <UiButton
          :disabled="isSaving"
          @click="handleSave"
        >
          <Save class="w-4 h-4" />
          {{ isSaving ? 'Ukladanie...' : 'Uložiť' }}
        </UiButton>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="isLoading"
      class="space-y-4"
    >
      <UiSkeleton
        variant="text"
        width="100%"
      />
      <UiSkeleton
        variant="rect"
        width="100%"
        height="200px"
      />
    </div>

    <template v-else>
      <!-- Page metadata -->
      <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6 space-y-4">
        <h2 class="text-lg font-semibold text-navy">Nastavenia stránky</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField
            label="Názov stránky"
            required
          >
            <UiInput
              v-model="page.title"
              placeholder="Domov"
            />
          </UiFormField>
          <UiFormField
            label="URL slug"
            required
          >
            <UiInput
              v-model="page.slug"
              placeholder="/o-nas"
            />
          </UiFormField>
        </div>
        <UiFormField label="Stav">
          <UiSelect
            v-model="page.status"
            :options="statusOptions"
          />
        </UiFormField>
      </div>

      <!-- Block editor -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h2 class="text-lg font-semibold text-navy mb-4">Bloky</h2>
        <AdminBlockEditor v-model="page.blocks" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Save } from 'lucide-vue-next'
import type { CmsBlock } from '~/types/cms'

const localePath = useLocalePath()

definePageMeta({
  layout: 'admin',
  // middleware: ['auth'],
})

const route = useRoute()
const api = useApi()
const { addToast } = useToast()

const pageId = computed(() => route.params.id as string)
const isLoading = ref(true)
const isSaving = ref(false)

const page = ref<{
  title: string
  slug: string
  status: string
  blocks: CmsBlock[]
}>({
  title: '',
  slug: '',
  status: 'draft',
  blocks: [],
})

useHead({ title: computed(() => `${page.value.title || 'Stránka'} — CMS — Admin | NTI`) })

const breadcrumbs = computed(() => [
  { label: 'CMS', to: localePath('/admin/cms') },
  { label: 'Stránky', to: localePath('/admin/cms') },
  { label: page.value.title || 'Nová stránka' },
])

const statusOptions = [
  { value: 'active', label: 'Aktívna' },
  { value: 'draft', label: 'Koncept' },
]

async function fetchPage() {
  isLoading.value = true
  try {
    const response = await api.get(`/v1/admin/cms/pages/${pageId.value}`)
    const data = response.data || response
    page.value = {
      title: data.title || '',
      slug: data.slug || '',
      status: data.status || 'draft',
      blocks: data.blocks || [],
    }
  } catch {
    // Fallback mock data when API unavailable
    page.value = {
      title: 'Domov',
      slug: '/',
      status: 'active',
      blocks: [
        {
          id: 1,
          type: 'HeroBlock',
          content: {
            title: 'Objav Nitriansky Technický Inkubátor!',
            description: 'Interaktívne programy, mentorstvo a komunita.',
            primaryCtaText: 'Začni teraz',
            primaryCtaLink: '/auth/login',
            secondaryCtaText: 'Zisti viac',
            secondaryCtaLink: '/o-nas',
          },
          order: 0,
        },
        {
          id: 2,
          type: 'TextBlock',
          content: {
            heading: 'O nás',
            content: '<p>NTI je inkubátor zameraný na technologické startupy.</p>',
            alignment: 'left',
          },
          order: 1,
        },
        {
          id: 3,
          type: 'CtaBlock',
          content: {
            title: 'Priprav sa na budúcnosť',
            description: 'Prihlás sa do nášho programu',
            buttonText: 'Prihlásiť sa',
            buttonLink: '/prihlasky',
            variant: 'primary',
          },
          order: 2,
        },
      ],
    }
  } finally {
    isLoading.value = false
  }
}

async function handleSave() {
  if (!page.value.title.trim()) {
    addToast({ message: 'Názov stránky je povinný', type: 'warning' })
    return
  }
  isSaving.value = true
  try {
    await api.put(`/v1/admin/cms/pages/${pageId.value}`, {
      title: page.value.title,
      slug: page.value.slug,
      status: page.value.status,
      blocks: page.value.blocks,
    })
    addToast({ message: 'Stránka bola uložená', type: 'success' })
  } catch {
    addToast({ message: 'Nepodarilo sa uložiť stránku', type: 'error' })
  } finally {
    isSaving.value = false
  }
}

onMounted(() => fetchPage())
</script>
