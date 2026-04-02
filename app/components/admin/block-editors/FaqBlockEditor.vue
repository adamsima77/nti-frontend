<template>
  <div class="space-y-4">
    <UiFormField label="Nadpis sekcie">
      <UiInput
        :model-value="modelValue.title"
        placeholder="Často kladené otázky"
        @update:model-value="updateTitle($event)"
      />
    </UiFormField>

    <div class="space-y-3">
      <p class="text-sm font-medium text-gray-700">Otázky a odpovede</p>

      <div
        v-for="(item, index) in modelValue.items"
        :key="index"
        class="border border-gray-200 rounded-lg p-4 space-y-3"
      >
        <div class="flex items-start justify-between gap-2">
          <span class="text-xs font-medium text-gray-400 mt-2">{{ index + 1 }}.</span>
          <div class="flex-1 space-y-3">
            <UiInput
              :model-value="item.question"
              placeholder="Otázka"
              @update:model-value="updateItem(index, 'question', $event)"
            />
            <UiTextarea
              :model-value="item.answer"
              placeholder="Odpoveď (HTML)"
              :rows="3"
              @update:model-value="updateItem(index, 'answer', $event)"
            />
            <UiInput
              :model-value="item.category"
              placeholder="Kategória (voliteľné)"
              @update:model-value="updateItem(index, 'category', $event)"
            />
          </div>
          <button
            class="text-gray-400 hover:text-danger-500 mt-2"
            title="Odstrániť"
            @click="removeItem(index)"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <UiButton
        variant="outline"
        size="sm"
        @click="addItem"
      >
        <Plus class="w-4 h-4" />
        Pridať otázku
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import type { FaqBlockData } from '~/types/cms'

const props = defineProps<{
  modelValue: FaqBlockData
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FaqBlockData]
}>()

function updateTitle(value: string) {
  emit('update:modelValue', { ...props.modelValue, title: value })
}

function updateItem(index: number, key: string, value: string) {
  const items = [...props.modelValue.items]
  items[index] = { ...items[index], [key]: value }
  emit('update:modelValue', { ...props.modelValue, items })
}

function addItem() {
  const items = [...props.modelValue.items, { question: '', answer: '', category: '' }]
  emit('update:modelValue', { ...props.modelValue, items })
}

function removeItem(index: number) {
  const items = props.modelValue.items.filter((_, i) => i !== index)
  emit('update:modelValue', { ...props.modelValue, items })
}
</script>
