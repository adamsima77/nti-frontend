<template>
  <section class="mt-20 bg-white py-16 sm:py-20 md:py-24 px-6 md:px-20 rounded-2xl shadow-xl overflow-x-hidden">
    <div class="mx-auto flex flex-col min-w-0">

      <!-- SKELETON -->
      <template v-if="pending || !newsDetail">

        <div class="mb-6">
          <UiSkeleton height="1rem" width="30%" />
        </div>

        <!-- title -->
        <UiSkeleton height="3.5rem" width="80%" class="mb-3" />
        <UiSkeleton height="3.5rem" width="60%" class="mb-6" />

        <!-- category -->
        <UiSkeleton height="0.9rem" width="10%" class="mb-3" />

        <!-- date -->
        <UiSkeleton height="0.9rem" width="20%" class="mb-8" />

        <!-- image -->
        <UiSkeleton variant="rect" class="w-full h-56 sm:h-72 md:h-96 lg:h-[450px] rounded-lg" />

        <div class="w-full h-1 bg-gray-300 my-6" />

        <!-- body -->
        <div class="flex flex-col gap-3">
          <UiSkeleton height="1.2rem" width="100%" />
          <UiSkeleton height="1.2rem" width="95%" />
          <UiSkeleton height="1.2rem" width="98%" />
          <UiSkeleton height="1.2rem" width="90%" />
          <UiSkeleton height="1.2rem" width="96%" />
          <UiSkeleton height="1.2rem" width="85%" />
        </div>

        <div class="w-full h-1 bg-gray-300 my-6" />

      </template>

      <!-- LOADED -->
      <template v-else>

        <div class="mb-6">
          <UiBreadcrumbs
            :items="[
              { label: $t('news.news'), to: localePath('/novinky') },
              { label: `${newsDetail?.news_translations?.[0]?.title}` },
            ]"
          />
        </div>

        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-navy mb-6">
          {{ newsDetail?.news_translations?.[0]?.title }}
        </h1>

        <p class="text-sm text-blue-600 font-semibold mb-3 inline-block">
        {{ newsDetail?.category?.category_translations?.[0]?.name }}
        </p>

        <p class="text-sm sm:text-base text-gray-400 mb-8">
          {{ $t('news.publicated') }}: {{ new Date(newsDetail?.created_at).toLocaleDateString('sk-SK') }}
        </p>

        <div v-if="newsDetail?.image_url" class="w-full h-56 sm:h-72 md:h-96 lg:h-[650px] overflow-hidden rounded-lg">
          <img
            :src="newsDetail?.image_url"
            class="w-full h-full object-cover rounded-lg"
            :alt="newsDetail?.news_translations?.[0]?.title"
          />
        </div>
        <div v-else class="w-full h-56 sm:h-72 md:h-96 lg:h-[650px] rounded-lg bg-slate-100 flex items-center justify-center text-sm text-slate-500">
          {{ $t ? $t('news.image_not_available') : 'Image not available' }}
        </div>

        <div class="w-full h-1 bg-gray-300 my-6" />

       <div 
  class="hugerte-content text-justify font-sans text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed" 
  v-html="newsDetail?.news_translations?.[0]?.description"
>
</div>

        <div class="w-full h-1 bg-gray-300 my-6" />

      </template>

      <!-- MORE NEWS — always visible -->
      <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy mb-6">
        {{ $t('news.more_news') }}
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UiItem
          v-for="article in otherArticles"
          :key="article.id"
          :title="article?.news_translations?.[0]?.title"
          :description="article?.news_translations?.[0]?.description"
          :category="article?.category?.category_translations?.[0]?.name"
          :image="article?.image_url"
          :alt="article?.news_translations?.[0]?.title"
          :link="localePath(`/novinky/${article.slug}`)"
          :main_description = "article?.news_translations?.[0]?.main_description"
        />
      </div>

      <div ref="scrollAnchor" class="mt-10 flex justify-center">
        <span v-if="loading" class="text-gray-400 text-sm animate-pulse">
          <UiLoader />
        </span>
      </div>

    </div>
  </section>
</template>

<script setup>
import { fetchInfinite } from '../../composables/modules/content/news/fetchInfinite'
import { fetchBySlug } from '../../composables/modules/content/news/fetchBySlug'
const localePath = useLocalePath()
const route = useRoute()
const slug = route.params.slug
const { newsDetail, pending } = fetchBySlug(slug)
const title = computed(() =>
  newsDetail.value?.news_translations?.[0]?.title || 'Novinky'
)
useSeoMeta({
  title: title,
  description: 'Čítajte najnovšie články a novinky z komunity NTI.',
  ogTitle: 'Novinky — NTI',
  ogDescription: 'Najnovšie články a novinky z komunity Nitrianského technického inkubátora.',
  ogType: 'article',
  ogUrl: 'https://nti.sk/novinky',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Novinky — NTI',
  twitterDescription: 'Čítajte novinky a články z komunity NTI.',
})



const { articles, loading, hasMore, loadMore } = fetchInfinite()

// Filter out the current article from the "more news" list
const otherArticles = computed(() =>
  articles.value?.filter((a) => a.slug !== slug) ?? []
)

// Auto-load more when the anchor scrolls into view
const scrollAnchor = ref(null)
onMounted(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && hasMore.value && !loading.value) {
        loadMore()
      }
    },
    { threshold: 0.1 }
  )
  if (scrollAnchor.value) observer.observe(scrollAnchor.value)
  onUnmounted(() => observer.disconnect())
})
</script>

<style>
/* ==========================================
   HugeRTE Rich Text Styles (Tailwind v4 Theme)
   ========================================== */

/* 1. Structural Layout & Typography */
.hugerte-content {
  font-family: var(--font-sans) !important;
  color: var(--color-text-primary) !important;
}

.hugerte-content p {
  margin-bottom: 1.25rem !important;
}

/* Headings matching your primary navy brand colors */
.hugerte-content h1, 
.hugerte-content h2, 
.hugerte-content h3, 
.hugerte-content h4 {
  font-family: var(--font-sans) !important;
  color: var(--color-navy) !important;
  font-weight: 800 !important;
  margin-top: 2rem !important;
  margin-bottom: 0.75rem !important;
}
.hugerte-content h1 { font-size: 2.25rem !important; line-height: 2.5rem !important; }
.hugerte-content h2 { font-size: 1.75rem !important; line-height: 2rem !important; }
.hugerte-content h3 { font-size: 1.5rem !important; line-height: 1.75rem !important; }

/* Inline Styles & formatting emphasis */
.hugerte-content strong, .hugerte-content b { font-weight: 800 !important; }
.hugerte-content em, .hugerte-content i { font-style: italic !important; }

/* 2. Hyperlinks (Matching your theme brand blue) */
.hugerte-content a {
  font-family: var(--font-sans) !important;
  color: var(--color-blue-600) !important;
  text-decoration: underline !important;
  text-underline-offset: 4px;
  font-weight: 600 !important;
  transition: color 0.2s ease-in-out;
}

.hugerte-content a:hover {
  color: var(--color-blue-700) !important;
}

/* 3. HTML Tables (Formatted cleanly using your borders & gray scales) */
.hugerte-content table {
  width: 100% !important;
  border-collapse: collapse !important;
  margin-top: 1.5rem !important;
  margin-bottom: 1.5rem !important;
  font-size: 0.95rem !important;
  background-color: var(--color-white) !important;
  border: 1px solid var(--color-border-primary) !important;
  border-radius: var(--radius-md) !important;
  overflow: hidden !important; /* Forces rounded corner consistency */
}

/* Table Headings */
.hugerte-content th {
  background-color: var(--color-gray-100) !important;
  color: var(--color-navy) !important;
  font-weight: 700 !important;
  text-align: left !important;
  padding: var(--spacing-3) var(--spacing-4) !important;
  border-bottom: 2px solid var(--color-border-primary) !important;
}

/* Table Body Cells */
.hugerte-content td {
  padding: var(--spacing-3) var(--spacing-4) !important;
  border-bottom: 1px solid var(--color-border-primary) !important;
  color: var(--color-text-secondary) !important;
}

/* Subtle row shading (Zebra striping) */
.hugerte-content tr:nth-child(even) {
  background-color: var(--color-gray-50) !important;
}

/* Ensure last row doesn't have an underline leaking past corners */
.hugerte-content tr:last-child td {
  border-bottom: none !important;
}

/* 4. Lists & Bullet Layouts */
.hugerte-content ul, .hugerte-content ol {
  padding-left: 2rem !important;
  margin-bottom: 1.25rem !important;
}
.hugerte-content ul { list-style-type: disc !important; }
.hugerte-content ol { list-style-type: decimal !important; }
.hugerte-content li { 
  margin-bottom: 0.5rem !important; 
  font-family: var(--font-sans) !important;
}

/* 5. Blockquotes (For highlighted editor callouts) */
.hugerte-content blockquote {
  border-left: 4px solid var(--color-blue-500) !important;
  background-color: var(--color-gray-50) !important;
  padding: var(--spacing-3) var(--spacing-4) !important;
  margin: 1.5rem 0 !important;
  font-style: italic !important;
  color: var(--color-text-secondary) !important;
}

/* 6. Text Realignment Mechanics */
.hugerte-content [style*="text-align: left"] { text-align: left !important; }
.hugerte-content [style*="text-align: center"] { text-align: center !important; }
.hugerte-content [style*="text-align: right"] { text-align: right !important; }
.hugerte-content [style*="text-align: justify"] { text-align: justify !important; }
</style>