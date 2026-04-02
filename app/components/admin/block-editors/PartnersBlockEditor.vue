<template>
  <div class="space-y-4">
    <UiFormField label="Nadpis sekcie">
      <UiInput
        :model-value="modelValue.title"
        placeholder="Naši partneri"
        @update:model-value="updateTitle($event)"
      />
    </UiFormField>

    <div class="space-y-3">
      <p class="text-sm font-medium text-gray-700">Partneri</p>

      <div
        v-for="(partner, index) in modelValue.partners"
        :key="index"
        class="border border-gray-200 rounded-lg p-4"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 grid grid-cols-3 gap-3">
            <UiInput
              :model-value="partner.name"
              placeholder="Názov partnera"
              @update:model-value="updatePartner(index, 'name', $event)"
            />
            <UiInput
              :model-value="partner.logoUrl"
              placeholder="URL loga"
              @update:model-value="updatePartner(index, 'logoUrl', $event)"
            />
            <UiInput
              :model-value="partner.website"
              placeholder="https://partner.sk"
              @update:model-value="updatePartner(index, 'website', $event)"
            />
          </div>
          <button
            class="text-gray-400 hover:text-danger-500 mt-2"
            title="Odstrániť"
            @click="removePartner(index)"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <UiButton
        variant="outline"
        size="sm"
        @click="addPartner"
      >
        <Plus class="w-4 h-4" />
        Pridať partnera
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import type { PartnersBlockData } from '~/types/cms'

const props = defineProps<{
  modelValue: PartnersBlockData
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PartnersBlockData]
}>()

function updateTitle(value: string) {
  emit('update:modelValue', { ...props.modelValue, title: value })
}

function updatePartner(index: number, key: string, value: string) {
  const partners = [...props.modelValue.partners]
  partners[index] = { ...partners[index], [key]: value }
  emit('update:modelValue', { ...props.modelValue, partners })
}

function addPartner() {
  const partners = [...props.modelValue.partners, { name: '', logoUrl: '', website: '' }]
  emit('update:modelValue', { ...props.modelValue, partners })
}

function removePartner(index: number) {
  const partners = props.modelValue.partners.filter((_, i) => i !== index)
  emit('update:modelValue', { ...props.modelValue, partners })
}
</script>
