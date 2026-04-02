<template>
  <div class="space-y-4">
    <UiFormField label="Nadpis">
      <UiInput
        :model-value="modelValue.heading"
        placeholder="Voliteľný nadpis sekcie"
        @update:model-value="update('heading', $event)"
      />
    </UiFormField>

    <UiFormField
      label="Obsah (HTML)"
      required
    >
      <UiTextarea
        :model-value="modelValue.content"
        placeholder="<p>Obsah textu...</p>"
        :rows="8"
        @update:model-value="update('content', $event)"
      />
    </UiFormField>

    <UiFormField label="Zarovnanie">
      <UiSelect
        :model-value="modelValue.alignment || 'left'"
        :options="alignmentOptions"
        @update:model-value="update('alignment', $event)"
      />
    </UiFormField>
  </div>
</template>

<script setup lang="ts">
import type { TextBlockData } from '~/types/cms'

const props = defineProps<{
  modelValue: TextBlockData
}>()

const emit = defineEmits<{
  'update:modelValue': [value: TextBlockData]
}>()

const alignmentOptions = [
  { value: 'left', label: 'Vľavo' },
  { value: 'center', label: 'Na stred' },
  { value: 'right', label: 'Vpravo' },
]

function update(key: keyof TextBlockData, value: string) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>
