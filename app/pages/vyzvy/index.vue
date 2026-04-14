<template>
  <div class="min-h-screen flex flex-col">

    <!-- HERO -->
    <div class="bg-gradient-to-br from-navy via-blue-900 to-blue-800 text-white py-20 px-6">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-5xl font-bold mb-4">
          {{ $t('calls.vyzvy_terminy.hero.title') }}
        </h1>
        <p class="text-xl text-blue-100">
          {{ $t('calls.vyzvy_terminy.hero.subtitle') }}
        </p>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="flex-1 bg-gray-50 py-20 px-6">
      <div class="max-w-7xl mx-auto">

        <!-- LOADING -->
        <div v-if="callsStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="i in 6"
            :key="i"
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-96 animate-pulse"
          />
        </div>

        <!-- EMPTY -->
        <div
          v-else-if="callsStore.calls.length === 0"
          class="bg-white rounded-lg shadow-md border border-gray-200 p-12"
        >
          <UiEmptyState
            :icon="Megaphone"
            :title="$t('calls.vyzvy_terminy.empty.title')"
            :description="$t('calls.vyzvy_terminy.empty.description')"
          />
        </div>

        <!-- GRID -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          <NuxtLink
            v-for="call in callsStore.calls"
            :key="call.id"
            :to="`/vyzvy/${call.id}`"
            class="group"
          >
            <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6 h-full hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer flex flex-col">

              <!-- 🚫 STATUS BOX LEFT EXACTLY AS-IS -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <span
                    :class="[
                      'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
                      call.status === 'open' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700',
                    ]"
                  >
                    {{ call.status === 'open' ? '🟢 Otvorené' : '🔒 Zatvorené' }}
                  </span>
                </div>
              </div>

              <h3 class="text-xl font-bold text-navy mb-2 group-hover:text-blue-600 transition line-clamp-2">
                {{ call.title }}
              </h3>

              <p class="text-sm text-gray-500 mb-5 font-medium">
                {{ call.programName }}
              </p>

              <p class="text-sm text-gray-600 mb-6 flex-grow line-clamp-3 leading-relaxed">
                {{ call.description }}
              </p>

              <div class="space-y-3 mb-6 pt-6 border-t border-gray-200">
                <div class="flex items-center gap-3 text-sm text-gray-700">
                  <Calendar class="w-5 h-5 text-blue-600" />
                  <span>{{ formatDate(call.startDate) }} – {{ formatDate(call.endDate) }}</span>
                </div>

                <div class="flex items-center gap-3 text-sm text-gray-700">
                  <Users class="w-5 h-5 text-blue-600" />
                  <span>
                    {{ call.applicantsCount || 0 }}
                    {{
                      call.applicantsCount === 1
                        ? $t('calls.vyzvy_terminy.applicants.single')
                        : $t('calls.vyzvy_terminy.applicants.plural')
                    }}
                  </span>
                </div>
              </div>

              <button
                class="w-full px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition mt-auto flex items-center justify-center gap-2"
              >
                {{ $t('calls.vyzvy_terminy.cta') }}
                <ChevronRight class="w-4 h-4" />
              </button>

            </div>
          </NuxtLink>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Calendar, Users, Megaphone, ChevronRight } from 'lucide-vue-next'

definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'Výzvy a termíny | NTI',
  description: 'Prezerajte si dostupné výzvy a termíny prihlášok pre Nitriansky technický inkubátor.',
  ogTitle: 'Výzvy a termíny — NTI',
  ogDescription: 'Prijavlňujúce sa výzvy na Program A a Program B. Zistite termíny prihlášok a požiadavky.',
  ogType: 'website',
  ogUrl: 'https://nti.sk/vyzvy',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Výzvy a termíny — NTI',
  twitterDescription: 'Prezerajte si dostupné výzvy a termíny prihlášok.',
})

const callsStore = useCallsStore()

// Load calls on mount
onMounted(async () => {
  await callsStore.fetchOpenCalls()
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('sk-SK')
}
</script>
