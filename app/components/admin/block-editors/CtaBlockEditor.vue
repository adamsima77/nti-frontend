<template>
  <div class="space-y-4">
    <UiFormField
      label="Nadpis"
      required
    >
      <UiInput
        :model-value="modelValue.title"
        placeholder="Výzva k akcii"
        @update:model-value="update('title', $event)"
      />
    </UiFormField>

    <UiFormField label="Popis">
      <UiTextarea
        :model-value="modelValue.description"
        placeholder="Doplňujúci text"
        :rows="3"
        @update:model-value="update('description', $event)"
      />
    </UiFormField>

    <div class="grid grid-cols-2 gap-4">
      <UiFormField
        label="Text tlačidla"
        required
      >
        <UiInput
          :model-value="modelValue.buttonText"
          placeholder="Prihlásiť sa"
          @update:model-value="update('buttonText', $event)"
        />
      </UiFormField>
      <UiFormField
        label="Odkaz tlačidla"
        required
      >
        <UiInput
          :model-value="modelValue.buttonLink"
          placeholder="/prihlasky"
          @update:model-value="update('buttonLink', $event)"
        />
      </UiFormField>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <UiFormField label="Variant tlačidla">
        <UiSelect
          :model-value="modelValue.variant || 'primary'"
          :options="variantOptions"
          @update:model-value="update('variant', $event)"
        />
      </UiFormField>
      <UiFormField label="CSS trieda pozadia">
        <UiInput
          :model-value="modelValue.backgroundClass"
          placeholder="bg-blue-50"
          @update:model-value="update('backgroundClass', $event)"
        />
      </UiFormField>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CtaBlockData } from '~/types/cms'

const props = defineProps<{
  modelValue: CtaBlockData
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CtaBlockData]
}>()

const variantOptions = [
  { value: 'primary', label: 'Primary' },
  { value: 'outline', label: 'Outline' },
]

function update(key: keyof CtaBlockData, value: string) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>
