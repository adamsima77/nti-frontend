<template>
  <UiModal
    :model-value="modelValue"
    :title="isEditing ? $t('cms_modals.partners.titleEdit') : $t('cms_modals.partners.titleCreate')"
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
      <!-- Language selector (create only) -->
      <div v-if="!isEditing">
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">{{ $t('cms_modals.partners.fieldLanguage') }}</label>
        <UiSelect v-model="form.language_id" :options="languageOptions" />
        <p v-if="errors.language_id" class="text-xs text-red-500 mt-1">{{ errors.language_id }}</p>
      </div>

      <!-- Shared fields — same across all languages -->
      <UiFormField
        v-model="form.name"
        :label="$t('cms_modals.partners.fieldName')"
        field="name"
        :placeholder="$t('cms_modals.partners.namePlaceholder')"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.name"
      />

      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">{{ $t('cms_modals.partners.fieldLogo') }}</label>
        <UiFileUpload
          v-model="form.imageFile"
          :label="$t('cms_modals.partners.logoLabel')"
          accept=".jpg,.jpeg,.png"
          :max-size="4"
        />
        <div class="mt-2">
          <p v-if="form.image_url" class="text-xs text-gray-400 mt-1">
            {{ $t('cms_modals.partners.imageCurrentLabel') }}
            <a :href="form.image_url" target="_blank" class="text-blue-600 hover:underline">{{ $t('cms_modals.partners.imageCurrentLink') }}</a>
          </p>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">{{ $t('cms_modals.partners.fieldStatus') }}</label>
        <UiSelect v-model="form.status_id" :options="statusOptions" />
        <p v-if="errors.status_id" class="text-xs text-red-500 mt-1">{{ errors.status_id }}</p>
      </div>

      <!-- Translated field — changes per language tab -->
      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">
          {{ $t('cms_modals.partners.fieldDescription') }}
          <span v-if="isEditing && activeLangLabel" class="ml-1 font-normal text-gray-400">({{ activeLangLabel }})</span>
        </label>
        <textarea
          v-model="form.description"
          rows="4"
          :placeholder="$t('cms_modals.partners.descriptionPlaceholder')"
          class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        />
        <p v-if="errors.description" class="text-xs text-red-500 mt-1">{{ errors.description }}</p>
      </div>
    </div>

    <template #actions>
      <UiButton variant="ghost" @click="emit('update:modelValue', false)">{{ $t('cms_modals.partners.cancel') }}</UiButton>
      <UiButton :disabled="isSaving || metaLoading" @click="handleSubmit">
        {{ isSaving ? $t('cms_modals.partners.saving') : $t('cms_modals.partners.save') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
interface Language {
  id: number
  name: string
}

interface PartnerTranslation {
  language_id: number
  description: string
}

interface PartnerRaw {
  id?: number
  name?: string
  image_url?: string
  status_id?: number
  cms_status?: { id: number; name: string }
  partner_translations?: PartnerTranslation[]
}

const props = defineProps<{
  modelValue: boolean
  partner?: PartnerRaw | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const api = useApi()
const { addToast } = useToast()
const { t } = useI18n()

// ── Meta ───────────────────────────────────────────────────

const availableLanguages = ref<Language[]>([])
const statusOptions      = ref<{ value: number; label: string }[]>([])
const metaLoading        = ref(false)

const languageOptions = computed(() =>
  availableLanguages.value.map((l) => ({ value: l.id, label: l.name.toUpperCase() })),
)

async function fetchMeta() {
  metaLoading.value = true
  try {
    const [langs, statuses] = await Promise.all([
      api.get('/languages') as Promise<any>,
      api.get('/cms-statuses') as Promise<any>,
    ])

    const langList: any[] = Array.isArray(langs) ? langs : (langs?.data ?? [])
    availableLanguages.value = langList.map((l: any) => ({ id: l.id, name: l.name }))

    const statusList: any[] = Array.isArray(statuses) ? statuses : (statuses?.data ?? [])
    statusOptions.value = statusList.map((s: any) => ({ value: s.id, label: s.name }))
  } catch {
    addToast({ message: t('cms_modals.partners.toastLoadError'), type: 'error' })
  } finally {
    metaLoading.value = false
  }
}

// ── State ──────────────────────────────────────────────────

const isEditing    = computed(() => !!props.partner?.id)
const isSaving     = ref(false)
const errors       = ref<Record<string, string>>({})
const touched      = ref<Record<string, boolean>>({})
const activeLangId = ref<number | null>(null)

const activeLangLabel = computed(
  () => availableLanguages.value.find((l) => l.id === activeLangId.value)?.name.toUpperCase() ?? '',
)

const emptyForm = () => ({
  language_id: null as number | null,
  name:        '',
  imageFile:   null as File | null,
  image_url:   '',
  status_id:   null as number | null,
  description: '',
})

const form = ref(emptyForm())

// ── Image handling ─────────────────────────────────────────

const imagePreview    = ref<string | null>(null)
let currentObjectUrl: string | null = null

watch(() => form.value.imageFile, (file) => {
  if (currentObjectUrl) {
    try { URL.revokeObjectURL(currentObjectUrl) } catch {}
    currentObjectUrl = null
  }
  if (file instanceof File) {
    currentObjectUrl   = URL.createObjectURL(file)
    imagePreview.value = currentObjectUrl
  } else {
    imagePreview.value = form.value.image_url || null
  }
})

onUnmounted(() => {
  if (currentObjectUrl) {
    try { URL.revokeObjectURL(currentObjectUrl) } catch {}
  }
})

// ── Watchers ───────────────────────────────────────────────

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) {
      if (currentObjectUrl) {
        try { URL.revokeObjectURL(currentObjectUrl) } catch {}
        currentObjectUrl = null
      }
      imagePreview.value = null
      return
    }

    errors.value       = {}
    touched.value      = {}
    activeLangId.value = null

    await fetchMeta()

    const firstLangId = availableLanguages.value[0]?.id ?? null
    const defaultStatusId = statusOptions.value.find((s) =>
      s.label.toLowerCase().includes('koncept'),
    )?.value ?? statusOptions.value[0]?.value ?? null

    if (props.partner?.id) {
      activeLangId.value = firstLangId
      if (firstLangId) fillFormForLang(props.partner, firstLangId)
    } else {
      form.value = { ...emptyForm(), language_id: firstLangId, status_id: defaultStatusId }
      imagePreview.value = null
    }
  },
)

watch(
  () => props.partner,
  (partner) => {
    if (!props.modelValue || metaLoading.value) return
    errors.value  = {}
    touched.value = {}

    if (partner?.id) {
      activeLangId.value = availableLanguages.value[0]?.id ?? null
      if (activeLangId.value) fillFormForLang(partner, activeLangId.value)
    } else {
      form.value = emptyForm()
      imagePreview.value = null
    }
  },
)

function fillFormForLang(partner: PartnerRaw, langId: number) {
  const tr = partner.partner_translations?.find((x) => x.language_id === langId) ?? null

  if (currentObjectUrl) {
    try { URL.revokeObjectURL(currentObjectUrl) } catch {}
    currentObjectUrl = null
  }

  form.value = {
    language_id: langId,
    name:        partner.name      ?? '',
    imageFile:   null,
    image_url:   partner.image_url ?? '',
    status_id:   partner.status_id ?? partner.cms_status?.id ?? null,
    description: tr?.description   ?? '',
  }

  imagePreview.value = partner.image_url || null
}

function switchLang(langId: number) {
  activeLangId.value = langId
  if (props.partner) fillFormForLang(props.partner, langId)
}

function hasTranslation(langId: number): boolean {
  return !!props.partner?.partner_translations?.some(
    (tr) => tr.language_id === langId && tr.description?.trim(),
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

  if (!form.value.name.trim())
    { errors.value.name = t('cms_modals.partners.validName'); touched.value.name = true }

  if (!isEditing.value && !form.value.language_id)
    { errors.value.language_id = t('cms_modals.partners.validLanguage') }

  if (isContentEmpty(form.value.description))
    { errors.value.description = t('cms_modals.partners.validDescription') }

  return Object.keys(errors.value).length === 0
}

// ── Submit ─────────────────────────────────────────────────

async function handleSubmit() {
  if (!validate()) return
  isSaving.value = true

  try {
    const payload = new FormData()
    payload.append('name', form.value.name)
    payload.append('description', form.value.description)
    payload.append('language_id', String(isEditing.value ? (activeLangId.value ?? '') : (form.value.language_id ?? '')))
    if (form.value.status_id !== null) payload.append('status_id', String(form.value.status_id))

    if (form.value.imageFile instanceof File) {
      payload.append('image', form.value.imageFile)
    }

    if (isEditing.value) {
      await api.post(`/partners/${props.partner!.id}?_method=PUT`, payload)
    } else {
      await api.post('/partners', payload)
    }

    addToast({
      message: isEditing.value ? t('cms_modals.partners.toastUpdated') : t('cms_modals.partners.toastCreated'),
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
      addToast({ message: t('cms_modals.partners.toastSaveError'), type: 'error' })
    }
  } finally {
    isSaving.value = false
  }
}
</script>