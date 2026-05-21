<template>
  <UiModal
    :model-value="modelValue"
    :title="isEditing ? $t('cms_modals.reference.titleEdit') : $t('cms_modals.reference.titleCreate')"
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

      <!-- LANGUAGE SELECT (CREATE ONLY) -->
      <div v-if="!isEditing">
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">{{ $t('cms_modals.reference.fieldLanguage') }}</label>
        <UiSelect v-model="form.language_id" :options="languageOptions" />
        <p v-if="errors.language_id" class="text-xs text-red-500 mt-1">{{ errors.language_id }}</p>
      </div>

      <!-- STATUS -->
      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">{{ $t('cms_modals.reference.fieldStatus') }}</label>
        <UiSelect v-model="form.status_id" :options="statusOptions" />
        <p v-if="errors.status_id" class="text-xs text-red-500 mt-1">{{ errors.status_id }}</p>
      </div>

      <!-- NAME -->
      <UiFormField
        v-model="form.name"
        :label="$t('cms_modals.reference.fieldName')"
        field="name"
        :placeholder="$t('cms_modals.reference.namePlaceholder')"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.name"
      />

      <!-- JOB POSITION -->
      <UiFormField
        v-model="form.job_position"
        :label="$t('cms_modals.reference.fieldJobPosition')"
        field="job_position"
        :placeholder="$t('cms_modals.reference.jobPositionPlaceholder')"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.job_position"
      />

      <!-- DESCRIPTION -->
      <UiFormField
        v-model="form.description"
        :label="$t('cms_modals.reference.fieldDescription')"
        field="description"
        :placeholder="$t('cms_modals.reference.descriptionPlaceholder')"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.description"
      />

      <!-- IMAGE -->
      <UiFileUpload
        v-model="form.image"
        :label="$t('cms_modals.reference.fieldImage')"
        :description="$t('cms_modals.reference.imageDescription')"
        accept=".jpg,.jpeg,.png"
        :max-size="4"
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
          {{ $t('cms_modals.reference.imageCurrentLabel') }}
          <a :href="form.image_url" target="_blank" class="text-blue-600 hover:underline">{{ $t('cms_modals.reference.imageCurrentLink') }}</a>
        </p>
      </div>
    </div>

    <template #actions>
      <UiButton variant="ghost" @click="emit('update:modelValue', false)">
        {{ $t('cms_modals.reference.cancel') }}
      </UiButton>
      <UiButton :disabled="isSaving || metaLoading" @click="handleSubmit">
        {{ isSaving ? $t('cms_modals.reference.saving') : $t('cms_modals.reference.save') }}
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

interface PartnerReferenceTranslation {
  language_id: number
  description: string
}

interface PartnerReferenceRaw {
  id?: number
  status_id?: number
  name?: string
  job_position?: string
  image_url?: string
  partner_reference_translations?: PartnerReferenceTranslation[]
}

const props = defineProps<{
  modelValue: boolean
  reference?: PartnerReferenceRaw | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const api = useApi()
const { addToast } = useToast()
const { t } = useI18n()

// ── META ─────────────────────────────────────────────
const availableLanguages = ref<Language[]>([])
const statusOptions      = ref<Status[]>([])
const metaLoading        = ref(false)

const languageOptions = computed(() =>
  availableLanguages.value.map(l => ({ value: l.id, label: l.name.toUpperCase() })),
)

async function fetchMeta() {
  metaLoading.value = true
  try {
    const [langs, statuses] = await Promise.all([
      api.get('/languages'),
      api.get('/cms-statuses'),
    ])
    const langList: any[] = Array.isArray(langs) ? langs : (langs?.data ?? [])
    availableLanguages.value = langList.map(l => ({ id: l.id, name: l.name }))

    const statusList: any[] = Array.isArray(statuses) ? statuses : (statuses?.data ?? [])
    statusOptions.value = statusList.map(s => ({ value: s.id, label: s.name }))
  } finally {
    metaLoading.value = false
  }
}

// ── STATE ────────────────────────────────────────────
const isEditing    = computed(() => !!props.reference?.id)
const isSaving     = ref(false)
const imagePreview = ref<string | null>(null)

const errors       = ref<Record<string, string>>({})
const touched      = ref<Record<string, boolean>>({})
const activeLangId = ref<number | null>(null)

const emptyForm = () => ({
  language_id:  null as number | null,
  status_id:    null as number | null,
  name:         '',
  job_position: '',
  description:  '',
  image:        null as File | null,
  image_url:    null as string | null,
})

const form = ref(emptyForm())

// ── IMAGE PREVIEW ────────────────────────────────────
function handleImageChange(file: File | null) {
  form.value.image = file
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => { imagePreview.value = e.target?.result as string }
    reader.readAsDataURL(file)
  } else {
    imagePreview.value = null
  }
}

// ── LANG SWITCH ─────────────────────────────────────
function switchLang(langId: number) {
  activeLangId.value = langId
  if (props.reference) fillFormForLang(props.reference, langId)
}

function hasTranslation(langId: number) {
  return !!props.reference?.partner_reference_translations?.some(
    tr => tr.language_id === langId && tr.description?.trim()
  )
}

function fillFormForLang(reference: PartnerReferenceRaw, langId: number) {
  const tr = reference.partner_reference_translations?.find(x => x.language_id === langId)
  form.value = {
    language_id:  langId,
    status_id:    reference.status_id    ?? null,
    name:         reference.name         ?? '',
    job_position: reference.job_position ?? '',
    description:  tr?.description        ?? '',
    image:        null,
    image_url:    reference.image_url    ?? null,
  }
}

// ── WATCH ───────────────────────────────────────────
watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return

    errors.value       = {}
    touched.value      = {}
    activeLangId.value = null
    imagePreview.value = null

    await fetchMeta()

    const firstLangId = availableLanguages.value[0]?.id ?? null

    if (props.reference?.id) {
      activeLangId.value = firstLangId
      if (firstLangId) fillFormForLang(props.reference, firstLangId)
    } else {
      form.value = {
        ...emptyForm(),
        language_id: firstLangId,
        status_id:   statusOptions.value[0]?.value ?? null,
      }
    }
  }
)

// ── VALIDATION ──────────────────────────────────────
function isValid(field: string) {
  return !errors.value[field]
}

function validate() {
  errors.value  = {}
  touched.value = { name: true, job_position: true, description: true }

  if (!form.value.name?.trim())
    { errors.value.name = t('cms_modals.reference.validName') }

  if (!form.value.job_position?.trim())
    { errors.value.job_position = t('cms_modals.reference.validJobPosition') }

  if (!form.value.description?.trim())
    { errors.value.description = t('cms_modals.reference.validDescription') }

  if (!form.value.language_id && !isEditing.value)
    { errors.value.language_id = t('cms_modals.reference.validLanguage') }

  if (!form.value.status_id)
    { errors.value.status_id = t('cms_modals.reference.validStatus') }

  return Object.keys(errors.value).length === 0
}

// ── SUBMIT ──────────────────────────────────────────
async function handleSubmit() {
  if (!validate()) return
  isSaving.value = true

  try {
    const payload = new FormData()
    payload.append('status_id',    String(form.value.status_id ?? ''))
    payload.append('name',         form.value.name)
    payload.append('job_position', form.value.job_position)
    payload.append('description',  form.value.description)
    payload.append('language_id',  String(isEditing.value ? activeLangId.value : form.value.language_id ?? ''))

    if (form.value.image)
      payload.append('image', form.value.image)

    if (isEditing.value) {
      payload.append('_method', 'PUT')
      await api.post(`/partner-references/${props.reference!.id}`, payload)
    } else {
      await api.post('/partner-references', payload)
    }

    addToast({
      message: isEditing.value ? t('cms_modals.reference.toastUpdated') : t('cms_modals.reference.toastCreated'),
      type: 'success',
    })
    emit('saved')
    emit('update:modelValue', false)
  } catch (err: any) {
    addToast({
      message: err?.response?.data?.message || t('cms_modals.reference.toastSaveError'),
      type: 'error',
    })
  } finally {
    isSaving.value = false
  }
}
</script>