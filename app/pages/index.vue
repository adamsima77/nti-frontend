<template>
  <UiHero title = "Objav Nitriansky Technický Inkubátor!" description="Interaktívne programy, mentorstvo a komunita, ktorá ťa posunie vpred."></UiHero>

 <div id="programs" class="mt-20 px-6 md:px-0 flex flex-col">
  <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold text-navy mb-12 text-center md:text-left">
    Naše programy
  </h2>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <UiProgramCard 
      title="Program A" 
      description="Intenzívny kurz pre rýchly osobný rast a nové zručnosti."
    />
    <UiProgramCard 
      title="Program B" 
      description="Mentoring a komunita pre dlhodobý profesionálny rozvoj."
    />
  </div>
</div>


  <section class="mt-16 mb-20 px-6 md:px-0 ">
    <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold text-navy mb-12 text-center md:text-left">Naši partneri</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 justify-items-center md:justify-items-start gap-6 sm:gap-8 md:gap-10">
      <img src="/test_logo.png" alt="Partner 1" class="h-16 sm:h-18 md:h-20 filter grayscale hover:grayscale-0 transition duration-300"/>
      <img src="/test_logo.png" alt="Partner 2" class="h-16 sm:h-18 md:h-20 filter grayscale hover:grayscale-0 transition duration-300"/>
      <img src="/test_logo.png" alt="Partner 3" class="h-16 sm:h-18 md:h-20 filter grayscale hover:grayscale-0 transition duration-300"/>
      <img src="/test_logo.png" alt="Partner 4" class="h-16 sm:h-18 md:h-20 filter grayscale hover:grayscale-0 transition duration-300"/>
    </div>
  </section>

  <div class="mb-20 mt-10 px-6 md:px-0">
    <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold text-navy mb-12 text-center md:text-left">Novinky</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
     <UiItem  
  title="Novinka #1" 
  description="Zaujímavé aktuality a tipy pre tvoj profesionálny rast." 
  category="Tipy & Novinky"
  image="https://www.vegmania.sk/wp-content/uploads/2022/01/ovocie-750x750.jpg" 
  alt="Novinka #1" 
  link="#" 
/>

   <UiItem  
  title="Novinka #1" 
  description="Zaujímavé aktuality a tipy pre tvoj profesionálny rast." 
  category="Tipy & Novinky"
  image="https://www.vegmania.sk/wp-content/uploads/2022/01/ovocie-750x750.jpg" 
  alt="Novinka #1" 
  link="#" 
/>
   <UiItem  
  title="Novinka #1" 
  description="Zaujímavé aktuality a tipy pre tvoj profesionálny rast." 
  category="Tipy & Novinky"
  image="https://www.vegmania.sk/wp-content/uploads/2022/01/ovocie-750x750.jpg" 
  alt="Novinka #1" 
  link="#" 
/>
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
</template>

<script setup>

</script>