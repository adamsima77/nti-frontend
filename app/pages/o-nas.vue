<template>
  <section class="relative mt-20 bg-white py-16 sm:py-20 md:py-24 px-6 md:px-20 rounded-2xl shadow-xl overflow-hidden">
    <div class="relative z-10 flex flex-col gap-6">
      <div class="space-y-6">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-navy leading-tight">O NTI</h2>
        <p class="text-base sm:text-lg md:text-xl text-gray-500">
          Nitriansky Technický Inkubátor je spoľahlivá inštitúcia podporujúca inovácie a technologický rozvoj. Budujeme
          ekosystém spolupráce medzi fakultami, firmami a startupmi.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <UiInfoCard
            title="Misia"
            description="Podporujeme inovácie, vzdelávanie a udržateľný technologický rozvoj v regióne."
          />
          <UiInfoCard
            title="Piliere"
            description="Odbornosť, transparentnosť a spolupráca tvoria základ našej dôveryhodnosti."
          />
          <UiInfoCard
            title="Ekosystém"
            description="Prepojujeme fakulty, startupy a firmy, aby vznikali reálne inovácie a projekty s dopadom."
          />
          <UiInfoCard
            title="Fakulty"
            description="Spolupracujeme s fakultami a akademickými partnermi, aby sme prinášali nové projekty, výskum a odborné znalosti do praxe."
          />
        </div>
      </div>

      <div class="flex flex-col mt-10">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy mb-8">Náš tím</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <UiTeamCard
            image="/team/person1.jpg"
            alt="John Doe"
            name="John Doe"
            role="CEO"
          />
          <UiTeamCard
            image="/team/person2.jpg"
            alt="Jane Smith"
            name="Jane Smith"
            role="CTO"
          />
          <UiTeamCard
            image="/team/person3.jpg"
            alt="Alex Novak"
            name="Alex Novak"
            role="Lead Designer"
          />

          <UiTeamCard
            image="/team/person3.jpg"
            alt="Alex Novak"
            name="Alex Novak"
            role="Lead Designer"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup></script>
