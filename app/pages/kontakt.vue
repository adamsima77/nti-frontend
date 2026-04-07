<template>
  <section class="bg-white py-16 px-4 mt-30 shadow-2xl rounded-lg">
    <div class="max-w-6xl mx-auto">
      <div class="mb-12 text-center">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-navy mb-4">Kontaktujte nás</h1>
        <p class="text-sm sm:text-base md:text-lg text-gray-500 max-w-xl mx-auto">
          Máte otázky ohľadom programov NTI alebo spolupráce? Ozvite sa nám.
        </p>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <div class="flex-1 bg-gray-50 p-8 rounded-lg border border-gray-200">
          <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-navy mb-6">Kontaktné informácie</h2>

          <div class="mb-4">
            <p class="text-xs sm:text-sm text-gray-400">Email</p>
            <p class="text-sm sm:text-base md:text-lg text-blue-600 font-medium">info@nti.sk</p>
          </div>

          <div class="mb-4">
            <p class="text-xs sm:text-sm text-gray-400">Telefón</p>
            <p class="text-sm sm:text-base md:text-lg text-navy font-medium">+421 900 000 000</p>
          </div>

          <div class="mb-6">
            <p class="text-xs sm:text-sm text-gray-400">Adresa</p>
            <p class="text-sm sm:text-base md:text-lg text-navy font-medium">Nitra, Slovensko</p>
          </div>

          <div class="w-full h-60 rounded-md overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d21227.500730949265!2d18.06898346631861!3d48.31366715207584!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476b3ee43b2f6763%3A0x75a567f979f5bed3!2sUniverzita%20Kon%C5%A1tant%C3%ADna%20Filozofa%20v%20Nitre!5e0!3m2!1ssk!2ssk!4v1774452992434!5m2!1ssk!2ssk"
              class="w-full h-full border-0"
            >
            </iframe>
          </div>
        </div>

        <div class="flex-1 bg-white p-8 rounded-lg border border-gray-200">
          <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-navy mb-6">Napíšte nám</h2>

          <form class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-500 font-bold">Meno:</label>
              <input
                type="text"
                placeholder="Meno"
                class="p-3 text-sm sm:text-base border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-500 font-bold">Priezvisko:</label>
              <input
                type="text"
                placeholder="Priezvisko"
                class="p-3 text-sm sm:text-base border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-500 font-bold">Email:</label>
              <input
                type="email"
                placeholder="Email"
                class="p-3 text-sm sm:text-base border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-500 font-bold">Správa:</label>
              <textarea
                placeholder="Správa"
                class="p-3 h-32 text-sm sm:text-base border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
              ></textarea>
            </div>

            <button
              class="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white text-sm sm:text-base md:text-lg py-3 rounded-md transition"
            >
              Odoslať správu
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
useSeoMeta({
  title: 'Kontakt | NTI',
  description: 'Kontaktuj tím NTI. Máš otázky, návrhy alebo záujem o spoluprácu? Spoj sa s nami a radi ti pomôžeme.',  ogTitle: 'Kontakt — NTI',
  ogDescription: 'Spoj sa s tímom NTI. Máš otázky? Chceš spolupracošvať? Napíš nám a odpovieme čo 24 hodín.',
  ogType: 'website',
  ogUrl: 'https://nti.sk/kontakt',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Kontakt — NTI',
  twitterDescription: 'Kontaktuj tím NTI. Máš otázky alebo záujem o spoluprácu?',});
</script>
