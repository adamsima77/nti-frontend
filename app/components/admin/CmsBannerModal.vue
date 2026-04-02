<template>
  <UiModal
    :model-value="modelValue"
    :title="isEditing ? 'Upraviť banner' : 'Nový banner'"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form
      class="space-y-4"
      @submit.prevent="handleSubmit"
    >
      <UiFormField
        label="Nadpis"
        required
        :error="errors.title"
      >
        <UiInput
          v-model="form.title"
          placeholder="Nadpis banneru"
        />
      </UiFormField>

      <UiFormField
        label="Popis"
        :error="errors.description"
      >
        <UiTextarea
          v-model="form.description"
          placeholder="Krátky popis"
          :rows="3"
        />
      </UiFormField>

      <div class="grid grid-cols-2 gap-4">
        <UiFormField
          label="Text tlačidla"
          required
          :error="errors.buttonText"
        >
          <UiInput
            v-model="form.buttonText"
            placeholder="Zistiť viac"
          />
        </UiFormField>

        <UiFormField
          label="Odkaz tlačidla"
          required
          :error="errors.buttonLink"
        >
          <UiInput
            v-model="form.buttonLink"
            placeholder="/programy"
          />
        </UiFormField>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <UiFormField label="Variant">
          <UiSelect
            v-model="form.variant"
            :options="variantOptions"
          />
        </UiFormField>

        <UiFormField label="Umiestnenie">
          <UiInput
            v-model="form.placement"
            placeholder="homepage-top"
          />
        </UiFormField>
      </div>

      <UiFormField label="Stav">
        <UiSelect
          v-model="form.status"
          :options="statusOptions"
        />
      </UiFormField>
    </form>

    <template #actions>
      <UiButton
        variant="ghost"
        @click="emit('update:modelValue', false)"
      >
        Zrušiť
      </UiButton>
      <UiButton
        :disabled="isSaving"
        @click="handleSubmit"
      >
        {{ isSaving ? 'Ukladanie...' : 'Uložiť' }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import type { CmsBanner } from '~/types/cms'

const props = defineProps<{
  modelValue: boolean
  banner?: CmsBanner | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const isEditing = computed(() => !!props.banner?.id)
const isSaving = ref(false)
const errors = ref<Record<string, string>>({})

const variantOptions = [
  { value: 'primary', label: 'Primary' },
  { value: 'outline', label: 'Outline' },
]

const statusOptions = [
  { value: 'active', label: 'Aktívny' },
  { value: 'draft', label: 'Koncept' },
]

const form = ref({
  title: '',
  description: '',
  buttonText: '',
  buttonLink: '',
  variant: 'primary',
  placement: '',
  status: 'draft',
})

watch(
  () => props.banner,
  (banner) => {
    if (banner) {
      form.value = {
        title: banner.title,
        description: banner.description || '',
        buttonText: banner.buttonText,
        buttonLink: banner.buttonLink,
        variant: banner.variant,
        placement: banner.placement || '',
        status: banner.status,
      }
    } else {
      form.value = {
        title: '',
        description: '',
        buttonText: '',
        buttonLink: '',
        variant: 'primary',
        placement: '',
        status: 'draft',
      }
    }
  },
  { immediate: true },
)

const { addToast } = useToast()
const api = useApi()

function validate(): boolean {
  errors.value = {}
  if (!form.value.title.trim()) errors.value.title = 'Nadpis je povinný'
  if (!form.value.buttonText.trim()) errors.value.buttonText = 'Text tlačidla je povinný'
  if (!form.value.buttonLink.trim()) errors.value.buttonLink = 'Odkaz je povinný'
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  isSaving.value = true
  try {
    if (isEditing.value) {
      await api.put(`/v1/admin/cms/banners/${props.banner!.id}`, form.value)
    } else {
      await api.post('/v1/admin/cms/banners', form.value)
    }
    addToast({ message: isEditing.value ? 'Banner bol aktualizovaný' : 'Banner bol vytvorený', type: 'success' })
    emit('saved')
    emit('update:modelValue', false)
  } catch {
    addToast({ message: 'Nepodarilo sa uložiť banner', type: 'error' })
  } finally {
    isSaving.value = false
  }
}
</script>
