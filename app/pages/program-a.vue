<template>
  <div>
    <!-- Hero sekcia -->
    <UiHero
      title="Program A: Intenzívne zrýchlenie"
      description="Dynamický 3-mesačný program pre študentov a začínajúcich profesionálov. Získaj skúsenosti, mentoring a sieť kontaktov."
    />

    <!-- Čo je Program A -->
    <section class="mt-20 px-6 md:px-20 py-16">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl font-bold text-navy mb-6">{{ $t('program-a.title') }}</h2>
        <p class="text-lg text-gray-600 leading-relaxed mb-8">
          {{ $t('program-a.description') }}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <UiInfoCard
            title="3 mesiace"
            description="Intenzívny program s týždenným mentorstvom a workshopmi."
          />
          <UiInfoCard
            title="Tímová práca"
            description="Pracuješ v multidisciplinárnom tíme s vlastnými ideami."
          />
          <UiInfoCard
            title="Reálne projekty"
            description="Vypracovávate reálne výzvy s dopadom na komunitu."
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
              <li class="flex items-start gap-3">
                <CheckCircle class="w-5 h-5 text-success-500 flex-shrink-0 mt-1" />
                <span>Vysokoškoláci všetkých ročníkov</span>
              </li>
              <li class="flex items-start gap-3">
                <CheckCircle class="w-5 h-5 text-success-500 flex-shrink-0 mt-1" />
                <span>Základná znalosť aspoň jednej technológie</span>
              </li>
              <li class="flex items-start gap-3">
                <CheckCircle class="w-5 h-5 text-success-500 flex-shrink-0 mt-1" />
                <span>Možnosť venovať 15-20 hodín týždne</span>
              </li>
              <li class="flex items-start gap-3">
                <CheckCircle class="w-5 h-5 text-success-500 flex-shrink-0 mt-1" />
                <span>Motivácia a ochota učiť sa</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-xl font-bold text-blue-600 mb-4">{{ $t('program-a.signup_juniors.title') }}</h3>
            <ul class="space-y-3 text-gray-700">
              <li class="flex items-start gap-3">
                <CheckCircle class="w-5 h-5 text-success-500 flex-shrink-0 mt-1" />
                <span>Do 2 rokov pracovnej skúsenosti</span>
              </li>
              <li class="flex items-start gap-3">
                <CheckCircle class="w-5 h-5 text-success-500 flex-shrink-0 mt-1" />
                <span>Začínajúci alebo samouk vývojári</span>
              </li>
              <li class="flex items-start gap-3">
                <CheckCircle class="w-5 h-5 text-success-500 flex-shrink-0 mt-1" />
                <span>Ochota venovať čas programu</span>
              </li>
              <li class="flex items-start gap-3">
                <CheckCircle class="w-5 h-5 text-success-500 flex-shrink-0 mt-1" />
                <span>Otvorený mindsettejšie práci</span>
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
            v-for="(faq, idx) in faqs"
            :key="idx"
            class="bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              @click="toggleFaq(idx)"
            >
              <span class="font-bold text-navy text-left">{{ faq.question }}</span>
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
                {{ faq.answer }}
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
          to="/auth/login"
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

definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'Program A — Intenzívne zrýchlenie | NTI',
  description: 'Program A je 3-mesačný intenzívny program pre študentov vysokých škôl s mentorstvom, tímovou prácou a reálnymi projektmi.',
  ogTitle: 'Program A — Intenzívne zrýchlenie',
  ogDescription: 'Dynamický 3-mesačný program pre študentov a začínajúcich profesionálov. Získaj skúsenosti, mentoring a sieť kontaktov.',
  ogType: 'website',
  ogUrl: 'https://nti.sk/program-a',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Program A — Intenzívne zrýchlenie | NTI',
  twitterDescription: 'Dynamický 3-mesačný program pre študentov s mentorstvom a prácou na reálnych projektoch.',
})

const expandedFaq = ref(null)

const faqs = [
  {
    question: 'Koľko stojí Program A?',
    answer:
      'Program A je úplne bezplatný. Všetci účastníci dostávajú rovnaký prístup k mentorom, workshopom a materiálom, bez skrytých poplatkov.',
  },
  {
    question: 'Máš skúsenosti s prácou mimo školy?',
    answer:
      'Nie, nie je to povinné! Väčšina našich účastníkov nemá pracovné skúsenosti. Dôležité je mať vôľu učiť sa a spolupracovať s tímom.',
  },
  {
    question: 'Ako dlho trvá program?',
    answer: 'Program trvá 3 mesiace, od apríla do júla. Očakávame časovú investíciu 15-20 hodín týždenne.',
  },
  {
    question: 'Môžem sa prihlásiť, ak som zamestnaný?',
    answer: 'Áno, ale vrúcame vám, aby ste mali aspoň 15 hodín týždenne čistého času na program.',
  },
  {
    question: 'Čo sa stane po skončení programu?',
    answer:
      'Po skončení sa tímy prezentujú svojich projektov a výsledkov. Podľa výkonu sa môžu nastaviť ďalšie príležitosti spolupráce alebo práce.',
  },
]

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
