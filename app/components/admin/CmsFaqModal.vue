<template>
  <UiModal
    :model-value="modelValue"
    :title="isEditing ? 'Upraviť FAQ' : 'Nová FAQ otázka'"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <FormField
        v-model="form.question"
        label="Otázka"
        field="question"
        placeholder="Ako sa prihlásiť do programu?"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.question"
      />

      <FormField
        v-model="form.answer"
        label="Odpoveď"
        field="answer"
        placeholder="Odpoveď na otázku"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.answer"
      />

      <FormField
        v-model="form.category"
        label="Kategória"
        field="category"
        placeholder="Prihlasovanie"
        :touched="touched"
        :is-valid="isValid"
        :error="errors.category"
      />
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
  faqItem?: { id?: number; question: string; answer?: string; category?: string } | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const isEditing = computed(() => !!props.faqItem?.id)
const isSaving = ref(false)
const errors = ref<Record<string, string>>({})
const touched = ref<Record<string, boolean>>({})

const form = ref({ question: '', answer: '', category: '' })

watch(
  () => props.faqItem,
  (faqItem) => {
    touched.value = {}
    errors.value = {}
    if (faqItem) {
      form.value = { question: faqItem.question, answer: faqItem.answer || '', category: faqItem.category || '' }
    } else {
      form.value = { question: '', answer: '', category: '' }
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
  if (!form.value.question.trim()) { errors.value.question = 'Otázka je povinná';  touched.value.question = true }
  if (!form.value.answer.trim())   { errors.value.answer   = 'Odpoveď je povinná'; touched.value.answer = true }
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  isSaving.value = true
  try {
    if (isEditing.value) {
      await api.put(`/v1/cms/faq/${props.faqItem!.id}`, form.value)
    } else {
      await api.post('/v1/cms/faq', form.value)
    }
    addToast({ message: isEditing.value ? 'FAQ bola aktualizovaná' : 'FAQ bola vytvorená', type: 'success' })
    emit('saved')
    emit('update:modelValue', false)
  } catch {
    addToast({ message: 'Nepodarilo sa uložiť FAQ', type: 'error' })
  } finally {
    isSaving.value = false
  }
}
</script>