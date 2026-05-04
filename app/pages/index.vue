<template>
  <!-- HERO -->
  <template v-if="pending || !banner">
  <div
    class="relative mt-30 bg-blue-500 text-white py-24 sm:py-28 md:py-32 px-6 md:px-20 overflow-hidden rounded-lg shadow-2xl"
  >
    <div class="relative z-10 md:flex md:items-center md:justify-between gap-12">
      
      <!-- LEFT -->
      <div class="md:w-1/2 space-y-6">
        <UiSkeleton height="3.5rem" width="90%" />
        <div class="space-y-3">
          <UiSkeleton height="1.2rem" width="95%" />
          <UiSkeleton height="1.2rem" width="90%" />
          <UiSkeleton height="1.2rem" width="85%" />
        </div>
        <div class="flex flex-col md:flex-row gap-4 mt-6 sm:mt-8">
          <UiSkeleton variant="rect" height="3.5rem" width="160px" />
          <UiSkeleton variant="rect" height="3.5rem" width="160px" />
        </div>
      </div>

      <!-- RIGHT -->
      <div class="md:w-1/2 relative flex justify-center md:justify-end mt-10 md:mt-0">
        <UiSkeleton
          variant="rect"
          class="w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 rounded-full"
        />
      </div>

    </div>
  </div>
</template>

<template v-else>
  <UiHero
    :title="banner?.hero_banner_translations?.[0]?.title"
    :description="banner?.hero_banner_translations?.[0]?.description"
  />
</template>

  <!-- PROGRAMS -->
  <div id="programs" class="mt-20 px-6 md:px-0 flex flex-col">
    <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy mb-12 text-center md:text-left">
      {{ $t('home.program_header') }}
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <template v-if="programs?.length && !programs_pending">
        <UiProgramCard
          v-for="(item, index) in programs"
          :key="index"
          :title="item?.program_translations?.[0]?.name"
          :description="item?.program_translations?.[0]?.description"
          :link="localePath(item?.type_of_program_id === 1 ? '/program-a' : '/program-b')"
        />
      </template>
     <template v-else>
  <div
    v-for="i in 2"
    :key="'skeleton-program-' + i"
    class="bg-white rounded-2xl shadow-xl p-8 sm:p-10 flex flex-col h-full gap-4"
  >
    <UiSkeleton height="1.75rem" width="60%" />

    <div class="flex flex-col gap-2 flex-1">
      <UiSkeleton height="1rem" width="95%" />
      <UiSkeleton height="1rem" width="90%" />
      <UiSkeleton height="1rem" width="85%" />
    </div>

    <UiSkeleton variant="rect" height="2.5rem" width="140px" />
  </div>
</template>
    </div>
  </div>

  <!-- PARTNERS -->
  <section class="mt-16 mb-20 px-6 md:px-0">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy">
      {{ $t('home.partners_header') }}
    </h2>

    <div class="flex items-center gap-2">
      <button
        @click="partnersScrollLeft"
        :disabled="!partnersCanScrollLeft"
        class="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm disabled:opacity-40"
      >
        <LucideChevronLeft class="w-5 h-5" />
      </button>

      <button
        @click="partnersScrollRight"
        :disabled="!partnersCanScrollRight"
        class="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm disabled:opacity-40"
      >
        <LucideChevronRight class="w-5 h-5" />
      </button>
    </div>
  </div>

  <!-- LOADED -->
  <div
    v-if="partners?.data?.length && !partner_pending"
    ref="partnersScrollContainer"
    class="flex flex-nowrap gap-8 overflow-x-auto scroll-smooth no-scrollbar"
    @scroll="onPartnersScroll"
  >
    <div
      v-for="(item, index) in partners.data"
      :key="index"
      class="min-w-[140px] flex-shrink-0 flex justify-center items-center"
    >
      <img
        v-if="item?.image_url"
        :src="item.image_url"
        :alt="item?.partner_translations?.[0]?.name ?? 'Partner'"
        class="h-16 md:h-20 grayscale hover:grayscale-0 transition"
      />

      <div
        v-else
        class="h-16 md:h-20 w-32 flex items-center justify-center text-sm text-gray-400 font-medium"
      >
        {{ item?.partner_translations?.[0]?.name ?? 'No name' }}
      </div>
    </div>
  </div>

  <!-- SKELETON -->
  <ClientOnly v-else>
    <div class="flex gap-8 overflow-x-auto no-scrollbar items-center py-2">
      <div
        v-for="i in 8"
        :key="'skeleton-partner-' + i"
        class="flex-shrink-0"
      >
        <div
          class="w-28 h-16 md:w-32 md:h-20 rounded-xl bg-gray-100 animate-pulse flex items-center justify-center"
        />
      </div>
    </div>
  </ClientOnly>
</section>

  <!-- NEWS -->
  <div class="mb-12">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy">
        {{ $t('news.more_news') }}
      </h2>
      <div class="flex items-center gap-2">
        <button
          @click="scrollLeft"
          :disabled="!canScrollLeft"
          class="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm disabled:opacity-40"
        >
          <LucideChevronLeft class="w-5 h-5" />
        </button>
        <button
          @click="scrollRight"
          :disabled="!canScrollRight"
          class="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm disabled:opacity-40"
        >
          <LucideChevronRight class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- articles loaded -->
    <div
      v-if="home_articles.length"
      ref="scrollContainer"
      class="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
      @scroll="onScroll"
    >
      <div
        v-for="article in home_articles"
        :key="article.id"
        class="min-w-[280px] max-w-[320px] snap-start flex-shrink-0"
      >
        <UiItem
          :title="article.news_translations?.[0]?.title"
          :description="article.news_translations?.[0]?.description"
          :category="article.category?.slug ? capitalize(article.category.slug) : ''"
          :image="article.news_translations?.[0]?.image_url"
          :alt="article.news_translations?.[0]?.title"
          :link="`/novinky/${article.slug}`"
        />
      </div>
      <div v-if="loading" class="min-w-[280px] flex items-center justify-center">
        <UiLoader />
      </div>
    </div>

    <!-- articles skeleton — ClientOnly avoids hydration mismatch -->
    <ClientOnly v-else>
  <div class="flex gap-6 overflow-x-auto no-scrollbar">
    <div
      v-for="i in 4"
      :key="'skeleton-article-' + i"
      class="min-w-[280px] max-w-[320px] flex-shrink-0"
    >
      <div class="bg-gray-50 rounded-2xl shadow-[0_-8px_20px_rgba(0,0,0,0.06),0_8px_20px_rgba(0,0,0,0.06)] p-6 sm:p-8 flex flex-col gap-4">

        <!-- IMAGE -->
        <UiSkeleton variant="rect" height="11rem" class="rounded-lg" />

        <!-- CATEGORY -->
        <UiSkeleton height="0.9rem" width="40%" />

        <!-- TITLE -->
        <UiSkeleton height="1.3rem" width="85%" />

        <!-- DESCRIPTION -->
        <div class="flex flex-col gap-2">
          <UiSkeleton height="0.9rem" width="95%" />
          <UiSkeleton height="0.9rem" width="90%" />
        </div>

        <!-- CTA -->
        <UiSkeleton height="1rem" width="40%" />

      </div>
    </div>
  </div>
</ClientOnly>
  </div>
</template>
<script setup lang = "ts">
import { useBanner } from '../composables/modules/content/banners/fetchBanner'
import { PageType } from '../composables/modules/content/enum/PageType'
import { fetchInfinite } from '../composables/modules/content/news/fetchInfinite'
import { fetchPartners } from '../composables/modules/content/partners/fetchPartners'
import { fetchMeta } from '../composables/modules/content/meta_tags/fetchMetaByPageLang'
import { fetchProgramsByLang } from '../composables/modules/programs/fetchProgramsByLang'

const { programs, programs_pending } = fetchProgramsByLang()

const { metaTags } = fetchMeta(PageType.HOME)

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

const localePath = useLocalePath()
const { tm, rt } = useI18n()

const { banner, pending } = useBanner(PageType.HOME)
const programLinks = ['/program-a', '/program-b']

const { partners, currentPage, partner_pending } = fetchPartners()

const { articles, loading, hasMore, loadMore } = fetchInfinite()

const scrollContainer = ref(null)
const partnersScrollContainer = ref(null)

const home_articles = computed(() => articles.value ?? [])

const scrollAmount = 320

// NEWS
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

// PARTNERS
const partnersCanScrollLeft = ref(false)
const partnersCanScrollRight = ref(true)

/* ---------------- NEWS ---------------- */

const updateScrollButtons = () => {
  const el = scrollContainer.value
  if (!el) return

  const left = el.scrollLeft
  const right = el.scrollLeft + el.clientWidth
  const max = el.scrollWidth

  canScrollLeft.value = left > 0
  canScrollRight.value = right < max - 1
}

const onScroll = () => {
  const el = scrollContainer.value
  if (!el) return

  updateScrollButtons()

  if (!hasMore.value || loading.value) return

  const scrolled = (el.scrollLeft + el.clientWidth) / el.scrollWidth

  if (scrolled >= 0.8) loadMore()
}

const scrollLeft = () => {
  scrollContainer.value?.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
}

const scrollRight = () => {
  scrollContainer.value?.scrollBy({ left: scrollAmount, behavior: 'smooth' })
}

/* ---------------- PARTNERS ---------------- */

const updatePartnersButtons = () => {
  const el = partnersScrollContainer.value
  if (!el) return

  const left = el.scrollLeft
  const right = el.scrollLeft + el.clientWidth
  const max = el.scrollWidth

  partnersCanScrollLeft.value = left > 0
  partnersCanScrollRight.value = right < max - 1
}

const onPartnersScroll = () => {
  updatePartnersButtons()
}

const partnersScrollLeft = () => {
  partnersScrollContainer.value?.scrollBy({
    left: -scrollAmount,
    behavior: 'smooth'
  })
}

const partnersScrollRight = () => {
  partnersScrollContainer.value?.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  })
}

const capitalize = (s = '') => s.charAt(0).toUpperCase() + s.slice(1)

const waitForImages = async (el: HTMLElement) => {
  const images = [...el.querySelectorAll('img')]
  await Promise.all(
    images
      .filter(img => !img.complete)
      .map(img => new Promise(resolve => {
        img.onload = resolve
        img.onerror = resolve
      }))
  )
}

onMounted(async () => {
  await nextTick()
  
  if (scrollContainer.value) {
    await waitForImages(scrollContainer.value)
    updateScrollButtons()
  }
  
  if (partnersScrollContainer.value) {
    await waitForImages(partnersScrollContainer.value)
    updatePartnersButtons()
  }
})

watch(home_articles, async () => {
  await nextTick()
  if (scrollContainer.value) {
    await waitForImages(scrollContainer.value)
    updateScrollButtons()
  }
})

watch(partners, async () => {
  await nextTick()
  if (partnersScrollContainer.value) {
    await waitForImages(partnersScrollContainer.value)
    updatePartnersButtons()
  }
})

watch(scrollContainer, async (el) => {
  if (!el) return
  await nextTick()
  await waitForImages(el)
  updateScrollButtons()
})

watch(partnersScrollContainer, async (el) => {
  if (!el) return
  await nextTick()
  await waitForImages(el)
  updatePartnersButtons()
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