export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const auth  = useAuthStore()
  const token = import.meta.client ? localStorage.getItem('_t') : null
  const requiredRoles = to.meta.roles as string[] | undefined

  // Not logged in at all
  if (!auth.user && !token) {
    return navigateTo({
      path:  '/auth/login',
      query: { redirect: encodeURIComponent(to.fullPath) },
    })
  }

  // Token exists but store not hydrated (page refresh)
  if (!auth.user) {
    try {
      await auth.getCurrentUser()
    } catch {
      auth.$reset()
      return navigateTo({
        path:  '/auth/login',
        query: { redirect: encodeURIComponent(to.fullPath) },
      })
    }
  }

  // Pending onboarding — only allow onboarding routes
  if (auth.isPendingOnboarding) {
    if (!to.path.startsWith('/auth/onboarding')) {
      return navigateTo('/auth/onboarding')
    }
    return
  }

  // Pending approval — only allow pending-approval page
  if (auth.isPendingApproval) {
    if (!to.path.startsWith('/auth/pending-approval')) {
      return navigateTo('/auth/pending-approval')
    }
    return
  }

  // Role-based access check
  if (requiredRoles?.length && !auth.hasRole(requiredRoles)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
})