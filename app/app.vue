<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <UiToast />
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const { flushPendingToast } = useToast()
const route = useRoute()

onMounted(() => {
  flushPendingToast()
})

watch(
  () => route.fullPath,
  () => {
    flushPendingToast()
  },
)
</script>
