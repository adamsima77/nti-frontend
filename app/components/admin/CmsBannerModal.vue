<template>
  <UiModal
    :model-value="modelValue"
    :title="isEditing ? 'Upraviť hero banner' : 'Nový hero banner'"
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
      <!-- Shared: page selector — always at the top -->
      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">Stránka</label>
        <UiSelect v-model="form.page_id" :options="pageOptions" />
        <p v-if="errors.page_id" class="text-xs text-red-500 mt-1">{{ errors.page_id }}</p>
      </div>

      <!-- Shared: status -->
      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">Stav</label>
        <UiSelect v-model="form.status_id" :options="statusOptions" />
        <p v-if="errors.status_id" class="text-xs text-red-500 mt-1">{{ errors.status_id }}</p>
      </div>

      <!-- Language selector (create only) -->
      <div v-if="!isEditing">
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">Jazyk</label>
        <UiSelect v-model="form.language_id" :options="languageOptions" />
        <p v-if="errors.language_id" class="text-xs text-red-500 mt-1">{{ errors.language_id }}</p>
      </div>

      <!-- Translated fields -->
      <UiFormField
        v-model="form.title"
        :label="isEditing && activeLangLabel ? `Nadpis (${activeLangLabel})` : 'Nadpis'"
        field="title"
        placeholder="Nadpis hero banneru"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.title"
      />

      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">
          Popis
          <span v-if="isEditing && activeLangLabel" class="ml-1 font-normal text-gray-400">({{ activeLangLabel }})</span>
        </label>
        <textarea
          v-model="form.description"
          rows="4"
          placeholder="Krátky popis banneru"
          class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        />
        <p v-if="errors.description" class="text-xs text-red-500 mt-1">{{ errors.description }}</p>
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

interface HeroBannerTranslation {
  language_id: number
  title: string
  description: string
  language?: Language
}

interface HeroBannerRaw {
  id?: number
  page_id?: number
  status_id?: number
  cms_status?: { id: number; name: string }
  page?: { id: number; name?: string; slug?: string }
  hero_banner_translations?: HeroBannerTranslation[]
}

const props = defineProps<{
  modelValue: boolean
  banner?: HeroBannerRaw | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const api = useApi()
const { addToast } = useToast()

// ── Meta ───────────────────────────────────────────────────

const availableLanguages = ref<Language[]>([])
const pageOptions        = ref<{ value: number; label: string }[]>([])
const statusOptions      = ref<{ value: number; label: string }[]>([])
const metaLoading        = ref(false)

const languageOptions = computed(() =>
  availableLanguages.value.map((l) => ({ value: l.id, label: l.name.toUpperCase() })),
)

async function fetchMeta() {
  metaLoading.value = true
  try {
    const [langs, pages, statuses] = await Promise.all([
      api.get('/languages') as Promise<any>,
      api.get('/pages') as Promise<any>,
      api.get('/cms-statuses') as Promise<any>,
    ])

    const langList: any[] = Array.isArray(langs) ? langs : (langs?.data ?? [])
    availableLanguages.value = langList.map((l: any) => ({ id: l.id, name: l.name }))

    const pageList: any[] = Array.isArray(pages) ? pages : (pages?.data ?? [])
    pageOptions.value = pageList.map((p: any) => ({
      value: p.id,
      label: p.name ?? p.slug ?? `#${p.id}`,
    }))

    const statusList: any[] = Array.isArray(statuses) ? statuses : (statuses?.data ?? [])
    statusOptions.value = statusList.map((s: any) => ({ value: s.id, label: s.name }))
  } catch {
    addToast({ message: 'Nepodarilo sa načítať dáta formulára', type: 'error' })
  } finally {
    metaLoading.value = false
  }
}

// ── State ──────────────────────────────────────────────────

const isEditing    = computed(() => !!props.banner?.id)
const isSaving     = ref(false)
const errors       = ref<Record<string, string>>({})
const touched      = ref<Record<string, boolean>>({})
const activeLangId = ref<number | null>(null)

const activeLangLabel = computed(
  () => availableLanguages.value.find((l) => l.id === activeLangId.value)?.name.toUpperCase() ?? '',
)

const emptyForm = () => ({
  language_id:  null as number | null,
  // shared
  page_id:      null as number | null,
  status_id:    null as number | null,
  // translated
  title:        '',
  description:  '',
})

const form = ref(emptyForm())

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

    if (props.banner?.id) {
      activeLangId.value = firstLangId
      if (firstLangId) fillFormForLang(props.banner, firstLangId)
    } else {
      form.value = { ...emptyForm(), language_id: firstLangId, status_id: defaultStatusId }
    }
  },
)

// handles parent swapping banner prop while modal stays open
watch(
  () => props.banner,
  (banner) => {
    if (!props.modelValue || metaLoading.value) return
    errors.value  = {}
    touched.value = {}

    if (banner?.id) {
      activeLangId.value = availableLanguages.value[0]?.id ?? null
      if (activeLangId.value) fillFormForLang(banner, activeLangId.value)
    } else {
      form.value = emptyForm()
    }
  },
)

function fillFormForLang(banner: HeroBannerRaw, langId: number) {
  const t = banner.hero_banner_translations?.find((x) => x.language_id === langId) ?? null
  form.value = {
    language_id:  langId,
    // shared
    page_id:      banner.page_id  ?? null,
    status_id:    banner.status_id ?? banner.cms_status?.id ?? null,
    // translated
    title:        t?.title       ?? '',
    description:  t?.description ?? '',
  }
}

function switchLang(langId: number) {
  activeLangId.value = langId
  if (props.banner) fillFormForLang(props.banner, langId)
}

function hasTranslation(langId: number): boolean {
  return !!props.banner?.hero_banner_translations?.some(
    (t) => t.language_id === langId && t.title?.trim(),
  )
}

// ── Validation ─────────────────────────────────────────────

function isValid(field: string) {
  return !errors.value[field]
}

function validate(): boolean {
  errors.value  = {}
  touched.value = {}

  if (!form.value.page_id)
    { errors.value.page_id = 'Stránka je povinná' }

  if (!isEditing.value && !form.value.language_id)
    { errors.value.language_id = 'Jazyk je povinný' }

  if (!form.value.title.trim())
    { errors.value.title = 'Nadpis je povinný'; touched.value.title = true }

  if (!form.value.description.trim())
    { errors.value.description = 'Popis je povinný'; touched.value.description = true }

  return Object.keys(errors.value).length === 0
}

// ── Submit ─────────────────────────────────────────────────

async function handleSubmit() {
  if (!validate()) return
  isSaving.value = true

  try {
    const payload = {
      page_id:     form.value.page_id,
      status_id:   form.value.status_id,
      language_id: isEditing.value ? (activeLangId.value ?? '') : (form.value.language_id ?? ''),
      title:       form.value.title,
      description: form.value.description,
    }

    if (isEditing.value) {
      await api.put(`/hero-banners/${props.banner!.id}`, payload)
    } else {
      await api.post('/hero-banners', payload)
    }

    addToast({
      message: isEditing.value ? 'Banner bol aktualizovaný' : 'Banner bol vytvorený',
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
      addToast({ message: 'Nepodarilo sa uložiť banner', type: 'error' })
    }
  } finally {
    isSaving.value = false
  }
}
</script>