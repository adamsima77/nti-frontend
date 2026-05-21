<template>
  <UiModal
    :model-value="modelValue"
    :title="isEditing ? $t('cms_modals.faq.titleEdit') : $t('cms_modals.faq.titleCreate')"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- Language tabs (edit only) -->
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
      <!-- Page -->
      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">
          {{ $t('cms_modals.faq.fieldPage') }}
        </label>
        <UiSelect v-model="form.page_id" :options="pageOptions" />
        <p v-if="errors.page_id" class="text-xs text-red-500 mt-1">{{ errors.page_id }}</p>
      </div>

      <!-- Status -->
      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">
          {{ $t('cms_modals.faq.fieldStatus') }}
        </label>
        <UiSelect v-model="form.status_id" :options="statusOptions" />
        <p v-if="errors.status_id" class="text-xs text-red-500 mt-1">{{ errors.status_id }}</p>
      </div>

      <!-- Language selector (create only) -->
      <div v-if="!isEditing">
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">
          {{ $t('cms_modals.faq.fieldLanguage') }}
        </label>
        <UiSelect v-model="form.language_id" :options="languageOptions" />
        <p v-if="errors.language_id" class="text-xs text-red-500 mt-1">{{ errors.language_id }}</p>
      </div>

      <!-- Question -->
      <UiFormField
        v-model="form.question"
        :label="isEditing && activeLangLabel
          ? `${$t('cms_modals.faq.fieldQuestion')} (${activeLangLabel})`
          : $t('cms_modals.faq.fieldQuestion')"
        field="question"
        :placeholder="$t('cms_modals.faq.questionPlaceholder')"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.question"
      />

      <!-- Answer -->
      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">
          {{ $t('cms_modals.faq.fieldAnswer') }}
          <span v-if="isEditing && activeLangLabel" class="ml-1 font-normal text-gray-400">
            ({{ activeLangLabel }})
          </span>
        </label>
        <textarea
          v-model="form.answer"
          rows="5"
          :placeholder="$t('cms_modals.faq.answerPlaceholder')"
          class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        />
        <p v-if="errors.answer" class="text-xs text-red-500 mt-1">{{ errors.answer }}</p>
      </div>
    </div>

    <template #actions>
      <UiButton variant="ghost" @click="emit('update:modelValue', false)">
        {{ $t('cms_modals.faq.cancel') }}
      </UiButton>
      <UiButton :disabled="isSaving || metaLoading" @click="handleSubmit">
        {{ isSaving ? $t('cms_modals.faq.saving') : $t('cms_modals.faq.save') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
interface Language {
  id: number
  name: string
}

interface FaqTranslation {
  language_id: number
  question: string
  answer: string
  language?: Language
}

interface FaqRaw {
  id?: number
  page_id?: number
  status_id?: number
  cms_status?: { id: number; name: string }
  page?: { id: number; name?: string; slug?: string }
  frequently_asked_question_translations?: FaqTranslation[]
}

const props = defineProps<{
  modelValue: boolean
  faqItem?: FaqRaw | null
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
    addToast({ message: t('cms_modals.faq.toastLoadError'), type: 'error' })
  } finally {
    metaLoading.value = false
  }
}

// ── State ──────────────────────────────────────────────────

const isEditing    = computed(() => !!props.faqItem?.id)
const isSaving     = ref(false)
const errors       = ref<Record<string, string>>({})
const touched      = ref<Record<string, boolean>>({})
const activeLangId = ref<number | null>(null)

const activeLangLabel = computed(
  () => availableLanguages.value.find((l) => l.id === activeLangId.value)?.name.toUpperCase() ?? '',
)

const emptyForm = () => ({
  language_id: null as number | null,
  page_id:     null as number | null,
  status_id:   null as number | null,
  question:    '',
  answer:      '',
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

    if (props.faqItem?.id) {
      activeLangId.value = firstLangId
      if (firstLangId) fillFormForLang(props.faqItem, firstLangId)
    } else {
      form.value = { ...emptyForm(), language_id: firstLangId, status_id: defaultStatusId }
    }
  },
)

watch(
  () => props.faqItem,
  (faqItem) => {
    if (!props.modelValue || metaLoading.value) return
    errors.value  = {}
    touched.value = {}

    if (faqItem?.id) {
      activeLangId.value = availableLanguages.value[0]?.id ?? null
      if (activeLangId.value) fillFormForLang(faqItem, activeLangId.value)
    } else {
      form.value = emptyForm()
    }
  },
)

function fillFormForLang(faqItem: FaqRaw, langId: number) {
  const tr = faqItem.frequently_asked_question_translations?.find(
    (x) => x.language_id === langId,
  ) ?? null

  form.value = {
    language_id: langId,
    page_id:     faqItem.page_id ?? null,
    status_id:   faqItem.status_id ?? faqItem.cms_status?.id ?? null,
    question:    tr?.question ?? '',
    answer:      tr?.answer   ?? '',
  }
}

function switchLang(langId: number) {
  activeLangId.value = langId
  if (props.faqItem) fillFormForLang(props.faqItem, langId)
}

function hasTranslation(langId: number): boolean {
  return !!props.faqItem?.frequently_asked_question_translations?.some(
    (tr) => tr.language_id === langId && tr.question?.trim(),
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
    { errors.value.page_id = t('cms_modals.faq.validPage') }

  if (!form.value.status_id)
    { errors.value.status_id = t('cms_modals.faq.validStatus') }

  if (!isEditing.value && !form.value.language_id)
    { errors.value.language_id = t('cms_modals.faq.validLanguage') }

  if (!form.value.question.trim())
    { errors.value.question = t('cms_modals.faq.validQuestion'); touched.value.question = true }

  if (!form.value.answer.trim())
    { errors.value.answer = t('cms_modals.faq.validAnswer'); touched.value.answer = true }

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
      question:    form.value.question,
      answer:      form.value.answer,
    }

    if (isEditing.value) {
      await api.put(`/faq/${props.faqItem!.id}`, payload)
    } else {
      await api.post('/faq', payload)
    }

    addToast({
      message: isEditing.value ? t('cms_modals.faq.toastUpdated') : t('cms_modals.faq.toastCreated'),
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
      addToast({ message: t('cms_modals.faq.toastSaveError'), type: 'error' })
    }
  } finally {
    isSaving.value = false
  }
}
</script>