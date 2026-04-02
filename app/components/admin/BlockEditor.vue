<template>
  <div class="space-y-4">
    <!-- Block list -->
    <div
      v-if="modelValue.length === 0"
      class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200"
    >
      <LayoutGrid class="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 text-sm">Zatiaľ žiadne bloky</p>
      <p class="text-gray-400 text-xs mt-1">Pridajte prvý blok pomocou tlačidla nižšie</p>
    </div>

    <div
      v-for="(block, index) in modelValue"
      :key="block.id"
      class="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-colors"
    >
      <!-- Block type icon -->
      <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
        <component
          :is="blockIcon(block.type)"
          class="w-5 h-5 text-blue-600"
        />
      </div>

      <!-- Block info -->
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-navy">{{ blockTypeLabel(block.type) }}</p>
        <p class="text-xs text-gray-400 truncate">{{ blockSummary(block) }}</p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-1">
        <button
          :disabled="index === 0"
          class="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Posunúť hore"
          @click="moveBlock(index, -1)"
        >
          <ArrowUp class="w-4 h-4 text-gray-500" />
        </button>
        <button
          :disabled="index === modelValue.length - 1"
          class="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Posunúť dole"
          @click="moveBlock(index, 1)"
        >
          <ArrowDown class="w-4 h-4 text-gray-500" />
        </button>
        <button
          class="p-1.5 rounded hover:bg-gray-100"
          title="Upraviť"
          @click="editBlock(index)"
        >
          <Pencil class="w-4 h-4 text-blue-600" />
        </button>
        <button
          class="p-1.5 rounded hover:bg-gray-100"
          title="Vymazať"
          @click="removeBlock(index)"
        >
          <Trash2 class="w-4 h-4 text-gray-400 hover:text-danger-500" />
        </button>
      </div>
    </div>

    <!-- Add block -->
    <div class="relative">
      <UiButton
        variant="outline"
        @click="showPicker = !showPicker"
      >
        <Plus class="w-4 h-4" />
        Pridať blok
      </UiButton>

      <Transition name="picker-fade">
        <div
          v-if="showPicker"
          class="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-2 min-w-[220px]"
        >
          <button
            v-for="bt in blockTypes"
            :key="bt.type"
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors"
            @click="addBlock(bt.type)"
          >
            <component
              :is="bt.icon"
              class="w-4 h-4 text-blue-600"
            />
            {{ bt.label }}
          </button>
        </div>
      </Transition>
    </div>

    <!-- Block editor modal -->
    <AdminBlockEditorModal
      v-model="showEditorModal"
      :block-type="editingBlockType"
      :block-data="editingBlockData"
      @save="handleBlockSaved"
    />
  </div>
</template>

<script setup lang="ts">
import {
  LayoutGrid,
  Image,
  Type,
  MousePointerClick,
  HelpCircle,
  Users,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-vue-next'
import type { CmsBlock, BlockType } from '~/types/cms'

const props = defineProps<{
  modelValue: CmsBlock[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CmsBlock[]]
}>()

const showPicker = ref(false)
const showEditorModal = ref(false)
const editingBlockIndex = ref<number | null>(null)
const editingBlockType = ref<BlockType | null>(null)
const editingBlockData = ref<any>(null)

const blockTypes = [
  { type: 'HeroBlock' as BlockType, label: 'Hero blok', icon: Image },
  { type: 'TextBlock' as BlockType, label: 'Textový blok', icon: Type },
  { type: 'CtaBlock' as BlockType, label: 'CTA blok', icon: MousePointerClick },
  { type: 'FaqBlock' as BlockType, label: 'FAQ blok', icon: HelpCircle },
  { type: 'PartnersBlock' as BlockType, label: 'Partneri blok', icon: Users },
]

const blockTypeLabels: Record<BlockType, string> = {
  HeroBlock: 'Hero blok',
  TextBlock: 'Textový blok',
  CtaBlock: 'CTA blok',
  FaqBlock: 'FAQ blok',
  PartnersBlock: 'Partneri blok',
}

const blockIcons: Record<BlockType, any> = {
  HeroBlock: Image,
  TextBlock: Type,
  CtaBlock: MousePointerClick,
  FaqBlock: HelpCircle,
  PartnersBlock: Users,
}

function blockTypeLabel(type: BlockType) {
  return blockTypeLabels[type] || type
}

function blockIcon(type: BlockType) {
  return blockIcons[type] || LayoutGrid
}

function blockSummary(block: CmsBlock): string {
  const content = block.content as any
  if (content.title) return content.title
  if (content.heading) return content.heading
  if (content.question) return content.question
  if (content.content) return content.content.replace(/<[^>]*>/g, '').slice(0, 60)
  if (content.items?.length) return `${content.items.length} otázok`
  if (content.partners?.length) return `${content.partners.length} partnerov`
  return 'Prázdny blok'
}

function addBlock(type: BlockType) {
  showPicker.value = false
  editingBlockIndex.value = null
  editingBlockType.value = type
  editingBlockData.value = null
  showEditorModal.value = true
}

function editBlock(index: number) {
  const block = props.modelValue[index]
  editingBlockIndex.value = index
  editingBlockType.value = block.type
  editingBlockData.value = { ...block.content }
  showEditorModal.value = true
}

function removeBlock(index: number) {
  const blocks = props.modelValue.filter((_, i) => i !== index).map((b, i) => ({ ...b, order: i }))
  emit('update:modelValue', blocks)
}

function moveBlock(index: number, direction: number) {
  const blocks = [...props.modelValue]
  const target = index + direction
  if (target < 0 || target >= blocks.length) return
  ;[blocks[index], blocks[target]] = [blocks[target], blocks[index]]
  emit(
    'update:modelValue',
    blocks.map((b, i) => ({ ...b, order: i })),
  )
}

function handleBlockSaved(data: any) {
  const blocks = [...props.modelValue]
  if (editingBlockIndex.value !== null) {
    blocks[editingBlockIndex.value] = { ...blocks[editingBlockIndex.value], content: data }
  } else {
    blocks.push({
      id: `new-${Date.now()}`,
      type: editingBlockType.value!,
      content: data,
      order: blocks.length,
    })
  }
  emit('update:modelValue', blocks)
}
</script>

<style scoped>
.picker-fade-enter-active,
.picker-fade-leave-active {
  transition: all 0.15s ease;
}

.picker-fade-enter-from,
.picker-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
