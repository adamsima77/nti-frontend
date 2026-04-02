<template>
  <div class="blocks-renderer">
    <component
      :is="blockComponent(block.type)"
      v-for="block in sortedBlocks"
      :key="block.id"
      :data="block.content"
    />
  </div>
</template>

<script setup lang="ts">
import type { CmsBlock, BlockType } from '~/types/cms'

const props = defineProps<{
  blocks: CmsBlock[]
}>()

const sortedBlocks = computed(() => [...props.blocks].sort((a, b) => a.order - b.order))

const blockMap: Record<BlockType, string> = {
  HeroBlock: 'BlocksHeroBlock',
  TextBlock: 'BlocksTextBlock',
  CtaBlock: 'BlocksCtaBlock',
  FaqBlock: 'BlocksFaqBlock',
  PartnersBlock: 'BlocksPartnersBlock',
}

function blockComponent(type: BlockType) {
  return resolveComponent(blockMap[type] || 'div')
}
</script>
