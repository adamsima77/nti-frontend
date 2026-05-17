<template>
  <UiModal
    :model-value="modelValue"
    :title="isEditing ? 'Upraviť člena NTI' : 'Nový člen NTI'"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- Loading -->
    <div v-if="metaLoading" class="flex justify-center py-10">
      <UiLoader />
    </div>

    <div v-else class="space-y-4">

      <!-- Name -->
      <UiFormField
        v-model="form.name"
        label="Meno a priezvisko"
        field="name"
        placeholder="Ján Novák"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.name"
      />

      <!-- Image -->
      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">
          Fotografia
        </label>

        <UiFileUpload
          v-model="form.imageFile"
          label="Fotografia (jpeg, jpg, png)"
          accept=".jpg,.jpeg,.png"
          :max-size="4"
        />

        <div class="mt-2">
          <p v-if="form.image_url" class="text-xs text-gray-400 mt-1">
            Aktuálne:
            <a
              :href="form.image_url"
              target="_blank"
              class="text-blue-600 hover:underline"
            >
              zobraziť
            </a>
          </p>
        </div>

        <p v-if="errors.image" class="text-xs text-red-500 mt-1">
          {{ errors.image }}
        </p>
      </div>

      <!-- Status -->
      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">
          Stav
        </label>

        <UiSelect v-model="form.status_id" :options="statusOptions" />

        <p v-if="errors.status_id" class="text-xs text-red-500 mt-1">
          {{ errors.status_id }}
        </p>
      </div>

      <!-- Job position -->
      <UiFormField
        v-model="form.job_position"
        label="Pozícia"
        field="job_position"
        placeholder="Frontend Developer"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.job_position"
      />
    </div>

    <!-- Actions -->
    <template #actions>
      <UiButton variant="ghost" @click="closeModal">
        Zrušiť
      </UiButton>

      <UiButton :disabled="isSaving || metaLoading" @click="handleSubmit">
        {{ isSaving ? 'Ukladanie...' : 'Uložiť' }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from 'vue'

interface SiteMember {
  id?: number
  name?: string
  image_url?: string
  status_id?: number
  job_position?: string
}

const props = defineProps<{
  modelValue: boolean
  member?: SiteMember | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const api = useApi()
const { addToast } = useToast()

// ── State ─────────────────────────────

const metaLoading = ref(false)
const isSaving = ref(false)

const errors = ref<Record<string, string>>({})
const touched = ref<Record<string, boolean>>({})

const statusOptions = ref<{ value: number; label: string }[]>([])

// ── Form ─────────────────────────────

const emptyForm = () => ({
  name: '',
  job_position: '',
  imageFile: null as File | null,
  image_url: '',
  status_id: null as number | null,
})

const form = ref(emptyForm())

// ── Editing ───────────────────────────

const isEditing = computed(() => !!props.member?.id)

// ── Image preview ─────────────────────

const imagePreview = ref<string | null>(null)
let objectUrl: string | null = null

watch(
  () => form.value.imageFile,
  (file) => {
    if (objectUrl) URL.revokeObjectURL(objectUrl)

    if (file instanceof File) {
      objectUrl = URL.createObjectURL(file)
      imagePreview.value = objectUrl
    } else {
      imagePreview.value = form.value.image_url || null
    }
  }
)

onUnmounted(() => {
  if (objectUrl) URL.revokeObjectURL(objectUrl)
})

// ── Meta ─────────────────────────────

async function fetchMeta() {
  metaLoading.value = true

  try {
    const statuses = await api.get('/cms-statuses') as any

    const list: any[] = Array.isArray(statuses)
      ? statuses
      : (statuses?.data ?? [])

    statusOptions.value = list.map((s) => ({
      value: s.id,
      label: s.name,
    }))
  } finally {
    metaLoading.value = false
  }
}

// ── Lifecycle ─────────────────────────

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) {
      resetForm()
      return
    }

    errors.value = {}
    touched.value = {}

    await fetchMeta()

    if (props.member?.id) {
      form.value = {
        name: props.member.name ?? '',
        job_position: props.member.job_position ?? '',
        imageFile: null,
        image_url: props.member.image_url ?? '',
        status_id: props.member.status_id ?? null,
      }

      imagePreview.value = props.member.image_url ?? null
    } else {
      form.value = emptyForm()
      imagePreview.value = null
    }
  }
)

// ── Helpers ───────────────────────────

function resetForm() {
  form.value = emptyForm()
  imagePreview.value = null
  errors.value = {}
  touched.value = {}

  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
}

function closeModal() {
  emit('update:modelValue', false)
}

// ── Validation ────────────────────────

function isValid(field: string) {
  return !errors.value[field]
}

function validate() {
  errors.value = {}
  touched.value = {}

  if (!form.value.name.trim()) {
    errors.value.name = 'Meno je povinné'
  }

  if (!form.value.job_position.trim()) {
    errors.value.job_position = 'Pozícia je povinná'
  }

  return Object.keys(errors.value).length === 0
}

// ── Submit ────────────────────────────

async function handleSubmit() {
  if (!validate()) return

  isSaving.value = true

  try {
    const payload = new FormData()

    payload.append('name', form.value.name)
    payload.append('job_position', form.value.job_position)

    if (form.value.status_id !== null) {
      payload.append('status_id', String(form.value.status_id))
    }

    if (form.value.imageFile instanceof File) {
      payload.append('image', form.value.imageFile)
    }

    if (isEditing.value) {
      await api.post(
        `/site-members/${props.member!.id}?_method=PUT`,
        payload
      )
    } else {
      await api.post('/site-members', payload)
    }

    addToast({
      message: isEditing.value
        ? 'Člen NTI bol aktualizovaný'
        : 'Člen NTI bol vytvorený',
      type: 'success',
    })

    emit('saved')
    closeModal()

  } catch (e: any) {
    const laravelErrors = e?.response?.data?.errors

    if (laravelErrors) {
      Object.entries(laravelErrors).forEach(([field, msgs]: any) => {
        errors.value[field] = Array.isArray(msgs) ? msgs[0] : msgs
        touched.value[field] = true
      })
    } else {
      addToast({
        message: 'Nepodarilo sa uložiť člena NTI',
        type: 'error',
      })
    }
  } finally {
    isSaving.value = false
  }
}
</script>