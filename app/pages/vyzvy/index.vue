<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-navy mb-2">Výzvy a termíny</h1>
      <p class="text-gray-600">Pozrite si dostupné výzvy a zúčastnite sa tých, ktoré vás inšpirujú</p>
    </div>

    <!-- Loading state -->
    <div v-if="callsStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-80 animate-pulse" />
    </div>

    <!-- Empty state -->
    <div v-else-if="callsStore.calls.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-100">
      <UiEmptyState
        :icon="Megaphone"
        title="Zatiaľ nie sú dostupné žiadne výzvy"
        description="Skúste sa pozrieť neskôr. Nové výzvy budú čoskoro pridané."
      />
    </div>

    <!-- Call cards grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink
        v-for="call in callsStore.calls"
        :key="call.id"
        :to="`/vyzvy/${call.id}`"
        class="group"
      >
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-full hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col">
          <!-- Status badge -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  call.status === 'open' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700',
                ]"
              >
                {{ call.status === 'open' ? '🟢 Otvorené' : '🔒 Zatvorené' }}
              </span>
            </div>
          </div>

          <!-- Title and program -->
          <h3 class="text-lg font-bold text-navy mb-1 group-hover:text-blue-600 transition">{{ call.title }}</h3>
          <p class="text-sm text-gray-500 mb-4">{{ call.programName }}</p>

          <!-- Description -->
          <p class="text-sm text-gray-600 mb-4 flex-grow line-clamp-2">{{ call.description }}</p>

          <!-- Dates -->
          <div class="space-y-2 mb-4 pt-4 border-t border-gray-100">
            <div class="flex items-center gap-2 text-xs text-gray-600">
              <Calendar class="w-4 h-4" />
              <span>{{ formatDate(call.startDate) }}</span>
              <span class="text-gray-400">–</span>
              <span>{{ formatDate(call.endDate) }}</span>
            </div>

            <div class="flex items-center gap-2 text-xs text-gray-600">
              <Users class="w-4 h-4" />
              <span>{{ call.applicantsCount || 0 }} prihlášok</span>
            </div>
          </div>

          <!-- CTA -->
          <button
            class="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition mt-auto flex items-center justify-center gap-2"
          >
            Zobraziť detail
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Calendar, Users, Megaphone, ChevronRight } from 'lucide-vue-next'

definePageMeta({
  layout: 'default',
})

useHead({
  title: 'Výzvy a termíny | NTI',
  meta: [
    {
      name: 'description',
      content: 'Prezerajte si dostupné výzvy a termíny prihlášok pre Nitriansky technický inkubátor.',
    },
  ],
})

const callsStore = useCallsStore()

// Load calls on mount
onMounted(async () => {
  try {
    await callsStore.fetchOpenCalls()
  } catch (err) {
    console.error('Failed to load calls:', err)
  }
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('sk-SK')
}
</script>
