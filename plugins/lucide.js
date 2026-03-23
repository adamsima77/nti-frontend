import { defineNuxtPlugin } from '#app'
import * as lucideIcons from '@lucide/vue-next'

export default defineNuxtPlugin((nuxtApp) => {
  // Registrovanie všetkých ikon globálne
  Object.entries(lucideIcons).forEach(([name, component]) => {
    nuxtApp.vueApp.component(name, component)
  })
})