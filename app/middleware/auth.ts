export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Ak nemáme token, skúsime načítať zo sessionStorage a hydratovať
  if (!authStore.isAuthenticated && import.meta.client) {
    authStore.hydrate()
  }

  // Ak nie je autentifikovaný, presmeruj na login
  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  }
})
