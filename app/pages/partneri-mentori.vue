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

    <!-- PARTNERS -->
    <section>
      <div class="flex items-center justify-between mb-10">
        <h2 class="text-3xl font-bold text-navy">
          {{ $t('partners_page.partners.title') }}
        </h2>

        <span class="text-sm text-gray-400 hidden md:block">
          {{ $t('partners_page.partners.subtitle') }}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UiPartnerCard
          v-for="(p, i) in partners"
          :key="i"
          v-bind="p"
        />
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
        <div
          class="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent z-10"
        ></div>
        <div
          class="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent z-10"
        ></div>

        <div class="overflow-hidden">
          <div
            ref="scrollContainer"
            class="flex gap-6 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory no-scrollbar"
          >
            <div
              v-for="(r, i) in references"
              :key="i"
              class="min-w-[280px] max-w-[320px] snap-start"
            >
              <UiReferenceCard v-bind="r" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useBanner } from '../composables/modules/content/banners/fetchBanner'
import { PageType } from '../composables/modules/content/enum/PageType'

useSeoMeta({
  title: 'Partneri a mentori | NTI',
  description:
    'Spoznajte našich partnerov a mentorov, ktorí podporujú náš projekt a pomáhajú rásť talentom v oblasti vývoja.',
  ogTitle: 'Partneri a mentori — NTI',
  ogDescription: 'Spoznajte našich partnerov a mentorov. Firmy, učitelia a odbornosti, ktoré tvoria komunitu NTI.',
  ogType: 'website',
  ogUrl: 'https://nti.sk/partneri-mentori',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Partneri a mentori — NTI',
  twitterDescription: 'Spoznajte našich partnerov a mentorov, ktorí podporujú talentov.',
})

const { banner } = useBanner(PageType.PARTNERS)

const scrollContainer = ref(null)

const scrollAmount = 320

const canScrollLeft = ref(false)
const canScrollRight = ref(true)

const updateScrollButtons = () => {
  if (!scrollContainer.value) return
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 1
}

const scrollLeft = () => {
  scrollContainer.value?.scrollBy({
    left: -scrollAmount,
    behavior: 'smooth',
  })
}

const scrollRight = () => {
  scrollContainer.value?.scrollBy({
    left: scrollAmount,
    behavior: 'smooth',
  })
}

onMounted(() => {
  updateScrollButtons()
  scrollContainer.value?.addEventListener('scroll', updateScrollButtons)
})

onUnmounted(() => {
  scrollContainer.value?.removeEventListener('scroll', updateScrollButtons)
})

const partners = [
  {
    image: '/test_logo.png',
    alt: 'Partner 1',
    name: 'Partner Firm 1',
    description: 'Leading company in digital solutions helping startups grow globally.',
  },
  {
    image: '/test_logo.png',
    alt: 'Partner 2',
    name: 'Partner Firm 2',
    description: 'Experts in design and marketing strategies.',
  },
  {
    image: '/test_logo.png',
    alt: 'Partner 3',
    name: 'Partner Firm 3',
    description: 'Software development company delivering scalable solutions.',
  },
  {
    image: '/test_logo.png',
    alt: 'Partner 4',
    name: 'Partner Firm 4',
    description: 'Consulting firm focused on growth.',
  },
]

const mentors = [
  { image: '/team/person1.jpg', name: 'Alex Novak', role: 'Lead Designer' },
  { image: '/team/person2.jpg', name: 'Jane Doe', role: 'Frontend Developer' },
  { image: '/team/person3.jpg', name: 'John Smith', role: 'Project Manager' },
  { image: '/team/person4.jpg', name: 'Maria Ivanova', role: 'UX Designer' },
]

const references = [
  {
    image: '/team/person1.jpg',
    name: 'Peter Horváth',
    role: 'CEO Partner Firm 1',
    quote: 'NTI nám pomohlo nájsť talentovaných dizajnérov.',
  },
  {
    image: '/team/person2.jpg',
    name: 'Mária Nováková',
    role: 'Lead Designer',
    quote: 'Spolupráca s mentorom bola veľmi prínosná.',
  },
  {
    image: '/team/person3.jpg',
    name: 'Ján Kováč',
    role: 'Project Manager',
    quote: 'Odporúčam NTI ako spoľahlivú platformu.',
  },
  {
    image: '/team/person3.jpg',
    name: 'Ján Kováč',
    role: 'Project Manager',
    quote: 'Odporúčam NTI ako spoľahlivú platformu.',
  },
  {
    image: '/team/person3.jpg',
    name: 'Ján Kováč',
    role: 'Project Manager',
    quote: 'Odporúčam NTI ako spoľahlivú platformu.',
  },
  {
    image: '/team/person3.jpg',
    name: 'Ján Kováč',
    role: 'Project Manager',
    quote: 'Odporúčam NTI ako spoľahlivú platformu.',
  },
  {
    image: '/team/person3.jpg',
    name: 'Ján Kováč',
    role: 'Project Manager',
    quote: 'Odporúčam NTI ako spoľahlivú platformu.',
  },
]
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
