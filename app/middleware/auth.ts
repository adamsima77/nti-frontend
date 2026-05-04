export default defineNuxtRouteMiddleware(async (to) => {
  const auth  = useAuthStore()
  const token = import.meta.client ? localStorage.getItem('_t') : null

  const requiredRoles = to.meta.roles as string[] | undefined

  // Not logged in at all
  if (!auth.user && !token) {
    return navigateTo({
      path:  '/auth/login',
      query: { redirect: to.fullPath },
    })
  }

  // Token exists but store not hydrated (page refresh)
  if (!auth.user) {
    try {
      await auth.getCurrentUser()
    } catch {
      auth.$reset()
      return navigateTo('/auth/login')
    }
  }

  // User is still pending onboarding — only allow onboarding routes
  if (auth.isPendingOnboarding) {
    if (!to.path.startsWith('/auth/onboarding')) {
      return navigateTo('/auth/onboarding')
    }
    return // let them through to onboarding
  }

  // Role-based access check
  if (requiredRoles?.length && !auth.hasRole(requiredRoles)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
})