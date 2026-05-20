export default defineNuxtRouteMiddleware(async (to) => {
   if (import.meta.server) return
  const auth       = useAuthStore()
  const localePath = useLocalePath()
  const token      = import.meta.client ? localStorage.getItem('_t') : null

  // No token and no user in store → definitely a guest, let through.
  if (!token && !auth.user) return

  // Token exists but store not yet hydrated → fetch the user first.
  if (!auth.user && token) {
    try {
      await auth.getCurrentUser()
    } catch {
      // Token is dead — clean up and let through to the auth page.
      auth.$reset()
      return
    }
  }

  // If getCurrentUser() returned null (bad token, server error), let through.
  if (!auth.user) return

  // Authenticated — redirect away from guest-only pages.
  return navigateTo(localePath(auth.redirectUser()))
})