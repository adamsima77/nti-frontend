<template>
  <UiModal
    :model-value="modelValue"
    :title="isEditing ? 'Upraviť partnera' : 'Nový partner'"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <FormField
        v-model="form.name"
        label="Názov"
        field="name"
        placeholder="Názov partnera"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.name"
      />

      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">Typ</label>
        <UiSelect v-model="form.type" :options="typeOptions" />
        <p v-if="errors.type && touched.type" class="text-xs text-red-500 mt-1">{{ errors.type }}</p>
      </div>

      <FormField
        v-model="form.website"
        label="Webstránka"
        field="website"
        placeholder="https://partner.sk"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.website"
      />

      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1.5">Logo</label>
        <UiFileUpload accept="image/*" @change="handleLogoChange" />
        <p v-if="form.logoUrl" class="text-xs text-gray-400 mt-1">Aktuálne: {{ form.logoUrl }}</p>
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
const props = defineProps<{
  modelValue: boolean
  partner?: { id?: number; name: string; type: string; website?: string; logoUrl?: string } | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const isEditing = computed(() => !!props.partner?.id)
const isSaving = ref(false)
const errors = ref<Record<string, string>>({})
const touched = ref<Record<string, boolean>>({})

const typeOptions = [
  { value: 'Hlavný partner',       label: 'Hlavný partner' },
  { value: 'Investor',             label: 'Investor' },
  { value: 'Akademický partner',   label: 'Akademický partner' },
  { value: 'Technologický partner', label: 'Technologický partner' },
]

const form = ref({ name: '', type: 'Hlavný partner', website: '', logoUrl: '' })

watch(
  () => props.partner,
  (partner) => {
    touched.value = {}
    errors.value = {}
    if (partner) {
      form.value = { name: partner.name, type: partner.type, website: partner.website || '', logoUrl: partner.logoUrl || '' }
    } else {
      form.value = { name: '', type: 'Hlavný partner', website: '', logoUrl: '' }
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
  if (!form.value.name.trim()) { errors.value.name = 'Názov je povinný'; touched.value.name = true }
  if (!form.value.type)        { errors.value.type = 'Typ je povinný';   touched.value.type = true }
  return Object.keys(errors.value).length === 0
}

function handleLogoChange(files: File[]) {
  if (files.length > 0) {
    form.value.logoUrl = URL.createObjectURL(files[0])
  }
}

async function handleSubmit() {
  if (!validate()) return
  isSaving.value = true
  try {
    if (isEditing.value) {
      await api.put(`/v1/cms/partners/${props.partner!.id}`, form.value)
    } else {
      await api.post('/v1/cms/partners', form.value)
    }
    addToast({ message: isEditing.value ? 'Partner bol aktualizovaný' : 'Partner bol vytvorený', type: 'success' })
    emit('saved')
    emit('update:modelValue', false)
  } catch {
    addToast({ message: 'Nepodarilo sa uložiť partnera', type: 'error' })
  } finally {
    isSaving.value = false
  }
}
</script>