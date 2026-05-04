<template>
  <div class="min-h-screen flex flex-col">

    <!-- HERO -->
    <div class="bg-gradient-to-br from-navy via-blue-900 to-blue-800 text-white py-20 px-6">
      <div class="max-w-7xl mx-auto">
        <template v-if="!banner">
          <UiSkeleton height="3rem" width="50%" class="mb-4" />
          <UiSkeleton height="1.5rem" width="70%" />
        </template>

        <template v-else>
          <h1 class="text-5xl font-bold mb-4">
            {{ banner?.hero_banner_translations?.[0]?.title }}
          </h1>
          <p class="text-xl text-blue-100">
            {{ banner?.hero_banner_translations?.[0]?.description }}
          </p>
        </template>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="flex-1 bg-gray-50 py-20 px-6">
      <div class="max-w-7xl mx-auto">

        <!-- LOADING -->
        <div
          v-if="pending"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <div
            v-for="i in 6"
            :key="i"
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col gap-4 h-96"
          >
            <UiSkeleton height="1.5rem" width="30%" />
            <UiSkeleton height="1.5rem" width="80%" />
            <UiSkeleton height="1.5rem" width="60%" />
            <UiSkeleton height="1rem" width="40%" />

            <div class="flex flex-col gap-2 flex-1">
              <UiSkeleton height="0.9rem" width="100%" />
              <UiSkeleton height="0.9rem" width="95%" />
              <UiSkeleton height="0.9rem" width="85%" />
            </div>

            <UiSkeleton height="2.75rem" class="w-full rounded-lg" />
          </div>
        </div>

        <!-- EMPTY -->
        <div
          v-else-if="calls.length === 0"
          class="bg-white rounded-lg shadow-md border border-gray-200 p-12"
        >
          <UiEmptyState
            :icon="Megaphone"
            title="Žiadne výzvy momentálne"
            description="Skontrolujte neskôr alebo upravte filtre"
          />
        </div>

        <!-- GRID -->
        <template v-else>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            <NuxtLink
              v-for="call in calls"
              :key="call.id"
              :to="`/vyzvy/${call.id}`"
              class="group"
            >
              <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6 h-full hover:shadow-xl hover:border-blue-400 transition-all flex flex-col">

                <!-- STATUS -->
                <span
                  :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4',
                    call.status === 'open'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-700',
                  ]"
                >
                  {{ call.status === 'open' ? '🟢 Otvorené' : '🔒 Zatvorené' }}
                </span>

                <!-- TITLE -->
                <h3 class="text-xl font-bold text-navy mb-2 line-clamp-2">
                  {{ call.title }}
                </h3>

                <!-- PROGRAM -->
                <p class="text-sm text-gray-500 mb-5 font-medium">
                  {{ call.programName || '—' }}
                </p>

                <!-- DESCRIPTION -->
                <p class="text-sm text-gray-600 mb-6 flex-grow line-clamp-3">
                  {{ call.description }}
                </p>

                <!-- DATES -->
                <div class="space-y-3 mb-6 pt-6 border-t border-gray-200">
                  <div class="flex items-center gap-3 text-sm text-gray-700">
                    <Calendar class="w-5 h-5 text-blue-600" />
                    <span>
                      {{ formatDate(call.applicationStart) }} – {{ formatDate(call.applicationDeadline) }}
                    </span>
                  </div>

                  <div class="flex items-center gap-3 text-sm text-gray-700">
                    <Users class="w-5 h-5 text-blue-600" />
                    <span>
                      {{ call.applicantsCount ?? 0 }}
                      {{
                        (call.applicantsCount ?? 0) === 1
                          ? $t('calls.vyzvy_terminy.applicants.single')
                          : $t('calls.vyzvy_terminy.applicants.plural')
                      }}
                    </span>
                  </div>
                </div>

                <!-- CTA -->
                <button class="w-full mt-auto px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                  {{ $t('calls.vyzvy_terminy.cta') }}
                  <ChevronRight class="w-4 h-4" />
                </button>

              </div>
            </NuxtLink>

          </div>

          <!-- PAGINATION -->
          <div class="mt-12 flex justify-center">
            <UiPagination
              :current-page="page"
              :total-pages="meta?.last_page || 1"
              @update:current-page="onPageChange"
            />
          </div>
        </template>

      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Calendar, Users, Megaphone, ChevronRight } from 'lucide-vue-next'
import { useBanner } from '../../composables/modules/content/banners/fetchBanner'
import { PageType } from '../../composables/modules/content/enum/PageType'
import { fetchMeta } from '../../composables/modules/content/meta_tags/fetchMetaByPageLang'
import { useCalls } from '../../composables/modules/programs/fetchCalls'

definePageMeta({ layout: 'default' })

// --------------------
// STATE
// --------------------
const page = ref(1)

// --------------------
// DATA (SSR SAFE)
// --------------------
const { calls, meta, pending } = useCalls(page)

const { banner } = useBanner(PageType.CALLS_AND_DEADLINES)
const { metaTags } = fetchMeta(PageType.CALLS_AND_DEADLINES)

// --------------------
// SEO (SSR SAFE)
// --------------------
const metaTag = computed(() =>
  metaTags.value?.meta_tag_translations?.[0]
)

useSeoMeta({
  title: () => metaTag.value?.title ?? '',
  description: () => metaTag.value?.description ?? '',
})

// --------------------
// EVENTS
// --------------------
const onPageChange = (p: number) => {
  page.value = p

  if (process.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// --------------------
// UTILS
// --------------------
const formatDate = (dateString?: string) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('sk-SK')
}
</script>