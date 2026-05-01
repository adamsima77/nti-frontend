<template>
  <UiHero
    :title="banner?.hero_banner_translations?.[0]?.title"
    :description="banner?.hero_banner_translations?.[0]?.description"
  />

  <!-- PROGRAMS -->
  <div id="programs" class="mt-20 px-6 md:px-0 flex flex-col">
    <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy mb-12 text-center md:text-left">
      {{ $t('home.program_header') }}
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <UiProgramCard
        v-for="(item, index) in programs"
        :key="index"
        :title="item?.program_translations?.[0].name"
        :description="item?.program_translations?.[0].description"
        :link="localePath(item.type_of_program_id === 1 ? '/program-a' : '/program-b')"
      />
    </div>
  </div>

  <!-- PARTNERS -->
<section class="mt-16 mb-20 px-6 md:px-0">

  <!-- HEADER -->
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

  <!-- SCROLLER -->
  <div
    ref="partnersScrollContainer"
    class="flex flex-nowrap gap-8 overflow-x-auto scroll-smooth no-scrollbar"
    @scroll="onPartnersScroll"
  >
    <div
      v-for="(item, index) in partners"
      :key="index"
      class="min-w-[140px] flex-shrink-0 flex justify-center"
    >
      <img
         :src="item?.image_url"
         :alt="item?.name ?? 'Partner'"
         class="h-16 md:h-20 grayscale hover:grayscale-0 transition"
      />
    </div>
  </div>


</section>
  <!-- NEWS -->
  <div class="mb-12">

    <!-- HEADER -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy">
        {{ $t('news.more_news') }}
      </h2>

      <div class="flex items-center gap-2">
        <button
          @click="scrollLeft"
          :disabled="!canScrollLeft"
          class="w-9 h-9 flex items-center justify-center rounded-full  bg-white shadow-sm disabled:opacity-40"
        >
          <LucideChevronLeft class="w-5 h-5" />
        </button>

        <button
          @click="scrollRight"
          :disabled="!canScrollRight"
          class="w-9 h-9 flex items-center justify-center rounded-full  bg-white shadow-sm disabled:opacity-40"
        >
          <LucideChevronRight class="w-5 h-5" />
        </button>

        <div v-if = "partnersPending">
              <UiLoader />
        </div>
      </div>
    </div>

    <!-- SCROLLER -->
    <div
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

  </div>
</template>
<script setup lang = "ts">
import { useBanner } from '../composables/modules/content/banners/fetchBanner'
import { PageType } from '../composables/modules/content/enum/PageType'
import { fetchInfinite } from '../composables/modules/content/news/fetchInfinite'
import { fetchPartners } from '../composables/modules/content/partners/fetchPartners'
import { fetchMeta } from '../composables/modules/content/meta_tags/fetchMetaByPageLang'
import { fetchProgramsByLang } from '../composables/modules/programs/fetchProgramsByLang'

const { programs } = fetchProgramsByLang()

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

const { banner } = useBanner(PageType.HOME)
const programLinks = ['/program-a', '/program-b']

const { partners, pending: partnersPending } = fetchPartners()

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