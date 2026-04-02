<template>
  <div class="space-y-4">
    <UiFormField
      label="Nadpis"
      required
    >
      <UiInput
        :model-value="modelValue.title"
        placeholder="Hlavný nadpis"
        @update:model-value="update('title', $event)"
      />
    </UiFormField>

    <UiFormField label="Popis">
      <UiTextarea
        :model-value="modelValue.description"
        placeholder="Popisný text pod nadpisom"
        :rows="3"
        @update:model-value="update('description', $event)"
      />
    </UiFormField>

    <div class="grid grid-cols-2 gap-4">
      <UiFormField label="Text primárneho CTA">
        <UiInput
          :model-value="modelValue.primaryCtaText"
          placeholder="Začni teraz"
          @update:model-value="update('primaryCtaText', $event)"
        />
      </UiFormField>
      <UiFormField label="Odkaz primárneho CTA">
        <UiInput
          :model-value="modelValue.primaryCtaLink"
          placeholder="/auth/login"
          @update:model-value="update('primaryCtaLink', $event)"
        />
      </UiFormField>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <UiFormField label="Text sekundárneho CTA">
        <UiInput
          :model-value="modelValue.secondaryCtaText"
          placeholder="Zisti viac"
          @update:model-value="update('secondaryCtaText', $event)"
        />
      </UiFormField>
      <UiFormField label="Odkaz sekundárneho CTA">
        <UiInput
          :model-value="modelValue.secondaryCtaLink"
          placeholder="/o-nas"
          @update:model-value="update('secondaryCtaLink', $event)"
        />
      </UiFormField>
    </div>

    <UiFormField label="URL obrázku na pozadí">
      <UiInput
        :model-value="modelValue.backgroundImage"
        placeholder="https://..."
        @update:model-value="update('backgroundImage', $event)"
      />
    </UiFormField>
  </div>
</template>

<script setup lang="ts">
import type { HeroBlockData } from '~/types/cms'

const props = defineProps<{
  modelValue: HeroBlockData
}>()

const emit = defineEmits<{
  'update:modelValue': [value: HeroBlockData]
}>()

function update(key: keyof HeroBlockData, value: string) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>
