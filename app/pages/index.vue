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
        v-for="(item, index) in tm('home.program_cards.cards')"
        :key="index"
        :title="rt(item.title)"
        :description="rt(item.description)"
        :link="localePath(programLinks[index])"
      />
    </div>
  </div>

  <!-- PARTNERS -->
  <section class="mt-16 mb-20 px-6 md:px-0">
    <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy mb-12 text-center md:text-left">
      {{ $t('home.partners_header') }}
    </h2>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
      <img src="/test_logo.png" class="h-16 md:h-20 grayscale hover:grayscale-0 transition" />
      <img src="/test_logo.png" class="h-16 md:h-20 grayscale hover:grayscale-0 transition" />
      <img src="/test_logo.png" class="h-16 md:h-20 grayscale hover:grayscale-0 transition" />
      <img src="/test_logo.png" class="h-16 md:h-20 grayscale hover:grayscale-0 transition" />
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
          class="w-9 h-9 flex items-center justify-center rounded-full border bg-white shadow-sm disabled:opacity-40"
        >
          <LucideChevronLeft class="w-5 h-5" />
        </button>

        <button
          @click="scrollRight"
          :disabled="!canScrollRight"
          class="w-9 h-9 flex items-center justify-center rounded-full border bg-white shadow-sm disabled:opacity-40"
        >
          <LucideChevronRight class="w-5 h-5" />
        </button>
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
          image="https://www.vegmania.sk/wp-content/uploads/2022/01/ovocie-750x750.jpg"
          :alt="article.news_translations?.[0]?.title"
          :link="`/novinky/${article.slug}`"
        />
      </div>

      <div v-if="loading" class="min-w-[280px] flex items-center justify-center">
        <span class="text-gray-400 text-sm">Načítavam...</span>
      </div>
    </div>

  </div>
</template>
<script setup>
import { useBanner } from '../composables/modules/content/banners/fetchBanner'
import { PageType } from '../composables/modules/content/enum/PageType'
import { fetchInfinite } from '../composables/modules/content/news/fetchInfinite'

const localePath = useLocalePath()
const { tm, rt } = useI18n()

const { banner } = useBanner(PageType.HOME)
const programLinks = ['/program-a', '/program-b']

const { articles, loading, hasMore, loadMore } = fetchInfinite()

const scrollContainer = ref(null)

const home_articles = computed(() => articles.value ?? [])

const scrollAmount = 320

const canScrollLeft = ref(false)
const canScrollRight = ref(true)

const updateScrollButtons = () => {
  const el = scrollContainer.value
  if (!el) return

  const left = el.scrollLeft
  const right = el.scrollLeft + el.clientWidth
  const max = el.scrollWidth

  canScrollLeft.value = left > 0
  canScrollRight.value = right < max - 1
}

watch(home_articles, async () => {
  await nextTick()
  updateScrollButtons()
})

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
  setTimeout(updateScrollButtons, 200)
}

const scrollRight = () => {
  scrollContainer.value?.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  setTimeout(updateScrollButtons, 200)
}

const capitalize = (s = '') => s.charAt(0).toUpperCase() + s.slice(1)

onMounted(async () => {
  await nextTick()
  updateScrollButtons()
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

