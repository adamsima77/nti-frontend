<template>
  <UiModal
    :model-value="modelValue"
    :title="isEditing ? 'Upraviť meta tagy' : 'Nové meta tagy'"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="space-y-4" @submit.prevent="handleSubmit">

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

      <!-- IMAGE UPLOAD -->
      <UiFileUpload
        v-model="form.og_image"
        label="OG Image"
        description="Nahraj obrázok pre OpenGraph preview"
        accept=".jpg,.png,.webp"
        :max-size="5"
      />

    </form>

    <template #actions>
      <UiButton variant="ghost" @click="emit('update:modelValue', false)">
        Zrušiť
      </UiButton>

      <UiButton :disabled="isSaving" @click="handleSubmit">
        {{ isSaving ? 'Ukladanie...' : 'Uložiť' }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  metaTag?: any | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const api = useApi()
const { addToast } = useToast()

const isEditing = computed(() => !!props.metaTag?.id)
const isSaving = ref(false)

const errors = ref<Record<string, string>>({})
const touched = ref<Record<string, boolean>>({})

const form = ref({
  title: '',
  description: '',
  og_title: '',
  og_description: '',
  og_type: '',
  og_url: '',
  og_image: null as File | null,
})

watch(
  () => props.metaTag,
  (val) => {
    errors.value = {}
    touched.value = {}

    if (val) {
      form.value = {
        title: val.title ?? '',
        description: val.description ?? '',
        og_title: val.og_title ?? '',
        og_description: val.og_description ?? '',
        og_type: val.og_type ?? '',
        og_url: val.og_url ?? '',
        og_image: val.og_image ?? null,
      }
    } else {
      form.value = {
        title: '',
        description: '',
        og_title: '',
        og_description: '',
        og_type: '',
        og_url: '',
        og_image: null,
      }
    }
  },
  { immediate: true }
)

function isValid(field: string) {
  return !errors.value[field]
}

function validate() {
  errors.value = {}
  touched.value = {}

  if (!form.value.title.trim()) {
    errors.value.title = 'Title je povinný'
    touched.value.title = true
  }

  if (!form.value.description.trim()) {
    errors.value.description = 'Description je povinný'
    touched.value.description = true
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return

  isSaving.value = true
  try {
    const payload = new FormData()

    Object.entries(form.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        payload.append(key, value as any)
      }
    })

    if (isEditing.value) {
      await api.post(`/v1/cms/meta-tags/${props.metaTag.id}?_method=PUT`, payload)
    } else {
      await api.post('/v1/cms/meta-tags', payload)
    }

    addToast({
      message: isEditing.value
        ? 'Meta tagy boli aktualizované'
        : 'Meta tagy boli vytvorené',
      type: 'success',
    })

    emit('saved')
    emit('update:modelValue', false)
  } catch {
    addToast({ message: 'Nepodarilo sa uložiť meta tagy', type: 'error' })
  } finally {
    isSaving.value = false
  }
}
</script>