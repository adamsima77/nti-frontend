<template>
  <UiModal
    :model-value="modelValue"
    :title="isEditing ? `Upraviť ${blockTypeLabel}` : `Nový ${blockTypeLabel}`"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <component
      :is="editorComponent"
      v-if="editorComponent"
      v-model="localData"
    />

    <template #actions>
      <UiButton
        variant="ghost"
        @click="emit('update:modelValue', false)"
      >
        Zrušiť
      </UiButton>
      <UiButton @click="handleSave"> Uložiť </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import type { BlockType } from '~/types/cms'

const props = defineProps<{
  modelValue: boolean
  blockType: BlockType | null
  blockData?: any
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: any]
}>()

const isEditing = computed(() => !!props.blockData)

const blockTypeLabels: Record<BlockType, string> = {
  HeroBlock: 'Hero blok',
  TextBlock: 'Textový blok',
  CtaBlock: 'CTA blok',
  FaqBlock: 'FAQ blok',
  PartnersBlock: 'Partneri blok',
}

const blockTypeLabel = computed(() => (props.blockType ? blockTypeLabels[props.blockType] : 'blok'))

const defaultData: Record<BlockType, any> = {
  HeroBlock: {
    title: '',
    description: '',
    primaryCtaText: '',
    primaryCtaLink: '',
    secondaryCtaText: '',
    secondaryCtaLink: '',
    backgroundImage: '',
  },
  TextBlock: { heading: '', content: '', alignment: 'left' },
  CtaBlock: {
    title: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    variant: 'primary',
    backgroundClass: 'bg-blue-50',
  },
  FaqBlock: { title: '', items: [{ question: '', answer: '', category: '' }] },
  PartnersBlock: { title: '', partners: [{ name: '', logoUrl: '', website: '' }] },
}

const localData = ref<any>({})

watch(
  () => [props.modelValue, props.blockType, props.blockData],
  () => {
    if (props.modelValue && props.blockType) {
      localData.value = props.blockData ? { ...props.blockData } : { ...defaultData[props.blockType] }
    }
  },
  { immediate: true },
)

const editorMap: Record<BlockType, string> = {
  HeroBlock: 'AdminBlockEditorsHeroBlockEditor',
  TextBlock: 'AdminBlockEditorsTextBlockEditor',
  CtaBlock: 'AdminBlockEditorsCtaBlockEditor',
  FaqBlock: 'AdminBlockEditorsFaqBlockEditor',
  PartnersBlock: 'AdminBlockEditorsPartnersBlockEditor',
}

const editorComponent = computed(() => {
  if (!props.blockType) return null
  return resolveComponent(editorMap[props.blockType])
})

function handleSave() {
  emit('save', localData.value)
  emit('update:modelValue', false)
}
</script>
