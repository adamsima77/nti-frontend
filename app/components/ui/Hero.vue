  <template>
  <div class="relative mt-30 bg-blue-500 text-white py-24 sm:py-28 md:py-32 px-6 md:px-20 overflow-hidden rounded-lg shadow-2xl">
    <div class="relative z-10 md:flex md:items-center md:justify-between gap-12">
      <div class="md:w-1/2 space-y-6">
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
          {{ props.title }}
        </h1>
        <p class="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80">
          {{ props.description }}
        </p>
        <div class="flex flex-col md:flex-row gap-4 mt-6 sm:mt-8">
          <NuxtLink to = "/auth/login" class="bg-blue-500 cursor-pointer md:shrink-0 text-white py-4 px-8 sm:px-10 rounded-full font-bold shadow-lg hover:bg-blue-400 transition-all duration-300 ease-in-out">
            Začni teraz
          </NuxtLink>
          <NuxtLink to="/o-nas" class="border-2 bg-white md:shrink-0 text-blue-500 md:bg-transparent cursor-pointer md:border-white md:text-white py-4 px-8 sm:px-10 rounded-full font-bold md:hover:bg-white md:hover:text-blue-500 transition-all">
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
  </div>
  </template>

<script setup>
  const logo = "/nti-logo.svg"
  const props = defineProps({
    title: String,
    description: String

  })
</script>