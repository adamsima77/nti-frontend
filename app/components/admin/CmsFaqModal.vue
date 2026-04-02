<template>
  <UiModal
    :model-value="modelValue"
    :title="isEditing ? 'Upraviť FAQ' : 'Nová FAQ otázka'"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form
      class="space-y-4"
      @submit.prevent="handleSubmit"
    >
      <UiFormField
        label="Otázka"
        required
        :error="errors.question"
      >
        <UiInput
          v-model="form.question"
          placeholder="Ako sa prihlásiť do programu?"
        />
      </UiFormField>

      <UiFormField
        label="Odpoveď"
        required
        :error="errors.answer"
      >
        <UiTextarea
          v-model="form.answer"
          placeholder="Odpoveď na otázku (HTML)"
          :rows="5"
        />
      </UiFormField>

      <UiFormField
        label="Kategória"
        :error="errors.category"
      >
        <UiInput
          v-model="form.category"
          placeholder="Prihlasovanie"
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
  faqItem?: { id?: number; question: string; answer?: string; category?: string } | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const isEditing = computed(() => !!props.faqItem?.id)
const isSaving = ref(false)
const errors = ref<Record<string, string>>({})

const form = ref({ question: '', answer: '', category: '' })

watch(
  () => props.faqItem,
  (faqItem) => {
    if (faqItem) {
      form.value = {
        question: faqItem.question,
        answer: faqItem.answer || '',
        category: faqItem.category || '',
      }
    } else {
      form.value = { question: '', answer: '', category: '' }
    }
  },
  { immediate: true },
)

const { addToast } = useToast()
const api = useApi()

function validate(): boolean {
  errors.value = {}
  if (!form.value.question.trim()) errors.value.question = 'Otázka je povinná'
  if (!form.value.answer.trim()) errors.value.answer = 'Odpoveď je povinná'
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  isSaving.value = true
  try {
    if (isEditing.value) {
      await api.put(`/v1/admin/cms/faq/${props.faqItem!.id}`, form.value)
    } else {
      await api.post('/v1/admin/cms/faq', form.value)
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
