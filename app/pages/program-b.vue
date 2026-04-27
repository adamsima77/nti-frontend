<template>
  <div>
    <!-- Hero sekcia -->
    <UiHero
      :title="banner?.hero_banner_translations?.[0]?.title"
      :description="banner?.hero_banner_translations?.[0]?.description"
    />

    <!-- Čo je Program B -->
    <section class="mt-20 px-6 md:px-20 py-16">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl font-bold text-navy mb-6">
          {{ $t('program-b.title') }}
        </h2>

        <p class="text-lg text-gray-600 leading-relaxed mb-8">
           {{ $t('program-b.description') }}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <UiInfoCard v-for = "(item,index) in tm('program-b.benefits')" :key = "index"
            :title="rt(item.title)"
            :description="rt(item.description)"
          />
        </div>
      </div>
    </section>

    <!-- Ako to funguje -->
      <section class="mt-16 px-6 md:px-20 py-16 bg-gray-50 rounded-lg">
    <div class="max-w-4xl mx-auto">

      <h2 class="text-4xl font-bold text-navy mb-12">
        {{ $t('program-b.how_it_works_header') }}
      </h2>

      <div class="space-y-6">
        <div
          v-for="(item, index) in Object.values(tm('program-b.how_it_works_items'))"
          :key="index"
          class="flex gap-6"
        >
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white font-bold">
              {{ index + 1 }}
            </div>
          </div>

          <div>
            <h3 class="text-xl font-bold text-navy mb-2">
              {{ rt(item.title) }}
            </h3>
            <p class="text-gray-700">
              {{ rt(item.description) }}
            </p>
          </div>
        </div>

      </div>
    </div>
  </section>

    <!-- Čo potrebujete odoslať -->
    <section class="mt-20 px-6 md:px-20 py-16">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl font-bold text-navy mb-8">
          {{ $t('program-b.requirements_header') }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
            <h3 class="text-lg font-bold text-blue-700 mb-3">{{ $t('program-b.requirements_company_profile.title') }}</h3>
            <ul class="space-y-2 text-gray-700 text-sm">
              <li v-for = "(item,index) in tm('program-b.requirements_company_profile.items')" :key = index>
               ✓ {{ rt(item) }}
              </li>
             
            </ul>
          </div>

          <div class="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
            <h3 class="text-lg font-bold text-blue-700 mb-3">{{ $t('program-b.requirements_technical_spec.title') }}</h3>
            <ul class="space-y-2 text-gray-700 text-sm">
              <li v-for = "(item,index) in tm('program-b.requirements_technical_spec.items')" :key = "index">
                ✓ {{ rt(item) }}</li>
            </ul>
          </div>
        </div>

        <div class="mt-8 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <p class="text-gray-700">
            <strong>{{ $t('program-b.pro_tip') }}</strong> 
            {{ $t('program-b.requirements_tip') }}
          </p>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="mt-20 px-6 md:px-20 py-16 bg-gray-50 rounded-lg">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl font-bold text-navy mb-12">
          {{ $t('program-b.faq.header') }}
        </h2>

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
              <span class="font-bold text-navy text-left">{{ i?.frequently_asked_question_translations?.[0]?.question }}</span>
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
        <h2 class="text-4xl font-bold text-navy mb-6">
          {{ $t('program-b.cta.title') }}
        </h2>

        <p class="text-lg text-gray-600 mb-8">
          {{ $t('program-b.cta.description') }}
        </p>

        <NuxtLink
          :to="localePath('/auth/login')"
          class="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          {{ $t('program-b.cta.button') }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBanner } from '../composables/modules/content/banners/fetchBanner'
import { PageType } from '../composables/modules/content/enum/PageType'
import { useFaq } from '../composables/modules/content/faq/fetchFaq'
const localePath = useLocalePath()

definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'Program B — Inovácia za firemných výziev | NTI',
  description:
    'Program B spája firmy s talentovanými študentami a juniormi vývojármi. Riešte technické výzvy s inovatívnymi riešeniami.',
  ogTitle: 'Program B — Inovácia za firemných výziev',
  ogDescription:
    'Najímte talentované študentov a juniorov na riešenie svojich technických problémov. Pozrite si inovatívne riešenia.',
  ogType: 'website',
  ogUrl: 'https://nti.sk/program-b',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Program B — Inovácia za firemných výziev | NTI',
  twitterDescription: 'Spájame firmy s talentovanými študentami na riešenie reálnych technických výziev.',
})

const { banner } = useBanner(PageType.PROGRAM_B)
const { tm, rt } = useI18n()
const { t } = useI18n() 
const expandedFaq = ref(null)

const { faq } = useFaq(PageType.PROGRAM_B)

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
