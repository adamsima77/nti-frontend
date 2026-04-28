<template>
  <div class="max-w-7xl mx-auto px-4 py-20 md:px-6 md:py-16 space-y-20">
    <!-- HERO -->
    <div class="relative bg-blue-500 overflow-hidden rounded-lg shadow-2xl">
      <div
        class="absolute inset-0 bg-gradient-to-b from-blue-500/70 to-blue-700/70 mix-blend-multiply pointer-events-none"
      ></div>

      <div class="relative max-w-3xl mx-auto text-center text-white py-10 sm:py-12 md:py-16 px-4 md:px-8">
        <h2 class="text-3xl sm:text-4xl md:text-4xl font-extrabold mb-2">
          {{ banner?.hero_banner_translations?.[0]?.title }}
        </h2>
        <p class="text-sm sm:text-base md:text-lg leading-relaxed">
          {{ banner?.hero_banner_translations?.[0]?.description }}
        </p>
      </div>
    </div>

   <section>
  <div class="flex items-center justify-between mb-10">
    <h2 class="text-3xl font-bold text-navy">
      {{ $t('partners_page.partners.title') }}
    </h2>

    <div class="flex items-center gap-2">
      <button
        @click="scrollPartnersLeft"
        :disabled="!canScrollPartnersLeft"
        class="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <LucideChevronLeft class="w-5 h-5" />
      </button>

      <button
        @click="scrollPartnersRight"
        :disabled="!canScrollPartnersRight"
        class="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <LucideChevronRight class="w-5 h-5" />
      </button>
    </div>
  </div>

  <div class="relative">
    <div class="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent z-10"></div>
    <div class="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent z-10"></div>

    <div class="overflow-hidden">
      <div
        ref="partnersContainer"
        class="flex gap-6 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory no-scrollbar"
      >
        <div
          v-for="(p, i) in partnersList"
          :key="i"
          class="min-w-[280px] max-w-[320px] snap-start"
        >
          <UiPartnerCard
            :name="p?.partner_translations?.[0]?.name"
            :alt="p?.partner_translations?.[0]?.name"
            :image="p?.image_url"
            :description="p?.partner_translations?.[0]?.description"
          />
        </div>

       <div v-if="isFetching" class="min-w-[280px] max-w-[320px] flex items-center justify-center">
            <UiLoader />
      </div>
      </div>
    </div>
  </div>
</section>

    <!-- MENTORS -->
    <section>
      <div class="flex items-center justify-between mb-10">
        <h2 class="text-3xl font-bold text-navy">
          {{ $t('partners_page.mentors.title') }}
        </h2>

        <span class="text-sm text-gray-400 hidden md:block">
          {{ $t('partners_page.mentors.subtitle') }}
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <UiTeamCard
          v-for="(m, i) in mentors"
          :key="i"
          v-bind="m"
        />
      </div>
    </section>

    <!-- REFERENCES -->
  <section>
  <div class="flex items-center justify-between mb-10">
    <h2 class="text-3xl font-bold text-navy">
      {{ $t('partners_page.references.title') }}
    </h2>
    <div class="flex items-center gap-2">
      <button
        @click="scrollLeft"
        :disabled="!canScrollLeft"
        class="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <LucideChevronLeft class="w-5 h-5" />
      </button>
      <button
        @click="scrollRight"
        :disabled="!canScrollRight"
        class="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <LucideChevronRight class="w-5 h-5" />
      </button>
    </div>
  </div>

  <div class="relative">
    <div class="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent z-10"></div>
    <div class="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent z-10"></div>

    <div class="overflow-hidden">
      <div
        ref="scrollContainer"
       class="flex items-stretch gap-6 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory no-scrollbar"
      >
        <div
          v-for="(r, i) in referencesList"
          :key="i"
          class="min-w-[280px] max-w-[320px] snap-start flex flex-col"
        >
          <UiReferenceCard 
             class="h-full"
            :name="r?.partner_reference_translations?.[0]?.name"
            :job_position="r?.partner_reference_translations?.[0]?.job_position"
            :quote="r?.partner_reference_translations?.[0]?.description"
            :image="r?.image_url"/>
        </div>

        <div v-if="referencesFetching" class="min-w-[280px] max-w-[320px] flex items-center justify-center">
          <UiLoader />
        </div>
      </div>
    </div>
  </div>
</section>
  </div>
</template>

<script setup>
import{ ref, onMounted, onUnmounted } from 'vue'
import { useBanner } from '../composables/modules/content/banners/fetchBanner'
import { PageType } from '../composables/modules/content/enum/PageType'
import { fetchPartnersi } from '../composables/modules/content/partners/fetchPartnersi'
import { fetchReferences } from '../composables/modules/content/references/fethReferences'
useSeoMeta({
  title: 'Partneri a mentori | NTI',
  description: 'Spoznajte našich partnerov a mentorov, ktorí podporujú náš projekt a pomáhajú rásť talentom v oblasti vývoja.',
  ogTitle: 'Partneri a mentori — NTI',
  ogDescription: 'Spoznajte našich partnerov a mentorov. Firmy, učitelia a odbornosti, ktoré tvoria komunitu NTI.',
  ogType: 'website',
  ogUrl: 'https://nti.sk/partneri-mentori',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Partneri a mentori — NTI',
  twitterDescription: 'Spoznajte našich partnerov a mentorov, ktorí podporujú talentov.',
})

const { banner } = useBanner(PageType.PARTNERS)
const { partnersList, isFetching, fetchNextPage } = fetchPartnersi()
const { referencesList, isFetching: referencesFetching, fetchNextPage: fetchNextReference } = fetchReferences()
// ── partners slider ──────────────────────────────────────
const partnersContainer = ref(null)
const canScrollPartnersLeft = ref(false)
const canScrollPartnersRight = ref(true)
const scrollAmount = 320

const updatePartnersScroll = () => {
  if (!partnersContainer.value) return
  const { scrollLeft, scrollWidth, clientWidth } = partnersContainer.value
  canScrollPartnersLeft.value = scrollLeft > 0
  canScrollPartnersRight.value = scrollLeft + clientWidth < scrollWidth - 1
  if (scrollWidth - scrollLeft - clientWidth < 100) fetchNextPage()
}

const scrollPartnersLeft = () => partnersContainer.value?.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
const scrollPartnersRight = () => partnersContainer.value?.scrollBy({ left: scrollAmount, behavior: 'smooth' })

const scrollContainer = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

const updateScrollButtons = () => {
  if (!scrollContainer.value) return
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 1
  if (scrollWidth - scrollLeft - clientWidth < 100) fetchNextReference()
}

const scrollLeft = () => scrollContainer.value?.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
const scrollRight = () => scrollContainer.value?.scrollBy({ left: scrollAmount, behavior: 'smooth' })

onMounted(() => {
  updateScrollButtons()
  scrollContainer.value?.addEventListener('scroll', updateScrollButtons)
  updatePartnersScroll()
  partnersContainer.value?.addEventListener('scroll', updatePartnersScroll)
})

onUnmounted(() => {
  scrollContainer.value?.removeEventListener('scroll', updateScrollButtons)
  partnersContainer.value?.removeEventListener('scroll', updatePartnersScroll)
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
