<template>
  <UiModal
    :model-value="modelValue"
    :title="isEditing ? 'Upraviť banner' : 'Nový banner'"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <FormField
        v-model="form.title"
        label="Nadpis"
        field="title"
        placeholder="Nadpis banneru"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.title"
      />

      <FormField
        v-model="form.description"
        label="Popis"
        field="description"
        placeholder="Krátky popis"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.description"
      />

      <div class="grid grid-cols-2 gap-4">
        <FormField
          v-model="form.buttonText"
          label="Text tlačidla"
          field="buttonText"
          placeholder="Zistiť viac"
          :touched="touched"
          :is-valid="isValid"
          :error="errors.buttonText"
        />
        <FormField
          v-model="form.buttonLink"
          label="Odkaz tlačidla"
          field="buttonLink"
          placeholder="/programy"
          :touched="touched"
          :is-valid="isValid"
          :error="errors.buttonLink"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">Variant</label>
          <UiSelect v-model="form.variant" :options="variantOptions" />
        </div>
        <FormField
          v-model="form.placement"
          label="Umiestnenie"
          field="placement"
          placeholder="homepage-top"
          :touched="touched"
          :is-valid="isValid"
          :error="errors.placement"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">Stav</label>
        <UiSelect v-model="form.status" :options="statusOptions" />
      </div>
    </form>

    <template #actions>
      <UiButton variant="ghost" @click="emit('update:modelValue', false)">Zrušiť</UiButton>
      <UiButton :disabled="isSaving" @click="handleSubmit">
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
const touched = ref<Record<string, boolean>>({})

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
    touched.value = {}
    errors.value = {}
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
      form.value = { title: '', description: '', buttonText: '', buttonLink: '', variant: 'primary', placement: '', status: 'draft' }
    }
  },
  { immediate: true },
)

const { addToast } = useToast()
const api = useApi()

function isValid(field: string): boolean {
  return !errors.value[field]
}

function validate(): boolean {
  errors.value = {}
  touched.value = {}
  if (!form.value.title.trim())      { errors.value.title = 'Nadpis je povinný';           touched.value.title = true }
  if (!form.value.buttonText.trim()) { errors.value.buttonText = 'Text tlačidla je povinný'; touched.value.buttonText = true }
  if (!form.value.buttonLink.trim()) { errors.value.buttonLink = 'Odkaz je povinný';         touched.value.buttonLink = true }
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  isSaving.value = true
  try {
    if (isEditing.value) {
      await api.put(`/v1/cms/banners/${props.banner!.id}`, form.value)
    } else {
      await api.post('/v1/cms/banners', form.value)
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