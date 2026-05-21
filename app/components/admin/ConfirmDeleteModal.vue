<template>
  <UiModal
    :model-value="modelValue"
    :title="$t('cms_modals.delete_confirm.title')"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-4">
      <div class="flex items-center gap-3 p-4 bg-danger-50 rounded-lg">
        <AlertTriangle class="w-6 h-6 text-danger-500 shrink-0" />
        <p class="text-sm text-gray-700">
          {{ $t('cms_modals.delete_confirm.message') }} <strong>{{ itemName }}</strong>? {{ $t('cms_modals.delete_confirm.messageWarning') }}
        </p>
      </div>
    </div>

    <template #actions>
      <UiButton variant="ghost" @click="emit('update:modelValue', false)">
        {{ $t('cms_modals.delete_confirm.cancel') }}
      </UiButton>
      <UiButton variant="danger" :disabled="isDeleting" @click="emit('confirm')">
        {{ isDeleting ? $t('cms_modals.delete_confirm.confirming') : $t('cms_modals.delete_confirm.confirm') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'

defineProps<{
  modelValue: boolean
  itemName: string
  isDeleting?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()
</script>