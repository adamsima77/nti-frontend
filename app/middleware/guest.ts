export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Ak je autentifikovaný, presmeruj na dashboard
  if (authStore.isAuthenticated) {
    return navigateTo('/dashboard')
  }
})
