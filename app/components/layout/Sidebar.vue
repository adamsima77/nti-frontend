<template>
  <div>
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
      @click="$emit('close-sidebar')"
    />

    <div
      class="fixed top-0 left-0 h-screen w-80 bg-navy text-white p-5 shadow-2xl transform transition-transform duration-500 ease-out flex flex-col gap-6 z-900"
      :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex justify-between items-center">
        <NuxtLink :to="localePath('/')">
          <img
            :src="logo"
            alt="Nitriansky technický inkubátor"
          />
        </NuxtLink>

        <button @click="$emit('close-sidebar')">
          <X class="w-6 h-6 hover:opacity-80 transition-opacity duration-300 cursor-pointer" />
        </button>
      </div>

      <div class="flex items-center">
        <NuxtLink :to="localePath('/auth/login')">
          <UserCircle class="w-6 h-6 text-blue-50 hover:text-blue-500 transition-colors duration-300" />
        </NuxtLink>
      </div>

      <ul class="flex flex-col gap-4 text-base md:text-lg lg:text-xl">
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

      <div class="mt-6 pt-4 border-t border-white/20">
        <div class="flex items-center justify-center gap-2">
          <button
            @click="setLocale('en')"
            :class="[
              'px-4 py-2 text-sm font-medium rounded transition-colors duration-200 flex-1',
              locale === 'en' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            ]"
            :title="$t('locale.en_title')"
          >
            EN
          </button>
          <button
            @click="setLocale('sk')"
            :class="[
              'px-4 py-2 text-sm font-medium rounded transition-colors duration-200 flex-1',
              locale === 'sk' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            ]"
            :title="$t('locale.sk_title')"
          >
            SK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const { setLocale, locale } = useI18n()
const localePath = useLocalePath()

const logo = '/nti-logo.svg'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close-sidebar'])
const route = useRoute()

watch(
  () => route.fullPath,
  () => {
    emit('close-sidebar')
  },
)
</script>