export default defineNuxtRouteMiddleware(async (to) => {
  const auth  = useAuthStore()
  const token = import.meta.client ? localStorage.getItem('_t') : null

  // Definitely a guest — let through
  if (!token && !auth.user) return

  // Token exists but store not hydrated
  if (!auth.user && token) {
    try {
      await auth.getCurrentUser()
    } catch {
      auth.$reset()
      return
    }
  }

  // Redirect based on status
  return navigateTo(auth.redirectUser())
})