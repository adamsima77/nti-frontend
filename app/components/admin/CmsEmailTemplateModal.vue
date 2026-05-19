<template>
  <UiModal
    :model-value="modelValue"
    title="Upraviť email šablónu"
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
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">Slug</label>
        <p class="text-sm text-gray-700 font-mono bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
          {{ template?.slug ?? '—' }}
        </p>
      </div>

      <!-- SUBJECT -->
      <UiFormField
        v-model="form.subject"
        label="Predmet"
        field="subject"
        placeholder="Predmet emailu"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.subject"
      />

      <!-- BODY HTML -->
      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">Body HTML</label>

        <ClientOnly>
          <Editor v-model="form.body_html" />
        </ClientOnly>

        <p v-if="errors.body_html" class="text-xs text-red-500 mt-1">
          {{ errors.body_html }}
        </p>

        <!-- AVAILABLE VARIABLES HINT -->
        <div v-if="template?.available_variables?.length" class="mt-2 flex flex-wrap gap-1">
          <span class="text-xs text-slate-400 mr-1">Dostupné premenné:</span>
          <code
            v-for="variable in template.available_variables"
            :key="variable"
            class="text-xs bg-gray-100 text-navy px-1.5 py-0.5 rounded cursor-pointer hover:bg-gray-200"
            title="Kliknite pre skopírovanie"
            @click="copyVariable(variable)"
          >
            {{ bladeVar(variable) }}
          </code>
        </div>
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

// ── META ─────────────────────────────────────────────
const availableLanguages = ref<Language[]>([])
const metaLoading = ref(false)

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
const isSaving = ref(false)
const errors = ref<Record<string, string>>({})
const touched = ref<Record<string, boolean>>({})
const activeLangId = ref<number | null>(null)

const emptyForm = (): FormData => ({ subject: '', body_html: '' })
const form = ref<FormData>(emptyForm())

// In-memory store for all language edits while the modal is open
const localTranslations = ref<Record<number, FormData>>({})

// ── VARIABLE COPY ────────────────────────────────────
function copyVariable(variable: string) {
  navigator.clipboard.writeText(`{{ $${variable} }}`)
  addToast({ message: `Skopírované: {{ $${variable} }}`, type: 'success' })
}

// ── LANG SWITCH ─────────────────────────────────────
function saveCurrentLangToLocal() {
  if (activeLangId.value === null) return
  localTranslations.value[activeLangId.value] = { ...form.value }
}

function switchLang(langId: number) {
  saveCurrentLangToLocal()
  activeLangId.value = langId
  loadLang(langId)
}

// Load from local edits first, then from server translations.
// Server always provides all languages (controller normalizes EN fallback),
// so no base-model fallback needed here.
function loadLang(langId: number) {
  if (localTranslations.value[langId]) {
    form.value = { ...localTranslations.value[langId] }
    return
  }

  const t = props.template?.translations?.find(x => x.language_id === langId)
  form.value = {
    subject:   t?.subject   ?? '',
    body_html: t?.body_html ?? '',
  }
}

function hasTranslation(langId: number): boolean {
  if (localTranslations.value[langId]?.body_html?.trim()) return true
  return !!props.template?.translations?.some(
    t => t.language_id === langId && t.body_html?.trim()
  )
}

// ── WATCH ───────────────────────────────────────────
watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return

    errors.value = {}
    touched.value = {}
    activeLangId.value = null
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

function validate() {
  errors.value = {}
  touched.value = { subject: true, body_html: true }

  if (!form.value.subject?.trim())   errors.value.subject   = 'Predmet je povinný'
  if (!form.value.body_html?.trim()) errors.value.body_html = 'Body HTML je povinné'

  return Object.keys(errors.value).length === 0
}

// ── SUBMIT ──────────────────────────────────────────
async function handleSubmit() {
  if (!validate()) return

  saveCurrentLangToLocal()

  const langsToSave = Object.entries(localTranslations.value) as [string, FormData][]

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

    addToast({ message: 'Email šablóna bola aktualizovaná', type: 'success' })
    emit('saved')
    emit('update:modelValue', false)

  } catch (err: any) {
    addToast({
      message: err?.response?.data?.message || 'Nepodarilo sa uložiť šablónu',
      type: 'error',
    })
  } finally {
    isSaving.value = false
  }
}
</script>