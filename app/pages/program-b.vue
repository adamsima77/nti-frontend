<template>
  <div>
    <!-- Hero sekcia -->
    <UiHero
      title="Program B: Inovácia za firemných výziev"
      description="Najímte talentované študentov a junioroch vývojárov na riešenie svojich technických problémov. Pozrite si inovatívne riešenia, ktoré vám pomôžu rásť."
    />

    <!-- Čo je Program B -->
    <section class="mt-20 px-6 md:px-20 py-16">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl font-bold text-navy mb-6">Čo je Program B?</h2>
        <p class="text-lg text-gray-600 leading-relaxed mb-8">
          Program B spája firmy s talentovanými študentami a juniormi, ktorí riešia reálne technické výzvy. Vaša firma
          dostane inovatívne riešenia, zatiaľ čo študenti získajú praktické skúsenosti a mentoring od profesionálov.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <UiInfoCard
            title="Inovatívne riešenia"
            description="Študenti prinesú čerstvý pohľad na vaše technické problémy."
          />
          <UiInfoCard
            title="Flexibilná angažovanosť"
            description="Určite sami, ako silno sa chcete angažovať a mentorovat študentov."
          />
          <UiInfoCard
            title="Bez skrytých nákladov"
            description="Program je bezplatný pre obidve strany — firmy aj študenty."
          />
        </div>
      </div>
    </section>

    <!-- Ako to funguje -->
    <section class="mt-16 px-6 md:px-20 py-16 bg-gray-50 rounded-lg">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl font-bold text-navy mb-12">Ako to funguje?</h2>

        <div class="space-y-6">
          <div class="flex gap-6">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white font-bold">
                1
              </div>
            </div>
            <div>
              <h3 class="text-xl font-bold text-navy mb-2">Registrácia vašej firmy</h3>
              <p class="text-gray-700">
                Zaregistrujte si firemný profil a identifikujte vaše tímové potreby a technické výzvy, ktoré chcete
                riešiť.
              </p>
            </div>
          </div>

          <div class="flex gap-6">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white font-bold">
                2
              </div>
            </div>
            <div>
              <h3 class="text-xl font-bold text-navy mb-2">Vytvorenie výzvy</h3>
              <p class="text-gray-700">
                Definujte svoju výzvu — čo má byť vyriešené, aké sú konečné ciele a akí študenti sú ideálni (junior,
                senior aj.).
              </p>
            </div>
          </div>

          <div class="flex gap-6">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white font-bold">
                3
              </div>
            </div>
            <div>
              <h3 class="text-xl font-bold text-navy mb-2">Výber tímu</h3>
              <p class="text-gray-700">
                Prezerajte si prihlášenné tímy, budujte si komentáre s potenciálnymi kandidátmi a vyberte najlepší tím
                pre vašu výzvu.
              </p>
            </div>
          </div>

          <div class="flex gap-6">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white font-bold">
                4
              </div>
            </div>
            <div>
              <h3 class="text-xl font-bold text-navy mb-2">Implementácia & mentoring</h3>
              <p class="text-gray-700">
                Vybraný tím začína s vývojom. Poskytujete feedback a mentorstvo počas 3-mesačného programu.
              </p>
            </div>
          </div>

          <div class="flex gap-6">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white font-bold">
                5
              </div>
            </div>
            <div>
              <h3 class="text-xl font-bold text-navy mb-2">Prezentácia & nasadenie</h3>
              <p class="text-gray-700">
                Tím prezentuje finálne riešenie. Rozhodujete sa, či ho budete ďalej rozvíjať alebo nasadzovať do
                produkcie.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Čo potrebujete odoslať -->
    <section class="mt-20 px-6 md:px-20 py-16">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl font-bold text-navy mb-8">Čo potrebujeme od vašej firmy?</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
            <h3 class="text-lg font-bold text-blue-700 mb-3">Firemný profil</h3>
            <ul class="space-y-2 text-gray-700 text-sm">
              <li>✓ Názov a popis firmy</li>
              <li>✓ Vaša webová stránka</li>
              <li>✓ Kontakt (email, telefón)</li>
              <li>✓ Logo a branding</li>
            </ul>
          </div>

          <div class="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
            <h3 class="text-lg font-bold text-blue-700 mb-3">Technická špecifikácia výzvy</h3>
            <ul class="space-y-2 text-gray-700 text-sm">
              <li>✓ Jasný popis problému</li>
              <li>✓ Očakávané technológie</li>
              <li>✓ Rozpočet času / náročnosť</li>
              <li>✓ Konečné ciele a kritériá úspechu</li>
            </ul>
          </div>
        </div>

        <div class="mt-8 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <p class="text-gray-700">
            <strong>Pro tip:</strong> Čím presnejšie a jasnejšie popíšete vašu výzvu, tým lepšie tímy si na ňu budú
            chcieť prihlásit.
          </p>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="mt-20 px-6 md:px-20 py-16 bg-gray-50 rounded-lg">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl font-bold text-navy mb-12">Časté otázky</h2>

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
        <h2 class="text-4xl font-bold text-navy mb-6">Chcete spolupracovať s nami?</h2>
        <p class="text-lg text-gray-600 mb-8">
          Prihláste svoju firmu a definujte svoju výzvu. Naši študenti čakajú na príležitosť!
        </p>
        <NuxtLink
          to="/auth/login"
          class="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Zastaviť sa ako firma
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

useHead({
  title: 'Program B — Inovácia za firemných výziev | NTI',
  meta: [
    {
      name: 'description',
      content:
        'Program B spája firmy s talentovanými študentami. Prezentujte svoje technické výzvy a získajte inovatívne riešenia.',
    },
  ],
})

const expandedFaq = ref(null)

const faqs = [
  {
    question: 'Koľko to bude stáť?',
    answer: 'Program B je úplne bezplatný pre firmy. Neplatíte nič za výber tímu, mentoring alebo nasadenie riešenia.',
  },
  {
    question: 'Ako dlho trvá program?',
    answer:
      'Program B je koncipovaný ako 3-mesačný projekt. Študenti budú pracovať na vašej výzve konsekventne počas tejto doby.',
  },
  {
    question: 'Koľko úsilia budeme musím investovať ako mentori?',
    answer:
      'Rôzne — podľa vašich preferenovaní. Minimálne vedenie aj asynchronné feedback, maximálne týždenné stretnutia. Dohoduje sa individuálne.',
  },
  {
    question: 'Budeme si chránit IP našich riešení?',
    answer:
      'Áno. IP riešenia ostáva väčšinou vašej fireme. Študenti získajú možnosť zahrnúť projekt do svojho portfolia.',
  },
  {
    question: 'Čo ak sa tím nevysporiadá s výzvou?',
    answer: 'To je zriedkavé, ale ak sa to stane, pomôžeme vám nájsť iný tím alebo prispôsobiť výzvu.',
  },
  {
    question: 'Môžeme si vybrať tím pred štartom?',
    answer: 'Áno! Vidíte všetky prihlášenné tímy, komunikujete s nimi a vyberáte si najlepší pre vašu výzvu.',
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
