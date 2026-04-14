<template>
  <nav class="flex flex-row p-4 md:p-5 bg-navy text-white justify-between shadow-2xl fixed z-100 w-full">
    
    <!-- LOGO -->
    <div class="shrink-0">
      <NuxtLink :to="localePath('/')">
        <img
          :src="logo"
          class="h-10 md:h-12 lg:h-15 w-auto"
          alt="Nitriansky technický inkubátor"
        />
      </NuxtLink>
    </div>

    <!-- DESKTOP NAV -->
    <ul class="hidden md:flex items-center gap-4 lg:gap-6 whitespace-nowrap text-sm md:text-base lg:text-lg">
      
      <li>
        <NuxtLink
          :to="localePath('/novinky')"
          class="text-blue-50 hover:text-blue-500 transition-colors duration-300"
          active-class="text-blue-500"
          exact-active-class="text-blue-500"
        >
          {{ $t('nav.news') }}
        </NuxtLink>
      </li>

      <li>
        <NuxtLink
          :to="localePath('/program-a')"
          class="text-blue-50 hover:text-blue-500 transition-colors duration-300"
          active-class="text-blue-500"
          exact-active-class="text-blue-500"
        >
          {{ $t('nav.program_a') }}
        </NuxtLink>
      </li>

      <li>
        <NuxtLink
          :to="localePath('/program-b')"
          class="text-blue-50 hover:text-blue-500 transition-colors duration-300"
          active-class="text-blue-500"
          exact-active-class="text-blue-500"
        >
          {{ $t('nav.program_b') }}
        </NuxtLink>
      </li>

      <li>
        <NuxtLink
          :to="localePath('/partneri-mentori')"
          class="text-blue-50 hover:text-blue-500 transition-colors duration-300"
          active-class="text-blue-500"
          exact-active-class="text-blue-500"
        >
          {{ $t('nav.partners') }}
        </NuxtLink>
      </li>

      <li>
        <NuxtLink
          :to="localePath('/vyzvy')"
          class="text-blue-50 hover:text-blue-500 transition-colors duration-300"
          active-class="text-blue-500"
          exact-active-class="text-blue-500"
        >
          {{ $t('nav.challenges') }}
        </NuxtLink>
      </li>

    </ul>

    <!-- RIGHT SIDE -->
    <div class="flex items-center gap-3">

      <!-- USER ICON -->
      <NuxtLink
        :to="localePath('/auth/login')"
        class="hidden md:inline-block"
      >
        <UserCircle class="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 hover:text-blue-500 transition-colors duration-300" />
      </NuxtLink>

      <!-- LANGUAGE SWITCH -->
      <div class="hidden md:flex items-center gap-1">
        <button
          @click="setLocale('en')"
          :class="[
            'px-2 py-1 text-xs font-medium rounded transition-colors duration-200',
            locale === 'en'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
          :title="$t('locale.en_title')"
        >
          EN
        </button>

        <button
          @click="setLocale('sk')"
          :class="[
            'px-2 py-1 text-xs font-medium rounded transition-colors duration-200',
            locale === 'sk'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
          :title="$t('locale.sk_title')"
        >
          SK
        </button>
      </div>

      <!-- MOBILE MENU BUTTON -->
      <button
        class="md:hidden"
        @click="toggleSidebar"
      >
        <Menu
          v-if="!isSidebarOpen"
          class="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity duration-300 ease-in-out"
        />
      </button>

    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(false)
const logo = '/nti-logo.svg'

// i18n
const { setLocale, locale } = useI18n()
const localePath = useLocalePath() 

// emits
const emit = defineEmits(['open-sidebar'])

function toggleSidebar() {
  open.value = !open.value
  emit('open-sidebar', open.value)
}

// props
defineProps({
  isSidebarOpen: { type: Boolean, default: false },
})
</script>