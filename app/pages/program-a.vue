<template>
  <div>
    <!-- Hero sekcia -->
    <UiHero
      :title="banner?.hero_banner_translations?.[0]?.title"
      :description="banner?.hero_banner_translations?.[0]?.description"
    />

    <!-- Čo je Program A -->
    <section class="mt-20 px-6 md:px-20 py-16">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl font-bold text-navy mb-6">{{ $t('program-a.title') }}</h2>
        <p class="text-lg text-gray-600 leading-relaxed mb-8">
          {{ $t('program-a.description') }}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <UiInfoCard v-for = "(item,index) in tm('program-a.benefits')" :key = "index"
            :title="rt(item.title)"
            :description="rt(item.description)"
          />
        </div>
      </div>
    </section>

    <!-- Kto sa môže prihlásiť -->
    <section class="mt-16 px-6 md:px-20 py-16 bg-gray-50 rounded-lg">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl font-bold text-navy mb-8">{{ $t('program-a.signup_title') }}</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-xl font-bold text-blue-600 mb-4">{{ $t('program-a.signup_students.title') }}</h3>
            <ul class="space-y-3 text-gray-700">
              <li class="flex items-start gap-3" v-for = "(item, i) in tm('program-a.signup_students.list')" :key = "i">
                <CheckCircle class="w-5 h-5 text-success-500 flex-shrink-0 mt-1" />
                 <span>{{ rt(item) }}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-xl font-bold text-blue-600 mb-4">{{ $t('program-a.signup_juniors.title') }}</h3>
            <ul class="space-y-3 text-gray-700">
              <li class="flex items-start gap-3" v-for = "(item,i) in tm('program-a.signup_juniors.list')" :key = "i">
                <CheckCircle class="w-5 h-5 text-success-500 flex-shrink-0 mt-1" />
                <span>{{ rt(item) }}</span>
            </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Časový plán -->
    <section class="mt-20 px-6 md:px-20 py-16">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl font-bold text-navy mb-8">{{ $t('program-a.timeline.header') }}</h2>

        <div class="space-y-4">
          <div class="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
            <h3 class="font-bold text-blue-700 mb-2">📋 Prihlášky otvorené</h3>
            <p class="text-gray-700">1. január — 31. január 2026</p>
          </div>

          <div class="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
            <h3 class="font-bold text-yellow-700 mb-2">⏱️ Vyhodnocovanie prihlášok</h3>
            <p class="text-gray-700">1. február — 15. február 2026</p>
          </div>

          <div class="bg-success-50 border-l-4 border-success-500 p-6 rounded">
            <h3 class="font-bold text-success-700 mb-2">🚀 Program štartuje</h3>
            <p class="text-gray-700">1. apríl — 30. júl 2026</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="mt-20 px-6 md:px-20 py-16 bg-gray-50 rounded-lg">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl font-bold text-navy mb-12">{{ $t('program-a.faq.header') }}</h2>

        <div class="space-y-4">
          <div
            v-for="(i, idx) in faq"
            :key="idx"
            class="bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              @click="toggleFaq(idx)"
            >
              <span class="font-bold text-navy text-left"> {{ i?.frequently_asked_question_translations?.[0]?.question }}</span>
              <ChevronDown
                :class="{
                  'rotate-180': expandedFaq === idx,
                  'transition-transform duration-300': true,
                }"
                class="w-5 h-5 text-gray-500"
              />
            </button>

            <Transition name="fade">
              <div
                v-if="expandedFaq === idx"
                class="px-6 py-4 bg-gray-50 border-t text-gray-700"
              >
             {{ i?.frequently_asked_question_translations?.[0]?.answer }}
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="mt-20 mb-20 px-6 md:px-20 py-16">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold text-navy mb-6">{{ $t('program-a.cta.title') }}</h2>
        <p class="text-lg text-gray-600 mb-8">
          {{ $t('program-a.cta.description') }}
        </p>
        <NuxtLink
          :to="localePath('/auth/login')"
          class="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          {{ $t('program-a.cta.button') }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBanner } from '../composables/modules/content/banners/fetchBanner'
import { useFaq } from '../composables/modules/content/faq/fetchFaq'
import { PageType } from '../composables/modules/content/enum/PageType'
import { fetchMeta } from '../composables/modules/content/meta_tags/fetchMetaByPageLang'
const localePath = useLocalePath()
const { tm, rt } = useI18n()
definePageMeta({
  layout: 'default',
})

const { faq } = useFaq(PageType.PROGRAM_A)


const { metaTags } = fetchMeta(PageType.PROGRAM_A)
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

const { banner } = useBanner(PageType.PROGRAM_A)
const { t } = useI18n() 
const expandedFaq = ref(null)

const toggleFaq = (idx) => {
  expandedFaq.value = expandedFaq.value === idx ? null : idx
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
