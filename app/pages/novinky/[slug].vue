<template>
  <section class="mt-20 bg-white py-16 sm:py-20 md:py-24 px-6 md:px-20 rounded-2xl shadow-xl">
    <div class="mx-auto flex flex-col">
      <div class="mb-6">
        <UiBreadcrumbs :items="[{ label: 'Novinky', to: '/novinky' }, { label: `${newsDetail?.news_translations?.[0]?.title}` }]" />
      </div>

      <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-navy mb-6">{{ newsDetail?.news_translations?.[0]?.title }}</h1>

      <p class="text-sm text-blue-600 font-semibold mb-3 inline-block">
        {{ newsDetail?.category?.slug.charAt(0).toUpperCase() + newsDetail?.category?.slug.slice(1) }}
    </p>

      <p class="text-sm sm:text-base text-gray-400 mb-8">{{ $t('news.publicated') }}: {{ new Date(newsDetail?.created_at).toLocaleDateString('sk-SK') }}</p>

      <div class="w-full max-h-125 lg:max-h-225 overflow-hidden rounded-lg">
        <img
          :image="newsDetail?.image_url"
          class="w-full h-full object-cover rounded-lg"
          :alt="newsDetail?.news_translations?.[0]?.title"
        />
      </div>

      <div class="w-full h-1 bg-gray-300 my-6"></div>

      <div class="text-justify font-sans text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed">
         {{ newsDetail?.news_translations?.[0].description }}
      </div>

      <div class="w-full h-1 bg-gray-300 my-6"></div>

      <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy mb-6">{{ $t('news.more_news') }}</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
  </section>
</template>

<script setup>
import { fetchInfinite } from '../../composables/modules/content/news/fetchInfinite';
import { fetchBySlug } from '../../composables/modules/content/news/fetchBySlug';
useSeoMeta({
  title: 'Novinky a články | NTI',
  description: 'Čítajte najnovšie články a novinky z komunity NTI.',
  ogTitle: 'Novinky — NTI',
  ogDescription: 'Najnovšie články a novinky z komunity Nitrianského technického inkubátora.',
  ogType: 'article',
  ogUrl: 'https://nti.sk/novinky',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Novinky — NTI',
  twitterDescription: 'Čítajte novinky a články z komunity NTI.',
})
const route = useRoute()
const slug = route.params.slug
const { newsDetail } = fetchBySlug(slug)

  const { articles, loading, hasMore, loadMore, refresh } = fetchInfinite()
</script>
