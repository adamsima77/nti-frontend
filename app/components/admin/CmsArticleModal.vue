<template>
  <UiModal
    :model-value="modelValue"
    :title="isEditing ? 'Upraviť článok' : 'Nový článok'"
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
          placeholder="Nadpis článku"
        />
      </UiFormField>

      <UiFormField
        label="Autor"
        required
        :error="errors.author"
      >
        <UiInput
          v-model="form.author"
          placeholder="Meno autora"
        />
      </UiFormField>

      <UiFormField
        label="Obsah"
        required
        :error="errors.content"
      >
        <UiTextarea
          v-model="form.content"
          placeholder="Obsah článku (HTML)"
          :rows="8"
        />
      </UiFormField>

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
const props = defineProps<{
  modelValue: boolean
  article?: { id?: number; title: string; author: string; content?: string; status: string } | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const isEditing = computed(() => !!props.article?.id)
const isSaving = ref(false)
const errors = ref<Record<string, string>>({})

const statusOptions = [
  { value: 'active', label: 'Publikovaný' },
  { value: 'draft', label: 'Koncept' },
]

const form = ref({ title: '', author: '', content: '', status: 'draft' })

watch(
  () => props.article,
  (article) => {
    if (article) {
      form.value = {
        title: article.title,
        author: article.author,
        content: article.content || '',
        status: article.status,
      }
    } else {
      form.value = { title: '', author: '', content: '', status: 'draft' }
    }
  },
  { immediate: true },
)

const { addToast } = useToast()
const api = useApi()

function validate(): boolean {
  errors.value = {}
  if (!form.value.title.trim()) errors.value.title = 'Nadpis je povinný'
  if (!form.value.author.trim()) errors.value.author = 'Autor je povinný'
  if (!form.value.content.trim()) errors.value.content = 'Obsah je povinný'
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  isSaving.value = true
  try {
    if (isEditing.value) {
      await api.put(`/v1/admin/cms/articles/${props.article!.id}`, form.value)
    } else {
      await api.post('/v1/admin/cms/articles', form.value)
    }
    addToast({ message: isEditing.value ? 'Článok bol aktualizovaný' : 'Článok bol vytvorený', type: 'success' })
    emit('saved')
    emit('update:modelValue', false)
  } catch {
    addToast({ message: 'Nepodarilo sa uložiť článok', type: 'error' })
  } finally {
    isSaving.value = false
  }
}
</script>
