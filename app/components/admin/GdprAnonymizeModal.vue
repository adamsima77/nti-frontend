<template>
  <UiModal
    :model-value="modelValue"
    title="GDPR — Anonymizácia používateľa"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-4">
      <div class="flex items-start gap-3 p-4 bg-danger-50 rounded-lg">
        <AlertTriangle class="w-6 h-6 text-danger-500 shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-medium text-gray-800">Táto akcia je nevratná!</p>
          <p class="text-sm text-gray-600 mt-1">
            Naozaj chcete anonymizovať dáta používateľa
            <strong>{{ user?.name }}</strong> ({{ user?.email }})? Všetky osobné údaje budú trvalo odstránené.
          </p>
        </div>
      </div>

      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-xs font-medium text-gray-500 mb-2">Čo sa stane:</p>
        <ul class="text-xs text-gray-600 space-y-1">
          <li class="flex items-center gap-2">
            <X class="w-3 h-3 text-danger-500" />
            Meno a email budú nahradené anonymizovanými hodnotami
          </li>
          <li class="flex items-center gap-2">
            <X class="w-3 h-3 text-danger-500" />
            Osobné údaje v profile budú vymazané
          </li>
          <li class="flex items-center gap-2">
            <X class="w-3 h-3 text-danger-500" />
            Účet bude deaktivovaný
          </li>
        </ul>
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
        :disabled="isProcessing"
        @click="handleAnonymize"
      >
        {{ isProcessing ? 'Anonymizácia...' : 'Anonymizovať' }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { AlertTriangle, X } from 'lucide-vue-next'
import type { AdminUser } from '~/types/admin'

const props = defineProps<{
  modelValue: boolean
  user: AdminUser | null
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
    await api.delete(`/v1/admin/users/${props.user.id}/gdpr-delete`)
    addToast({ message: `Používateľ ${props.user.name} bol anonymizovaný`, type: 'success' })
    emit('anonymized')
    emit('update:modelValue', false)
  } catch {
    addToast({ message: 'Nepodarilo sa anonymizovať používateľa', type: 'error' })
  } finally {
    isProcessing.value = false
  }
}
</script>
