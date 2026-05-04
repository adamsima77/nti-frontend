export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  const token = process.client ? localStorage.getItem('_t') : null

  if (!token && !auth.user) {
    return navigateTo('/auth/login')
  }

  // IMPORTANT: wait for plugin hydration
  if (!auth.hydrated && token) {
    await auth.getCurrentUser().catch(() => {
      auth.$reset()
      return navigateTo('/auth/login')
    })
  }

  if (!auth.user) return

  if (auth.isPendingOnboarding && to.path !== '/auth/onboarding') {
    return navigateTo('/auth/onboarding')
  }
})