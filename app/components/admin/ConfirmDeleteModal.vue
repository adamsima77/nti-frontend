<template>
  <UiModal
    :model-value="modelValue"
    title="Potvrdiť vymazanie"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-4">
      <div class="flex items-center gap-3 p-4 bg-danger-50 rounded-lg">
        <AlertTriangle class="w-6 h-6 text-danger-500 shrink-0" />
        <p class="text-sm text-gray-700">
          Naozaj chcete vymazať <strong>{{ itemName }}</strong
          >? Táto akcia je nevratná.
        </p>
      </div>
    </div>

    <template #actions>
      <UiButton
        variant="ghost"
        @click="emit('update:modelValue', false)"
      >
        Zrušiť
      </UiButton>
      <UiButton
        variant="danger"
        :disabled="isDeleting"
        @click="emit('confirm')"
      >
        {{ isDeleting ? 'Mazanie...' : 'Vymazať' }}
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
