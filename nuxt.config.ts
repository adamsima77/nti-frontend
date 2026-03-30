// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/main.css'],
  modules: ['@pinia/nuxt', '@nuxt/eslint'],
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
