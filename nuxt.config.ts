// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/main.css'],
  modules: ['@pinia/nuxt', '@nuxt/eslint', '@nuxtjs/i18n'],
  routeRules: {
    '/auth/**': { ssr: false },
    '/dashboard/**': { ssr: false },
    '/prihlasky/**': { ssr: false },
    '/timy/**': { ssr: false },
    '/hodnotenie/**': { ssr: false },
    '/mentor/**': { ssr: false },
    '/firma/**': { ssr: false },
    '/admin/**': { ssr: false },
  },
    i18n: {
    strategy: 'prefix',
    defaultLocale: 'sk',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      fallbackLocale: 'en',
      alwaysRedirect: true
    },
    lazy: true,
    langDir: 'locales/',

    locales: [
      {
        code: 'en',
        name: 'English',
        lang: 'en-US',
        file: 'en.json'
      },
      {
        code: 'sk',
        name: 'Slovak',
        lang: 'sk-SK',
        file: 'sk.json'
      }
    ]
  },
  runtimeConfig: {
    apiBase: process.env.NUXT_API_BASE || 'http://localhost:8000/api',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
