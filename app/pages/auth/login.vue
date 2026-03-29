<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gray-50">
    <div class="w-full max-w-md md:max-w-lg bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-10">
      
      <div class="mb-6 text-center">
        <h1 class="text-xl md:text-2xl font-bold text-navy">
          Prihlásenie
        </h1>
      </div>

      <form class="flex flex-col gap-4">
        
        <div class="flex flex-col gap-1">
          <label class="text-sm text-gray-500 font-bold">
            Email:
          </label>
          <input 
            type="email"
            placeholder="Zadajte email..."
            class="px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm text-gray-500 font-bold">
            Heslo:
          </label>
          <input 
            type="password"
            placeholder="Zadajte heslo..."
            class="px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div class="flex justify-start">
          <NuxtLink 
            to="" 
            class="text-sm text-blue-600 hover:underline cursor-pointer"
          >
            Zabudli ste heslo ?
          </NuxtLink>
        </div>

        <button 
          type="submit"
          class="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base font-medium py-2.5 rounded-md transition duration-200 cursor-pointer"
        >
          Prihlásiť sa
        </button>

        <div class="text-center text-sm text-gray-500 mt-3">
          Nemáte účet?
          <NuxtLink to="" class="text-blue-600 hover:underline cursor-pointer">
            Zaregistrujte sa
          </NuxtLink>
        </div>

      </form>
    </div>
  </div>
</template>
<script setup>
  definePageMeta({
      layout: false
  })
</script>