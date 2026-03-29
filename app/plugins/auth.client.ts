export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore()

  // Hydratovať auth store pri Load  z sessionStorage
  if (process.client) {
    authStore.hydrate()
  }
})
