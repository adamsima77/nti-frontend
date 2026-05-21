<template>
  <UiModal
    :model-value="modelValue"
    :title="$t('cms_modals.email_template.title')"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- LANGUAGE TABS -->
    <div
      v-if="availableLanguages.length"
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

      <!-- SLUG (readonly) -->
      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">{{ $t('cms_modals.email_template.fieldSlug') }}</label>
        <p class="text-sm text-gray-700 font-mono bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
          {{ template?.slug ?? '—' }}
        </p>
      </div>

      <!-- SUBJECT -->
      <UiFormField
        v-model="form.subject"
        :label="$t('cms_modals.email_template.fieldSubject')"
        field="subject"
        :placeholder="$t('cms_modals.email_template.subjectPlaceholder')"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.subject"
      />

      <!-- BODY HTML -->
      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">{{ $t('cms_modals.email_template.fieldBodyHtml') }}</label>
        <ClientOnly>
          <Editor v-model="form.body_html" />
        </ClientOnly>
        <p v-if="errors.body_html" class="text-xs text-red-500 mt-1">{{ errors.body_html }}</p>

        <!-- AVAILABLE VARIABLES HINT -->
        <div v-if="template?.available_variables?.length" class="mt-2 flex flex-wrap gap-1">
          <span class="text-xs text-slate-400 mr-1">{{ $t('cms_modals.email_template.availableVariables') }}</span>
          <code
            v-for="variable in template.available_variables"
            :key="variable"
            class="text-xs bg-gray-100 text-navy px-1.5 py-0.5 rounded cursor-pointer hover:bg-gray-200"
            :title="$t('cms_modals.email_template.variableCopied')"
            @click="copyVariable(variable)"
          >
            {{ bladeVar(variable) }}
          </code>
        </div>
      </div>
    </div>

    <template #actions>
      <UiButton variant="ghost" @click="emit('update:modelValue', false)">
        {{ $t('cms_modals.email_template.cancel') }}
      </UiButton>
      <UiButton :disabled="isSaving || metaLoading" @click="handleSubmit">
        {{ isSaving ? $t('cms_modals.email_template.saving') : $t('cms_modals.email_template.save') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
function bladeVar(variable: string) {
  return '{{ $' + variable + ' }}'
}

interface Language {
  id: number
  name: string
}

interface EmailTemplateTranslation {
  language_id: number
  subject: string
  body_html: string
}

interface EmailTemplateRaw {
  id?: number
  slug?: string
  available_variables?: string[]
  translations?: EmailTemplateTranslation[]
}

interface FormData {
  subject: string
  body_html: string
}

const props = defineProps<{
  modelValue: boolean
  template?: EmailTemplateRaw | null
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
const metaLoading        = ref(false)

async function fetchMeta() {
  metaLoading.value = true
  try {
    const langs = await api.get('/languages')
    const langList: any[] = Array.isArray(langs) ? langs : (langs?.data ?? [])
    availableLanguages.value = langList.map(l => ({ id: l.id, name: l.name }))
  } finally {
    metaLoading.value = false
  }
}

// ── STATE ────────────────────────────────────────────
const isSaving     = ref(false)
const errors       = ref<Record<string, string>>({})
const touched      = ref<Record<string, boolean>>({})
const activeLangId = ref<number | null>(null)

const emptyForm = (): FormData => ({ subject: '', body_html: '' })
const form = ref<FormData>(emptyForm())

const localTranslations = ref<Record<number, FormData>>({})

// ── VARIABLE COPY ────────────────────────────────────
function copyVariable(variable: string) {
  navigator.clipboard.writeText(`{{ $${variable} }}`)
  addToast({ message: `${t('cms_modals.email_template.variableCopied')} {{ $${variable} }}`, type: 'success' })
}

// ── LANG SWITCH ─────────────────────────────────────
function saveCurrentLangToLocal() {
  if (activeLangId.value === null) return
  localTranslations.value[activeLangId.value] = { ...form.value }
}

function switchLang(langId: number) {
  saveCurrentLangToLocal()
  activeLangId.value = langId
  errors.value  = {}
  touched.value = {}
  loadLang(langId)
}

function loadLang(langId: number) {
  if (localTranslations.value[langId]) {
    form.value = { ...localTranslations.value[langId] }
    return
  }
  const tr = props.template?.translations?.find(x => x.language_id === langId)
  form.value = {
    subject:   tr?.subject   ?? '',
    body_html: tr?.body_html ?? '',
  }
}

function hasTranslation(langId: number): boolean {
  if (localTranslations.value[langId]?.body_html?.trim()) return true
  return !!props.template?.translations?.some(
    tr => tr.language_id === langId && tr.body_html?.trim()
  )
}

// ── WATCH ───────────────────────────────────────────
watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return

    errors.value            = {}
    touched.value           = {}
    activeLangId.value      = null
    localTranslations.value = {}

    await fetchMeta()

    const firstLangId = availableLanguages.value[0]?.id ?? null
    activeLangId.value = firstLangId

    if (firstLangId !== null) {
      loadLang(firstLangId)
    } else {
      form.value = emptyForm()
    }
  }
)

// ── VALIDATION ──────────────────────────────────────
function isValid(field: string) {
  return !errors.value[field]
}

// Validates only the currently active language's form.
function validate() {
  errors.value  = {}
  touched.value = { subject: true, body_html: true }

  if (!form.value.subject?.trim())   errors.value.subject   = t('cms_modals.email_template.validSubject')
  if (!form.value.body_html?.trim()) errors.value.body_html = t('cms_modals.email_template.validBodyHtml')

  return Object.keys(errors.value).length === 0
}

// ── SUBMIT ──────────────────────────────────────────
async function handleSubmit() {
  // Validate the active language before saving anything
  if (!validate()) return

  // Flush the active language into localTranslations
  saveCurrentLangToLocal()

  // Only send translations that have both subject and body_html filled in.
  // This prevents 422s for languages the admin visited but left empty.
  const langsToSave = (Object.entries(localTranslations.value) as [string, FormData][])
    .filter(([, data]) => data.subject?.trim() && data.body_html?.trim())

  if (!langsToSave.length) {
    emit('update:modelValue', false)
    return
  }

  isSaving.value = true

  try {
    await Promise.all(
      langsToSave.map(([langId, data]) =>
        api.put(`/email-templates/${props.template!.id}`, {
          language_id: Number(langId),
          subject:     data.subject,
          body_html:   data.body_html,
        })
      )
    )

    addToast({ message: t('cms_modals.email_template.toastUpdated'), type: 'success' })
    emit('saved')
    emit('update:modelValue', false)
  } catch (err: any) {
    addToast({
      message: err?.response?.data?.message || t('cms_modals.email_template.toastSaveError'),
      type: 'error',
    })
  } finally {
    isSaving.value = false
  }
}
</script>