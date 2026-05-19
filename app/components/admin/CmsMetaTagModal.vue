<template>
  <UiModal
    :model-value="modelValue"
    :title="isEditing ? 'Upraviť meta tagy' : 'Nové meta tagy'"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- LANGUAGE TABS (EDIT ONLY) -->
    <div
      v-if="isEditing && availableLanguages.length"
      class="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit"
    >
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

      <!-- PAGE SELECT (CREATE ONLY) -->
      <div v-if="!isEditing">
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">Stránka</label>
        <UiSelect v-model="form.page_id" :options="pageOptions" />
        <p v-if="errors.page_id" class="text-xs text-red-500 mt-1">
          {{ errors.page_id }}
        </p>
      </div>

      <!-- LANGUAGE SELECT (CREATE ONLY) -->
      <div v-if="!isEditing">
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">Jazyk</label>
        <UiSelect v-model="form.language_id" :options="languageOptions" />
        <p v-if="errors.language_id" class="text-xs text-red-500 mt-1">
          {{ errors.language_id }}
        </p>
      </div>

      <!-- STATUS -->
      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">Stav</label>
        <UiSelect v-model="form.status_id" :options="statusOptions" />
        <p v-if="errors.status_id" class="text-xs text-red-500 mt-1">
          {{ errors.status_id }}
        </p>
      </div>

      <!-- TITLE -->
      <UiFormField
        v-model="form.title"
        label="Title"
        field="title"
        placeholder="SEO title"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.title"
      />

      <!-- DESCRIPTION -->
      <UiFormField
        v-model="form.description"
        label="Description"
        field="description"
        placeholder="Meta description"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.description"
      />

      <!-- OG TITLE -->
      <UiFormField
        v-model="form.og_title"
        label="OG Title"
        field="og_title"
        placeholder="OpenGraph title"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.og_title"
      />

      <!-- OG DESCRIPTION -->
      <UiFormField
        v-model="form.og_description"
        label="OG Description"
        field="og_description"
        placeholder="OpenGraph description"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.og_description"
      />

      <!-- OG TYPE -->
      <UiFormField
        v-model="form.og_type"
        label="OG Type"
        field="og_type"
        placeholder="website / article / product"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.og_type"
      />

      <!-- OG URL -->
      <UiFormField
        v-model="form.og_url"
        label="OG URL"
        field="og_url"
        placeholder="https://..."
        :touched="touched"
        :is-valid="isValid"
        :error="errors.og_url"
      />

      <!-- IMAGE -->
      <UiFileUpload
        v-model="form.og_image"
        label="OG Image"
        description="Nahraj obrázok pre OpenGraph preview"
        accept=".jpg,.png,.webp"
        :max-size="5"
        @update:model-value="handleImageChange"
      />

      <!-- IMAGE PREVIEW -->
      <div class="mt-2">
        <img
          v-if="imagePreview"
          :src="imagePreview"
          alt="preview"
          class="max-h-40 rounded-md object-contain"
        />
        <p v-if="form.image_url && !imagePreview" class="text-xs text-gray-400 mt-2">
          Aktuálne: <a :href="form.image_url" target="_blank" class="text-blue-600 hover:underline">zobraziť</a>
        </p>
      </div>

    </div>

    <template #actions>
      <UiButton variant="ghost" @click="emit('update:modelValue', false)">
        Zrušiť
      </UiButton>

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

interface Status {
  value: number
  label: string
}

interface Page {
  id: number
  name: string
}

interface MetaTranslation {
  language_id: number
  title: string
  description: string
  og_title: string
  og_description: string
  og_type: string
  og_url: string
}

interface MetaTagRaw {
  id?: number
  page_id?: number
  status_id?: number
  image_url?: string
  meta_tag_translations?: MetaTranslation[]
}

const props = defineProps<{
  modelValue: boolean
  metaTag?: MetaTagRaw | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const api = useApi()
const { addToast } = useToast()

// ── META ─────────────────────────────────────────────
const availableLanguages = ref<Language[]>([])
const statusOptions = ref<Status[]>([])
const availablePages = ref<Page[]>([])
const metaLoading = ref(false)

const languageOptions = computed(() =>
  availableLanguages.value.map(l => ({
    value: l.id,
    label: l.name.toUpperCase(),
  }))
)

const pageOptions = computed(() =>
  availablePages.value.map(p => ({
    value: p.id,
    label: p.name,
  }))
)

async function fetchMeta() {
  metaLoading.value = true
  try {
    const [langs, statuses, pages] = await Promise.all([
      api.get('/languages'),
      api.get('/cms-statuses'),
      api.get('/pages'),
    ])

    const langList: any[] = Array.isArray(langs) ? langs : (langs?.data ?? [])
    availableLanguages.value = langList.map(l => ({ id: l.id, name: l.name }))

    const statusList: any[] = Array.isArray(statuses) ? statuses : (statuses?.data ?? [])
    statusOptions.value = statusList.map(s => ({ value: s.id, label: s.name }))

    const pageList: any[] = Array.isArray(pages) ? pages : (pages?.data ?? [])
    availablePages.value = pageList.map(p => ({ id: p.id, name: p.name }))

  } finally {
    metaLoading.value = false
  }
}

// ── STATE ────────────────────────────────────────────
const isEditing = computed(() => !!props.metaTag?.id)
const isSaving = ref(false)
const imagePreview = ref<string | null>(null)

const errors = ref<Record<string, string>>({})
const touched = ref<Record<string, boolean>>({})
const activeLangId = ref<number | null>(null)

const emptyForm = () => ({
  page_id: null as number | null,
  language_id: null as number | null,
  status_id: null as number | null,
  title: '',
  description: '',
  og_title: '',
  og_description: '',
  og_type: '',
  og_url: '',
  og_image: null as File | null,
  image_url: null as string | null,
})

const form = ref(emptyForm())

// ── IMAGE PREVIEW ────────────────────────────────────
function handleImageChange(file: File | null) {
  form.value.og_image = file
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  } else {
    imagePreview.value = null
  }
}

// ── LANG SWITCH ─────────────────────────────────────
function switchLang(langId: number) {
  activeLangId.value = langId
  if (props.metaTag) fillFormForLang(props.metaTag, langId)
}

function hasTranslation(langId: number) {
  return !!props.metaTag?.meta_tag_translations?.some(
    t => t.language_id === langId && t.title?.trim()
  )
}

function fillFormForLang(meta: MetaTagRaw, langId: number) {
  const t = meta.meta_tag_translations?.find(x => x.language_id === langId)

  form.value = {
    page_id: meta.page_id ?? null,
    language_id: langId,
    status_id: meta.status_id ?? null,
    title: t?.title ?? '',
    description: t?.description ?? '',
    og_title: t?.og_title ?? '',
    og_description: t?.og_description ?? '',
    og_type: t?.og_type ?? '',
    og_url: t?.og_url ?? '',
    og_image: null,
    image_url: meta.image_url ?? null,
  }
}

// ── WATCH ───────────────────────────────────────────
watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return

    errors.value = {}
    touched.value = {}
    activeLangId.value = null
    imagePreview.value = null

    await fetchMeta()

    const firstLangId = availableLanguages.value[0]?.id ?? null

    if (props.metaTag?.id) {
      activeLangId.value = firstLangId
      if (firstLangId) fillFormForLang(props.metaTag, firstLangId)
    } else {
      form.value = {
        ...emptyForm(),
        language_id: firstLangId,
        status_id: statusOptions.value[0]?.value ?? null,
      }
    }
  }
)

// ── VALIDATION ──────────────────────────────────────
function isValid(field: string) {
  return !errors.value[field]
}

function validate() {
  errors.value = {}

  touched.value = {
    title: true,
    description: true,
    og_title: true,
    og_description: true,
    og_type: true,
    og_url: true,
  }

  if (!form.value.title?.trim()) {
    errors.value.title = 'Title je povinný'
  }

  if (!form.value.description?.trim()) {
    errors.value.description = 'Description je povinný'
  }

  if (!form.value.language_id && !isEditing.value) {
    errors.value.language_id = 'Jazyk je povinný'
  }

  if (!form.value.status_id) {
    errors.value.status_id = 'Stav je povinný'
  }

  if (!form.value.page_id && !isEditing.value) {
    errors.value.page_id = 'Stránka je povinná'
  }

  return Object.keys(errors.value).length === 0
}

// ── SUBMIT ──────────────────────────────────────────
async function handleSubmit() {
  if (!validate()) return

  isSaving.value = true

  try {
    const payload = new FormData()

    payload.append('page_id', String(form.value.page_id ?? ''))
    payload.append('status_id', String(form.value.status_id ?? ''))

    const langId = isEditing.value ? activeLangId.value : form.value.language_id
    payload.append('language_id', String(langId ?? ''))

    payload.append('title', form.value.title ?? '')
    payload.append('description', form.value.description ?? '')
    payload.append('og_title', form.value.og_title ?? '')
    payload.append('og_description', form.value.og_description ?? '')
    payload.append('og_type', form.value.og_type ?? '')
    payload.append('og_url', form.value.og_url ?? '')

    if (form.value.og_image) {
      payload.append('image', form.value.og_image)
    }

    if (isEditing.value) {
      payload.append('_method', 'PUT')
      await api.post(`/meta-tags/${props.metaTag!.id}`, payload)
    } else {
      await api.post('/meta-tags', payload)
    }

    addToast({
      message: isEditing.value
        ? 'Meta tagy boli aktualizované'
        : 'Meta tagy boli vytvorené',
      type: 'success',
    })

    emit('saved')
    emit('update:modelValue', false)

  } catch (err: any) {
    addToast({
      message: err?.response?.data?.message || 'Nepodarilo sa uložiť meta tagy',
      type: 'error',
    })
  } finally {
    isSaving.value = false
  }
}
</script>