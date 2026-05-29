<template>
  <UiModal
    :model-value="modelValue"
    :title="t('gdpr_anonymize_modal.title')"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-4">
      <div class="flex items-start gap-3 p-4 bg-danger-50 rounded-lg">
        <AlertTriangle class="w-6 h-6 text-danger-500 shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-medium text-gray-800">
            {{ t('gdpr_anonymize_modal.irreversible_action') }}
          </p>
          <p class="text-sm text-gray-600 mt-1">
            {{ t('gdpr_anonymize_modal.confirmation_text_prefix') }}
            <strong>{{ user?.name }} {{ user?.surname }}</strong> ({{ user?.email }})?
            {{ t('gdpr_anonymize_modal.confirmation_text_suffix') }}
          </p>
        </div>
      </div>

      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-xs font-medium text-gray-500 mb-2">
          {{ t('gdpr_anonymize_modal.what_happens_title') }}
        </p>
        <ul class="text-xs text-gray-600 space-y-1">
          <li class="flex items-center gap-2">
            <X class="w-3 h-3 text-danger-500" />
            {{ t('gdpr_anonymize_modal.effect_anonymized_values') }}
          </li>
          <li class="flex items-center gap-2">
            <X class="w-3 h-3 text-danger-500" />
            {{ t('gdpr_anonymize_modal.effect_profile_deleted') }}
          </li>
          <li class="flex items-center gap-2">
            <X class="w-3 h-3 text-danger-500" />
            {{ t('gdpr_anonymize_modal.effect_account_deactivated') }}
          </li>
        </ul>
      </div>
    </div>

    <template #actions>
      <UiButton
        variant="ghost"
        @click="emit('update:modelValue', false)"
      >
        {{ t('gdpr_anonymize_modal.cancel') }}
      </UiButton>
      <UiButton
        variant="danger"
        :disabled="isProcessing"
        @click="handleAnonymize"
      >
        {{ isProcessing ? t('gdpr_anonymize_modal.processing') : t('gdpr_anonymize_modal.confirm') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { AlertTriangle, X } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  user: any | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  anonymized: []
}>()

const api = useApi()
const { addToast } = useToast()
const isProcessing = ref(false)

async function handleAnonymize() {
  if (!props.user) return
  isProcessing.value = true
  try {
    // Route: POST /users/anonymize-user/{id}
    await api.post(`/users/anonymize-user/${props.user.id}`)
    
    addToast({
      message: t('gdpr_anonymize_modal.success_message', { 
        name: props.user.name, 
        surname: props.user.surname 
      }),
      type: 'success',
    })
    
    emit('anonymized')
    emit('update:modelValue', false)
  } catch {
    addToast({ 
      message: t('gdpr_anonymize_modal.error_message'), 
      type: 'error' 
    })
  } finally {
    isProcessing.value = false
  }
}
</script>