<template>
  <section class="relative mt-30 bg-blue-500 text-white py-24 sm:py-28 md:py-32 px-6 md:px-20 overflow-hidden rounded-lg shadow-2xl">
    <div class="relative z-10 md:flex md:items-center md:justify-between gap-12">
      <div class="md:w-1/2 space-y-6">
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
          Objav Nitriansky Technický Inkubátor!
        </h1>
        <p class="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80">
          Interaktívne programy, mentorstvo a komunita, ktorá ťa posunie vpred.
        </p>
        <div class="flex flex-col md:flex-row gap-4 mt-6 sm:mt-8">
          <NuxtLink class="bg-blue-500 cursor-pointer md:shrink-0 text-white py-4 px-8 sm:px-10 rounded-full font-bold shadow-lg hover:scale-105 transform transition-all">
            Začni teraz
          </NuxtLink>
          <NuxtLink to="" class="border-2 bg-white md:shrink-0 text-blue-500 md:bg-transparent cursor-pointer md:border-white md:text-white py-4 px-8 sm:px-10 rounded-full font-bold md:hover:bg-white md:hover:text-blue-500 transition-all">
            Zisti viac
          </NuxtLink>
        </div>
      </div>
      <div class="md:w-1/2 relative flex justify-center md:justify-end mt-10 md:mt-0">
        <div class="absolute w-64 sm:w-72 md:w-80 h-64 sm:h-72 md:h-80 bg-white/10 rounded-full -top-12 -right-12"></div>
        <img :src="logo" alt="Hero ilustrácia" class="relative w-64 sm:w-80 md:w-96 h-auto"/>
      </div>
    </div>
    <div class="absolute inset-0 bg-linear-to-b from-blue-500/70 to-blue-700/70 mix-blend-multiply pointer-events-none"></div>
  </section>

 <section id="programs" class="mt-20 px-6 md:px-0">
    <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold text-navy mb-12 text-center md:text-left">Naše programy</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="bg-white rounded-2xl shadow-xl p-8 sm:p-10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full">
        <h3 class="text-lg sm:text-xl md:text-2xl font-bold text-blue-700 mb-3">Program A</h3>
        <p class="text-sm sm:text-base md:text-lg text-gray-500 mb-4 md:mb-6 flex-1">Intenzívny kurz pre rýchly osobný rast a nové zručnosti.</p>
        <NuxtLink href="#" class="text-blue-500 font-bold hover:underline mt-2 md:mt-0">Viac info →</NuxtLink>
      </div>
      <div class="bg-white rounded-2xl shadow-xl p-8 sm:p-10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full">
        <h3 class="text-lg sm:text-xl md:text-2xl font-bold text-blue-700 mb-3">Program B</h3>
        <p class="text-sm sm:text-base md:text-lg text-gray-500 mb-4 md:mb-6 flex-1">Mentoring a komunita pre dlhodobý profesionálny rozvoj.</p>
        <NuxtLink href="#" class="text-blue-500 font-bold hover:underline mt-2 md:mt-0">Viac info →</NuxtLink>
      </div>
    </div>
  </section>


  <section class="mt-16 mb-20 px-6 md:px-0 ">
    <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold text-navy mb-12 text-center md:text-left">Naši partneri</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 justify-items-center md:justify-items-start gap-6 sm:gap-8 md:gap-10">
      <img src="/test_logo.png" alt="Partner 1" class="h-16 sm:h-18 md:h-20 filter grayscale hover:grayscale-0 transition duration-300"/>
      <img src="/test_logo.png" alt="Partner 2" class="h-16 sm:h-18 md:h-20 filter grayscale hover:grayscale-0 transition duration-300"/>
      <img src="/test_logo.png" alt="Partner 3" class="h-16 sm:h-18 md:h-20 filter grayscale hover:grayscale-0 transition duration-300"/>
      <img src="/test_logo.png" alt="Partner 4" class="h-16 sm:h-18 md:h-20 filter grayscale hover:grayscale-0 transition duration-300"/>
    </div>
  </section>

  <section class="mb-20 mt-10 px-6 md:px-0">
    <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold text-navy mb-12 text-center md:text-left">Novinky</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col h-full">
        <img src="https://www.vegmania.sk/wp-content/uploads/2022/01/ovocie-750x750.jpg" class="rounded-lg mb-4 sm:mb-5 hover:opacity-90 shadow-lg  transition-opacity duration-300 ease-in-out cursor-pointer" alt="Novinka #1">
        <div class="flex-1 flex flex-col justify-between">
          <NuxtLink to="">
            <h3 class="text-lg sm:text-xl md:text-xl font-bold text-blue-700 mb-2 cursor-pointer">Novinka #1</h3>
            </NuxtLink>
            <p class="text-sm sm:text-base md:text-base text-gray-500">Zaujímavé aktuality a tipy pre tvoj profesionálny rast.</p>
          <NuxtLink href="#" class="mt-3 text-blue-500 font-bold hover:underline">Čítať viac →</NuxtLink>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col h-full">
        <img src="https://www.vegmania.sk/wp-content/uploads/2022/01/ovocie-750x750.jpg" class="rounded-lg mb-4 sm:mb-5 hover:opacity-90  shadow-lg transition-opacity duration-300 ease-in-out cursor-pointer" alt="Novinka #2">
        <div class="flex-1 flex flex-col justify-between">
          <NuxtLink to="">
            <h3 class="text-lg sm:text-xl md:text-xl font-bold text-blue-700 mb-2 cursor-pointer">Novinka #2</h3>
            </NuxtLink>
            <p class="text-sm sm:text-base md:text-base text-gray-500">Tipy a triky od odborníkov priamo do tvojich rúk.</p>
          <NuxtLink href="#" class="mt-3 text-blue-500 font-bold hover:underline">Čítať viac →</NuxtLink>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col h-full">
        <img src="https://www.vegmania.sk/wp-content/uploads/2022/01/ovocie-750x750.jpg" class="rounded-lg mb-4 sm:mb-5 hover:opacity-90 shadow-lg  transition-opacity duration-300 ease-in-out cursor-pointer" alt="Novinka #3">
        <div class="flex-1 flex flex-col justify-between">
          <NuxtLink to="">
            <h3 class="text-lg sm:text-xl md:text-xl font-bold text-blue-700 mb-2 cursor-pointer">Novinka #3</h3>
            </NuxtLink>
            <p class="text-sm sm:text-base md:text-base text-gray-500">Zaujímavé aktuality a tipy pre tvoj profesionálny rast.</p>
          <NuxtLink href="#" class="mt-3 text-blue-500 font-bold hover:underline">Čítať viac →</NuxtLink>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col h-full">
        <img src="https://www.vegmania.sk/wp-content/uploads/2022/01/ovocie-750x750.jpg" class="rounded-lg mb-4 sm:mb-5 hover:opacity-90 shadow-lg transition-opacity duration-300 ease-in-out cursor-pointer" alt="Novinka #4">
        <div class="flex-1 flex flex-col justify-between">
          <NuxtLink to="">
            <h3 class="text-lg sm:text-xl md:text-xl font-bold text-blue-700 mb-2 cursor-pointer">Novinka #4</h3>
            </NuxtLink>
            <p class="text-sm sm:text-base md:text-base text-gray-500">Zaujímavé aktuality a tipy pre tvoj profesionálny rast.</p>
          <NuxtLink href="#" class="mt-3 text-blue-500 font-bold hover:underline">Čítať viac →</NuxtLink>
        </div>
      </div>
    </div>
    
  </section>
</template>

<script setup>
const logo = "/nti-logo.svg"
</script>