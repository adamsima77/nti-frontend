<template>
  <UiModal
    :model-value="modelValue"
    :title="isEditing ? 'Upraviť článok' : 'Nový článok'"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- Language tabs (edit only) -->
    <div v-if="isEditing && availableLanguages.length" class="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
      <button
        v-for="lang in availableLanguages"
        :key="lang.id"
        :class="[
          'px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5',
          activeLangId === lang.id
            ? 'bg-white text-navy shadow-sm'
            : 'text-gray-500 hover:text-gray-700',
        ]"
        @click="switchLang(lang.id)"
      >
        {{ lang.name.toUpperCase() }}
        <span
          :class="[
            'w-1.5 h-1.5 rounded-full',
            hasTranslation(lang.id) ? 'bg-green-500' : 'bg-gray-300',
          ]"
        />
      </button>
    </div>

    <div v-if="metaLoading" class="flex justify-center py-10">
      <UiLoader />
    </div>

    <div v-else class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <UiFormField
          v-model="form.slug"
          label="Slug"
          field="slug"
          placeholder="moj-clanok"
          :touched="touched"
          :is-valid="isValid"
          :error="errors.slug"
        />
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">Kategória</label>
          <UiSelect v-model="form.category_id" :options="categoryOptions" />
          <p v-if="errors.category_id" class="text-xs text-red-500 mt-1">{{ errors.category_id }}</p>
        </div>
      </div>

      <!-- Language selector (create only) -->
      <div v-if="!isEditing">
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">Jazyk</label>
        <UiSelect v-model="form.language_id" :options="languageOptions" />
        <p v-if="errors.language_id" class="text-xs text-red-500 mt-1">{{ errors.language_id }}</p>
      </div>

      <UiFormField
        v-model="form.title"
        label="Nadpis"
        field="title"
        placeholder="Nadpis článku"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.title"
      />

      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">Náhľad obrázku</label>
        <UiFileUpload
          v-model="form.image"
          label="Obrázok (jpeg, jpg, png)"
          accept=".jpg,.jpeg,.png"
          :max-size="4"
        />
        <div class="mt-2">
          <p v-if="form.image_url" class="text-xs text-gray-400 mt-2">Aktuálne: <a :href="form.image_url" target="_blank" class="text-blue-600 hover:underline">zobraziť</a></p>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">Obsah</label>
        <ClientOnly>
          <Editor v-model="form.description" />
        </ClientOnly>
        <p v-if="errors.description" class="text-xs text-red-500 mt-1">{{ errors.description }}</p>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">Stav</label>
        <UiSelect v-model="form.status_id" :options="statusOptions" />
        <p v-if="errors.status_id" class="text-xs text-red-500 mt-1">{{ errors.status_id }}</p>
      </div>
    </div>

    <template #actions>
      <UiButton variant="ghost" @click="emit('update:modelValue', false)">Zrušiť</UiButton>
      <UiButton :disabled="isSaving || metaLoading" @click="handleSubmit">
        {{ isSaving ? 'Ukladanie...' : 'Uložiť' }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
interface Language {
  id: number
  name: string
}

interface NewsTranslation {
  language_id: number
  title: string
  description: string
}

interface ArticleRaw {
  id?: number
  slug?: string
  category_id?: number
  status_id?: number
  image_url?: string
  cms_status?: { id: number; name: string }
  news_translations?: NewsTranslation[]
}

const props = defineProps<{
  modelValue: boolean
  article?: ArticleRaw | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const api = useApi()
const { addToast } = useToast()
const { locale } = useI18n()
const lang = computed(() => (locale.value === 'en' ? 'en' : 'sk'))

// ── Meta ───────────────────────────────────────────────────

const availableLanguages = ref<Language[]>([])
const statusOptions      = ref<{ value: number; label: string }[]>([])
const categoryOptions    = ref<{ value: number; label: string }[]>([])
const metaLoading        = ref(false)

const languageOptions = computed(() =>
  availableLanguages.value.map((l) => ({ value: l.id, label: l.name.toUpperCase() })),
)

async function fetchMeta() {
  metaLoading.value = true
  try {
    const [langs, statuses, cats] = await Promise.all([
      api.get('/languages') as Promise<any>,
      api.get('/cms-statuses') as Promise<any>,
      api.get(`/categories/lang/${lang.value}`) as Promise<any>,
    ])

    // languages — apiResource, may be paginated
    const langList: any[] = Array.isArray(langs) ? langs : (langs?.data ?? [])
    availableLanguages.value = langList.map((l: any) => ({ id: l.id, name: l.name }))

    // statuses — plain array from our simple controller
    const statusList: any[] = Array.isArray(statuses) ? statuses : (statuses?.data ?? [])
    statusOptions.value = statusList.map((s: any) => ({ value: s.id, label: s.name }))

    // categories/lang returns paginated { data: [] }
    // each item has category_translations: [{ name, language_id }]
    const catList: any[] = cats?.data ?? []
    categoryOptions.value = catList
      .map((c: any) => ({
        value: c.id,
        label: c.category_translations?.[0]?.name ?? c.slug ?? `#${c.id}`,
      }))
  } catch {
    addToast({ message: 'Nepodarilo sa načítať dáta formulára', type: 'error' })
  } finally {
    metaLoading.value = false
  }
}

// ── State ──────────────────────────────────────────────────

const isEditing    = computed(() => !!props.article?.id)
const isSaving     = ref(false)
const errors       = ref<Record<string, string>>({})
const touched      = ref<Record<string, boolean>>({})
const activeLangId = ref<number | null>(null)

const emptyForm = () => ({
  slug:        '',
  category_id: null as number | null,
  language_id: null as number | null,
    image: null as File | null,
    image_url: '',
  title:       '',
  description: '',
  status_id:   null as number | null,
})

const form = ref(emptyForm())

const imagePreview = ref<string | null>(null)
let currentObjectUrl: string | null = null

function setPreviewFromFile(file: File | null) {
  if (currentObjectUrl) {
    try { URL.revokeObjectURL(currentObjectUrl) } catch {}
    currentObjectUrl = null
  }
  if (file instanceof File) {
    currentObjectUrl = URL.createObjectURL(file)
    imagePreview.value = currentObjectUrl
  } else {
    imagePreview.value = form.value.image_url || null
  }
}

onUnmounted(() => {
  if (currentObjectUrl) {
    try { URL.revokeObjectURL(currentObjectUrl) } catch {}
  }
})

// ── Watchers ───────────────────────────────────────────────

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return

    errors.value       = {}
    touched.value      = {}
    activeLangId.value = null

    await fetchMeta()

    const firstLangId = availableLanguages.value[0]?.id ?? null
    const defaultStatusId = statusOptions.value.find((s) =>
      s.label.toLowerCase().includes('koncept'),
    )?.value ?? statusOptions.value[0]?.value ?? null

    if (props.article?.id) {
      activeLangId.value = firstLangId
      if (firstLangId) fillFormForLang(props.article, firstLangId)
    } else {
      form.value = {
        ...emptyForm(),
        language_id: firstLangId,
        status_id:   defaultStatusId,
      }
    }
  },
)

// handles parent swapping article prop while modal stays open
watch(
  () => props.article,
  (article) => {
    if (!props.modelValue || metaLoading.value) return
    errors.value  = {}
    touched.value = {}

    if (article?.id) {
      activeLangId.value = availableLanguages.value[0]?.id ?? null
      if (activeLangId.value) fillFormForLang(article, activeLangId.value)
    } else {
      form.value = emptyForm()
    }
  },
)

function fillFormForLang(article: ArticleRaw, langId: number) {
  const t = article.news_translations?.find((x) => x.language_id === langId) ?? null
  form.value = {
    slug:        article.slug        ?? '',
    category_id: article.category_id ?? null,
    language_id: langId,
    image: null,
    image_url: article.image_url ?? '',
    title:       t?.title            ?? '',
    description: t?.description      ?? '',
    status_id:   article.status_id   ?? article.cms_status?.id ?? null,
  }
}

// react to file selection changes to show preview
watch(() => form.value.image, (file) => {
  setPreviewFromFile(file as File | null)
})

// when modal is opened for editing, ensure preview shows existing URL
watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      // clear selected file preview when closing
      if (currentObjectUrl) {
        try { URL.revokeObjectURL(currentObjectUrl) } catch {}
        currentObjectUrl = null
      }
      imagePreview.value = null
    } else {
      // on open, show existing image_url if any
      imagePreview.value = form.value.image_url || null
    }
  }
)

function switchLang(langId: number) {
  activeLangId.value = langId
  if (props.article) fillFormForLang(props.article, langId)
}

function hasTranslation(langId: number): boolean {
  return !!props.article?.news_translations?.some(
    (t) => t.language_id === langId && t.title?.trim(),
  )
}

// ── Validation ─────────────────────────────────────────────

function isValid(field: string) {
  return !errors.value[field]
}

function isContentEmpty(html: string) {
  return !html.replace(/<[^>]*>/g, '').trim()
}

function validate(): boolean {
  errors.value  = {}
  touched.value = {}

  if (!form.value.slug.trim())
    { errors.value.slug = 'Slug je povinný'; touched.value.slug = true }

  if (!form.value.category_id)
    { errors.value.category_id = 'Kategória je povinná' }

  if (!isEditing.value && !form.value.language_id)
    { errors.value.language_id = 'Jazyk je povinný' }

  if (!form.value.title.trim())
    { errors.value.title = 'Nadpis je povinný'; touched.value.title = true }

  if (isContentEmpty(form.value.description))
    { errors.value.description = 'Obsah je povinný' }

  return Object.keys(errors.value).length === 0
}

// ── Submit ─────────────────────────────────────────────────

async function handleSubmit() {
  if (!validate()) return
  isSaving.value = true

  try {
    // Use FormData so we can include an optional cover image file
    const payload = new FormData()
    payload.append('slug', form.value.slug)
    if (form.value.category_id !== null) payload.append('category_id', String(form.value.category_id))
    payload.append('language_id', String(isEditing.value ? (activeLangId.value ?? '') : (form.value.language_id ?? '')))
    payload.append('title', form.value.title)
    payload.append('description', form.value.description)
    if (form.value.status_id !== null) payload.append('status_id', String(form.value.status_id))

    if (form.value.image instanceof File) {
      payload.append('image', form.value.image)
    }

    if (isEditing.value) {
      // Some backends expect `_method=PUT` when sending multipart via POST
      await api.post(`/news/${props.article!.id}?_method=PUT`, payload)
    } else {
      await api.post('/news', payload)
    }

    addToast({
      message: isEditing.value ? 'Článok bol aktualizovaný' : 'Článok bol vytvorený',
      type: 'success',
    })
    emit('saved')
    emit('update:modelValue', false)
  } catch (e: any) {
    const laravelErrors = e?.response?.data?.errors
    if (laravelErrors) {
      Object.entries(laravelErrors).forEach(([field, msgs]: any) => {
        errors.value[field]  = Array.isArray(msgs) ? msgs[0] : msgs
        touched.value[field] = true
      })
    } else {
      addToast({ message: 'Nepodarilo sa uložiť článok', type: 'error' })
    }
  } finally {
    isSaving.value = false
  }
}
</script>