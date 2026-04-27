<template>
  <section class="mt-20 bg-white py-16 sm:py-20 md:py-24 px-6 md:px-20 rounded-2xl shadow-xl">
    <UiMainArticle
      :image="article?.image_url"
      :alt="main_article?.news_translations?.[0]?.title"
      :title="main_article?.news_translations?.[0]?.title"
      :category="main_article?.category?.slug.charAt(0).toUpperCase() + main_article?.category?.slug.slice(1)"
      :description="main_article?.news_translations?.[0]?.description"
      :link="`/novinky/${main_article?.slug}`"
    />

    <div class="mb-20 mt-10 px-6 md:px-0">
      <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold text-navy mb-12 text-center md:text-left">
        {{ $t('news.more_news') }}
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
       <UiItem
          v-for="article in other_articles"
          :key="article.id"
          :title="article?.news_translations?.[0]?.title"
          :description="article?.news_translations?.[0]?.description"
          :category="article?.category?.slug.charAt(0).toUpperCase() + article.category?.slug.slice(1)"
          :image="article?.image_url"
          :alt="article.news_translations?.[0]?.title"
          :link="`/novinky/${article.slug}`"
        />
      </div>
    <UiPagination
    :current-page="currentPage"
    :total-pages="totalPages"
    @update:current-page="currentPage = $event"
    class = "justify-center mt-20"
    />
    </div>
    
  </section>
</template>

<script setup>
import { useNews } from '../../composables/modules/content/news/fetchNews'
useSeoMeta({
  title: 'Novinky | NTI',
  description:
    'Sleduj najnovšie novinky, udalosti a aktuality z komunity NTI. Objav nové príležitosti, projekty a inšpirácie zo sveta dizajnu, vývoja a podnikania.',
})

const { news, currentPage } = useNews()
const main_article = computed(() => news.value?.data?.[0] ?? null)
const other_articles = computed(() => news.value?.data?.slice(1) ?? [])
const totalPages = computed(() => news.value?.last_page ?? 1)
</script>
