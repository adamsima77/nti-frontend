<template>
  <UiHero
      :title="banner?.hero_banner_translations?.[0]?.title"
      :description="banner?.hero_banner_translations?.[0]?.description"
  ></UiHero>

  <div
    id="programs"
    class="mt-20 px-6 md:px-0 flex flex-col"
  >
    <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold text-navy mb-12 text-center md:text-left">
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

  <section class="mt-16 mb-20 px-6 md:px-0">
    <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold text-navy mb-12 text-center md:text-left">
      {{ $t('home.partners_header') }}
    </h2>
    <div
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 justify-items-center md:justify-items-start gap-6 sm:gap-8 md:gap-10"
    >
      <img
        src="/test_logo.png"
        alt="Partner 1"
        class="h-16 sm:h-18 md:h-20 filter grayscale hover:grayscale-0 transition duration-300"
      />
      <img
        src="/test_logo.png"
        alt="Partner 2"
        class="h-16 sm:h-18 md:h-20 filter grayscale hover:grayscale-0 transition duration-300"
      />
      <img
        src="/test_logo.png"
        alt="Partner 3"
        class="h-16 sm:h-18 md:h-20 filter grayscale hover:grayscale-0 transition duration-300"
      />
      <img
        src="/test_logo.png"
        alt="Partner 4"
        class="h-16 sm:h-18 md:h-20 filter grayscale hover:grayscale-0 transition duration-300"
      />
    </div>
  </section>

  <div class="mb-20 mt-10 px-6 md:px-0">
    <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold text-navy mb-12 text-center md:text-left">
      {{ $t('home.news_header') }}
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <UiItem
        title="Novinka #1"
        description="Zaujímavé aktuality a tipy pre tvoj profesionálny rast."
        category="Tipy & Novinky"
        image="https://www.vegmania.sk/wp-content/uploads/2022/01/ovocie-750x750.jpg"
        alt="Novinka #1"
        link="#"
      />

      <UiItem
        title="Novinka #1"
        description="Zaujímavé aktuality a tipy pre tvoj profesionálny rast."
        category="Tipy & Novinky"
        image="https://www.vegmania.sk/wp-content/uploads/2022/01/ovocie-750x750.jpg"
        alt="Novinka #1"
        link="#"
      />
      <UiItem
        title="Novinka #1"
        description="Zaujímavé aktuality a tipy pre tvoj profesionálny rast."
        category="Tipy & Novinky"
        image="https://www.vegmania.sk/wp-content/uploads/2022/01/ovocie-750x750.jpg"
        alt="Novinka #1"
        link="#"
      />
      <UiItem
        title="Novinka #1"
        description="Zaujímavé aktuality a tipy pre tvoj profesionálny rast."
        category="Tipy & Novinky"
        image="https://www.vegmania.sk/wp-content/uploads/2022/01/ovocie-750x750.jpg"
        alt="Novinka #1"
        link="#"
      />
    </div>
  </div>

  
</template>

<script setup>
import { useBanner } from '../composables/modules/content/banners/fetchBanner'
import { PageType } from '../composables/modules/content/enum/PageType'
useSeoMeta({
  title: 'Domov | NTI',
  description:
    'Budujeme komunitu talentovaných ľudí v oblasti dizajnu, vývoja a podnikania. Objav mentorov, partnerov a príležitosti na rast.',
  ogTitle: 'NTI — Komunita pre talentov',
  ogDescription:
    'Budujeme komunitu talentovaných ľudí v oblasti dizajnu, vývoja a podnikania. Objav program A, program B a komunitu.',
  ogType: 'website',
  ogUrl: 'https://nti.sk/',
  twitterCard: 'summary_large_image',
  twitterTitle: 'NTI — Komunita pre talentov',
  twitterDescription:
    'Budujeme komunitu talentovaných ľudí. Zúzasti sa na Program A alebo Program B a rast spolu s námi.',
})
const localePath = useLocalePath()
const { t } = useI18n() 
const { tm, rt } = useI18n()
const { banner } = useBanner(PageType.HOME)
const programLinks = ['/program-a', '/program-b']
</script>
