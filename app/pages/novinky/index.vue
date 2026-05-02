<template>
  <section class="mt-20 bg-white py-16 sm:py-20 md:py-24 px-6 md:px-20 rounded-2xl shadow-xl">

   
    <template v-if="!news_pending">
      <UiMainArticle
        :image="main_article?.image_url"
        :alt="main_article?.news_translations?.[0]?.title"
        :title="main_article?.news_translations?.[0]?.title"
        :category="main_article?.category?.slug
          ? main_article?.category?.slug.charAt(0).toUpperCase() + main_article?.category?.slug.slice(1)
          : ''"
        :description="main_article?.news_translations?.[0]?.description"
        :link="`/novinky/${main_article?.slug}`"
      />
    </template>

  
<template v-else>
  <div
    class="grid md:grid-cols-2 gap-8 mb-20 bg-gray-50 rounded-2xl overflow-hidden shadow-[0_-10px_30px_rgba(0,0,0,0.08),0_10px_30px_rgba(0,0,0,0.08)]"
  >

    
   <div class="w-full aspect-[16/9] rounded-2xl overflow-hidden">
 
</div>

  
    <div class="flex flex-col justify-center p-6 sm:p-8 md:p-10 space-y-5">

      <div class="space-y-3">
        <UiSkeleton height="2.8rem" width="90%" />
        <UiSkeleton height="2.8rem" width="70%" />
      </div>

      <UiSkeleton height="1rem" width="22%" />

      <div class="space-y-2">
        <UiSkeleton height="1.1rem" width="95%" />
        <UiSkeleton height="1.1rem" width="92%" />
        <UiSkeleton height="1.1rem" width="88%" />
        <UiSkeleton height="1.1rem" width="82%" />
      </div>

      <UiSkeleton height="2.5rem" width="150px" />

    </div>

  </div>
</template>

    
    <div class="mb-20 mt-10 px-6 md:px-0">

      <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold text-navy mb-12 text-center md:text-left">
        {{ $t('news.more_news') }}
      </h2>

      <!-- GRID -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <!-- LOADED -->
        <template v-if="!news_pending">
          <UiItem
            v-for="article in other_articles"
            :key="article.id"
            :title="article?.news_translations?.[0]?.title"
            :description="article?.news_translations?.[0]?.description"
            :category="article?.category?.slug
              ? article.category.slug.charAt(0).toUpperCase() + article.category.slug.slice(1)
              : ''"
            :image="article?.image_url"
            :alt="article?.news_translations?.[0]?.title"
            :link="`/novinky/${article.slug}`"
          />
        </template>

      
        <template v-else>
          <div
            v-for="i in 4"
            :key="'news-skeleton-' + i"
            class="bg-white rounded-2xl shadow p-5 space-y-4"
          >
            <UiSkeleton variant="rect" class="h-40 w-full rounded-lg" />
            <UiSkeleton height="0.9rem" width="40%" />
            <UiSkeleton height="1.2rem" width="85%" />
            <UiSkeleton height="0.9rem" width="95%" />
            <UiSkeleton height="0.9rem" width="90%" />
          </div>
        </template>

      </div>

      
      <UiPagination
        v-if="!news_pending"
        :current-page="currentPage"
        :total-pages="totalPages"
        @update:current-page="currentPage = $event"
        class="justify-center mt-20"
      />

    </div>
  </section>
</template>

<script setup>
import { useNews } from '../../composables/modules/content/news/fetchNews'
import { PageType } from '../../composables/modules/content/enum/PageType'
import { fetchMeta } from '../../composables/modules/content/meta_tags/fetchMetaByPageLang'

const { metaTags } = fetchMeta(PageType.NEWS)
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


const { news, currentPage, pending: news_pending } = useNews()
const main_article = computed(() => news.value?.data?.[0] ?? null)
const other_articles = computed(() => news.value?.data?.slice(1) ?? [])
const totalPages = computed(() => news.value?.last_page ?? 1)

watch(currentPage, async () => {
  await nextTick()

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
})
</script>
