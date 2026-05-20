export default defineNuxtRouteMiddleware(async (to) => {
   if (import.meta.server) return
  const auth = useAuthStore()
  const token = import.meta.client ? localStorage.getItem('_t') : null

  if (!token && !auth.user) {
    return navigateTo('/auth/login')
  }

  if (!auth.hydrated && token) {
    await auth.getCurrentUser().catch(() => {
      auth.$reset()
      return navigateTo('/auth/login')
    })
  }

  if (!auth.user) return

  if (auth.isActive) {
    return navigateTo(auth.redirectUser())
  }

  if (auth.isPendingApproval) {
    return navigateTo('/auth/pending-approval')
  }

  if (!auth.isPendingOnboarding) {
    return navigateTo('/')
  }
})