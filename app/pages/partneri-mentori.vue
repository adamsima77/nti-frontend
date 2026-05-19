<template>
  <div class="max-w-7xl mx-auto px-4 py-20 md:px-6 md:py-16 space-y-20">

    <!-- HERO -->
   <template v-if="banner_pending">
  <div class="relative bg-blue-500 overflow-hidden rounded-lg shadow-2xl">
    <div class="relative max-w-3xl mx-auto text-center text-white py-10 sm:py-12 md:py-16 px-4 md:px-8 space-y-4">
      <UiSkeleton height="2.5rem" width="70%" class="mx-auto" />
      <UiSkeleton height="1.2rem" width="90%" class="mx-auto" />
      <UiSkeleton height="1.2rem" width="80%" class="mx-auto" />
    </div>
  </div>
</template>
<template v-else-if="banner">
  <div class="relative bg-blue-500 overflow-hidden rounded-lg shadow-2xl">
    <div class="absolute inset-0 bg-gradient-to-b from-blue-500/70 to-blue-700/70 mix-blend-multiply pointer-events-none" />
    <div class="relative max-w-3xl mx-auto text-center text-white py-10 sm:py-12 md:py-16 px-4 md:px-8">
      <h2 class="text-3xl sm:text-4xl md:text-4xl font-extrabold mb-2">
        {{ banner?.hero_banner_translations?.[0]?.title }}
      </h2>
      <p class="text-sm sm:text-base md:text-lg leading-relaxed">
        {{ banner?.hero_banner_translations?.[0]?.description }}
      </p>
    </div>
  </div>
</template>

    <!-- PARTNERS -->
    <section>
      <div class="flex items-center justify-between mb-10">
        <h2 class="text-3xl font-bold text-navy">
          {{ $t('partners_page.partners.title') }}
        </h2>
        <div class="flex items-center gap-2">
          <button @click="scrollPartnersLeft" :disabled="!canScrollPartnersLeft" class="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
            <LucideChevronLeft class="w-5 h-5" />
          </button>
          <button @click="scrollPartnersRight" :disabled="!canScrollPartnersRight" class="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
            <LucideChevronRight class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div class="relative">
        <div class="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent z-10" />
        <div class="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent z-10" />
        <div class="overflow-hidden">
          <ClientOnly>
            <template #default>
              <template v-if="partners_pending || !partnersList.length">
                <div class="flex gap-6 overflow-x-auto no-scrollbar">
                  <div
                    v-for="n in 4"
                    :key="'partner-skeleton-' + n"
                    class="min-w-[280px] max-w-[320px] flex-shrink-0 bg-white rounded-2xl shadow p-6 flex flex-col gap-4"
                  >
                    <UiSkeleton variant="rect" height="8rem" class="w-full rounded-lg" />
                    <UiSkeleton height="1.2rem" width="60%" />
                    <UiSkeleton height="0.9rem" width="90%" />
                    <UiSkeleton height="0.9rem" width="80%" />
                  </div>
                </div>
              </template>
              <template v-else>
                <div
                  ref="partnersContainer"
                  class="flex gap-6 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory no-scrollbar"
                  @scroll="updatePartnersScroll"
                >
                  <div
                    v-for="(p, i) in partnersList"
                    :key="i"
                    class="min-w-[280px] max-w-[320px] snap-start"
                  >
                    <UiPartnerCard
                      :name="p?.name"
                      :alt="p?.name"
                      :image="p?.image_url"
                      :description="p?.partner_translations?.[0]?.description"
                    />
                  </div>
                  <div v-if="isFetching" class="min-w-[280px] max-w-[320px] flex items-center justify-center">
                    <UiLoader />
                  </div>
                </div>
              </template>
            </template>

            <template #fallback>
              <div class="flex gap-6 overflow-x-auto no-scrollbar">
                <div
                  v-for="n in 4"
                  :key="n"
                  class="min-w-[280px] max-w-[320px] flex-shrink-0 bg-white rounded-2xl shadow p-6 flex flex-col gap-4"
                >
                  <UiSkeleton variant="rect" height="8rem" class="w-full rounded-lg" />
                  <UiSkeleton height="1.2rem" width="60%" />
                  <UiSkeleton height="0.9rem" width="90%" />
                  <UiSkeleton height="0.9rem" width="80%" />
                </div>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </section>

    <!-- MENTORS -->
    <section>
      <div class="flex items-center justify-between mb-10">
        <h2 class="text-3xl font-bold text-navy">
          {{ $t('partners_page.mentors.title') }}
        </h2>
        <div class="flex items-center gap-2">
          <button
            @click="scrollMentorsLeft"
            :disabled="!canScrollMentorsLeft"
            class="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LucideChevronLeft class="w-5 h-5" />
          </button>
          <button
            @click="scrollMentorsRight"
            :disabled="!canScrollMentorsRight"
            class="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LucideChevronRight class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div class="relative">
        <div class="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent z-10" />
        <div class="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent z-10" />
        <div class="overflow-hidden">
          <ClientOnly>
            <template #default>
              <template v-if="mentors_pending || !mentorsList.length">
                <div class="flex gap-6 overflow-x-auto no-scrollbar">
                  <div
                    v-for="n in 4"
                    :key="'mentor-skeleton-' + n"
                    class="min-w-[220px] max-w-[260px] flex-shrink-0 bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-4"
                  >
                    <UiSkeleton variant="rect" class="w-20 h-20 rounded-full" />
                    <UiSkeleton height="1rem" width="70%" />
                    <UiSkeleton height="0.85rem" width="50%" />
                  </div>
                </div>
              </template>
              <template v-else>
                <div
                  ref="mentorsContainer"
                  class="flex gap-6 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory no-scrollbar"
                  @scroll="updateMentorsScroll"
                >
                  <div
                    v-for="(m, i) in mentorsList"
                    :key="i"
                    class="min-w-[220px] max-w-[260px] snap-start"
                  >
                    <UiTeamCard
                      :image="m?.avatar_url"
                      :name="m?.name + ' ' + m?.surname"
                      :role="m?.job_position"
                    />
                  </div>
                  <div v-if="isFetchingMentors" class="min-w-[220px] max-w-[260px] flex items-center justify-center">
                    <UiLoader />
                  </div>
                </div>
              </template>
            </template>

            <template #fallback>
              <div class="flex gap-6 overflow-x-auto no-scrollbar">
                <div
                  v-for="n in 4"
                  :key="n"
                  class="min-w-[220px] max-w-[260px] flex-shrink-0 bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-4"
                >
                  <UiSkeleton variant="rect" class="w-20 h-20 rounded-full" />
                  <UiSkeleton height="1rem" width="70%" />
                  <UiSkeleton height="0.85rem" width="50%" />
                </div>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </section>

    <!-- REFERENCES -->
    <section>
      <div class="flex items-center justify-between mb-10">
        <h2 class="text-3xl font-bold text-navy">
          {{ $t('partners_page.references.title') }}
        </h2>
        <div class="flex items-center gap-2">
          <button @click="scrollLeft" :disabled="!canScrollLeft" class="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
            <LucideChevronLeft class="w-5 h-5" />
          </button>
          <button @click="scrollRight" :disabled="!canScrollRight" class="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
            <LucideChevronRight class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div class="relative">
        <div class="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent z-10" />
        <div class="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent z-10" />
        <div class="overflow-hidden">
          <ClientOnly>
            <template #default>
              <template v-if="references_pending || !referencesList.length">
                <div class="flex gap-6 overflow-x-auto no-scrollbar">
                  <div
                    v-for="n in 4"
                    :key="'reference-skeleton-' + n"
                    class="min-w-[280px] max-w-[320px] flex-shrink-0 bg-white rounded-2xl shadow p-6 flex flex-col gap-4"
                  >
                    <div class="flex items-center gap-4">
                      <UiSkeleton variant="rect" class="w-12 h-12 rounded-full flex-shrink-0" />
                      <div class="flex flex-col gap-2 flex-1">
                        <UiSkeleton height="1rem" width="60%" />
                        <UiSkeleton height="0.85rem" width="40%" />
                      </div>
                    </div>
                    <UiSkeleton height="0.9rem" width="100%" />
                    <UiSkeleton height="0.9rem" width="95%" />
                    <UiSkeleton height="0.9rem" width="85%" />
                  </div>
                </div>
              </template>
              <template v-else>
                <div
                  ref="scrollContainer"
                  class="flex items-stretch gap-6 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory no-scrollbar"
                  @scroll="updateScrollButtons"
                >
                  <div
                    v-for="(r, i) in referencesList"
                    :key="i"
                    class="min-w-[280px] max-w-[320px] snap-start flex flex-col"
                  >
                    <UiReferenceCard
                      class="h-full"
                      :name="r?.name"
                      :job_position="r?.job_position"
                      :quote="r?.partner_reference_translations?.[0]?.description"
                      :image="r?.image_url"
                    />
                  </div>
                  <div v-if="referencesFetching" class="min-w-[280px] max-w-[320px] flex items-center justify-center">
                    <UiLoader />
                  </div>
                </div>
              </template>
            </template>

            <template #fallback>
              <div class="flex gap-6 overflow-x-auto no-scrollbar">
                <div
                  v-for="n in 4"
                  :key="n"
                  class="min-w-[280px] max-w-[320px] flex-shrink-0 bg-white rounded-2xl shadow p-6 flex flex-col gap-4"
                >
                  <div class="flex items-center gap-4">
                    <UiSkeleton variant="rect" class="w-12 h-12 rounded-full flex-shrink-0" />
                    <div class="flex flex-col gap-2 flex-1">
                      <UiSkeleton height="1rem" width="60%" />
                      <UiSkeleton height="0.85rem" width="40%" />
                    </div>
                  </div>
                  <UiSkeleton height="0.9rem" width="100%" />
                  <UiSkeleton height="0.9rem" width="95%" />
                  <UiSkeleton height="0.9rem" width="85%" />
                </div>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </section>

  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useBanner } from '../composables/modules/content/banners/fetchBanner'
import { PageType } from '../composables/modules/content/enum/PageType'
import { fetchMeta } from '../composables/modules/content/meta_tags/fetchMetaByPageLang'
import { fetchPartnersi } from '../composables/modules/content/partners/fetchPartnersi'
import { fetchReferences } from '../composables/modules/content/references/fethReferences'
import { fetchMentors } from '../composables/modules/content/mentors/fetchMentors'

// ── SEO ───────────────────────────────────────────────────
const { metaTags } = fetchMeta(PageType.PARTNERS)
const meta = computed(() => metaTags.value?.meta_tag_translations?.[0])

useSeoMeta({
  title: computed(() => meta.value?.title),
  description: computed(() => meta.value?.description),
  ogTitle: computed(() => meta.value?.og_title),
  ogDescription: computed(() => meta.value?.og_description),
  ogType: computed(() => meta.value?.og_type),
  ogUrl: computed(() => meta.value?.og_url),
  twitterCard: computed(() => meta.value?.twitter_card),
  twitterTitle: computed(() => meta.value?.twitter_title),
  twitterDescription: computed(() => meta.value?.twitter_description),
})

// ── data ──────────────────────────────────────────────────
const { banner, pending: banner_pending } = useBanner(PageType.PARTNERS)
const { partnersList, isFetching, fetchNextPage, pending: partners_pending } = fetchPartnersi()
const { referencesList, isFetching: referencesFetching, fetchNextPage: fetchNextReference, pending: references_pending } = fetchReferences()
const { mentorsList, isFetching: isFetchingMentors, fetchNextPage: fetchNextMentor, pending: mentors_pending } = fetchMentors()

// ── refs ──────────────────────────────────────────────────
const partnersContainer = ref<HTMLElement | null>(null)
const mentorsContainer = ref<HTMLElement | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)
const resizeObserver = ref<ResizeObserver | null>(null)
const scrollAmount = 320

// ── scroll state ──────────────────────────────────────────
const canScrollPartnersLeft = ref(false)
const canScrollPartnersRight = ref(false)
const canScrollMentorsLeft = ref(false)
const canScrollMentorsRight = ref(false)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

// ── shared helper ─────────────────────────────────────────
const waitForImages = (el: HTMLElement): Promise<void[]> => {
  const imgs = [...el.querySelectorAll<HTMLImageElement>('img')]
  return Promise.all(
    imgs
      .filter(img => !img.complete)
      .map(img => new Promise<void>(resolve => {
        img.onload = () => resolve()
        img.onerror = () => resolve()
      }))
  )
}

// ── partners ──────────────────────────────────────────────
const updatePartnersScroll = () => {
  const el = partnersContainer.value
  if (!el) return
  const { scrollLeft, scrollWidth, clientWidth } = el
  canScrollPartnersLeft.value = scrollLeft > 0
  canScrollPartnersRight.value = scrollLeft + clientWidth < scrollWidth - 1
  if (scrollWidth - scrollLeft - clientWidth < 100) fetchNextPage()
}

const scrollPartnersLeft = () => partnersContainer.value?.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
const scrollPartnersRight = () => partnersContainer.value?.scrollBy({ left: scrollAmount, behavior: 'smooth' })

const initPartners = async () => {
  await nextTick()
  if (!partnersContainer.value) return
  await waitForImages(partnersContainer.value)
  updatePartnersScroll()
}

// ── mentors ───────────────────────────────────────────────
const updateMentorsScroll = () => {
  const el = mentorsContainer.value
  if (!el) return
  const { scrollLeft, scrollWidth, clientWidth } = el
  canScrollMentorsLeft.value = scrollLeft > 0
  canScrollMentorsRight.value = scrollLeft + clientWidth < scrollWidth - 1
  if (scrollWidth - scrollLeft - clientWidth < 100) fetchNextMentor()
}

const scrollMentorsLeft = () => mentorsContainer.value?.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
const scrollMentorsRight = () => mentorsContainer.value?.scrollBy({ left: scrollAmount, behavior: 'smooth' })

const initMentors = async () => {
  await nextTick()
  if (!mentorsContainer.value) return
  await waitForImages(mentorsContainer.value)
  updateMentorsScroll()
}

// ── references ────────────────────────────────────────────
const updateScrollButtons = () => {
  const el = scrollContainer.value
  if (!el) return
  const { scrollLeft, scrollWidth, clientWidth } = el
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 1
  if (scrollWidth - scrollLeft - clientWidth < 100) fetchNextReference()
}

const scrollLeft = () => scrollContainer.value?.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
const scrollRight = () => scrollContainer.value?.scrollBy({ left: scrollAmount, behavior: 'smooth' })

const initReferences = async () => {
  await nextTick()
  if (!scrollContainer.value) return
  await waitForImages(scrollContainer.value)
  updateScrollButtons()
}

// ── watchers ──────────────────────────────────────────────
watch(partnersList, initPartners)
watch(mentorsList, initMentors)
watch(referencesList, initReferences)

watch(partnersContainer, (el) => {
  if (el) {
    initPartners()
    resizeObserver.value?.observe(el)
  }
})

watch(mentorsContainer, (el) => {
  if (el) {
    initMentors()
    resizeObserver.value?.observe(el)
  }
})

watch(scrollContainer, (el) => {
  if (el) {
    initReferences()
    resizeObserver.value?.observe(el)
  }
})

// ── init ──────────────────────────────────────────────────
onMounted(async () => {
  await initPartners()
  await initMentors()
  await initReferences()

  resizeObserver.value = new ResizeObserver(() => {
    updatePartnersScroll()
    updateMentorsScroll()
    updateScrollButtons()
  })

  if (partnersContainer.value) resizeObserver.value.observe(partnersContainer.value)
  if (mentorsContainer.value) resizeObserver.value.observe(mentorsContainer.value)
  if (scrollContainer.value) resizeObserver.value.observe(scrollContainer.value)
})

onUnmounted(() => {
  resizeObserver.value?.disconnect()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>