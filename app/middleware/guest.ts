export default defineNuxtRouteMiddleware(async (to) => {
  const auth  = useAuthStore()
  const token = import.meta.client ? localStorage.getItem('_t') : null

  if (!token && !auth.user) return

  if (!auth.user && token) {
    try {
      await auth.getCurrentUser()
    } catch {
      auth.$reset()
      return
    }
  }

  return navigateTo(auth.redirectUser())
})