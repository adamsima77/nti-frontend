export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const auth  = useAuthStore()
  const token = import.meta.client ? localStorage.getItem('_t') : null
  const requiredRoles = to.meta.roles as string[] | undefined
  const requiredPermissions = to.meta.permissions as string[] | undefined

  const inferredPermissionByPrefix: Array<{ prefix: string; permissions: string[] }> = [
    { prefix: '/student', permissions: ['students.profile.view_own'] },
    { prefix: '/firma', permissions: ['organizations.view'] },
    { prefix: '/hodnotenie', permissions: ['evaluation.view_any'] },
    { prefix: '/cms', permissions: ['content.view'] },
  ]

  const requiredPermissionSet = requiredPermissions
    ?? inferredPermissionByPrefix.find((entry) => to.path.startsWith(entry.prefix))?.permissions

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

  // For org users hitting /hodnotenie: refresh auth in case they were just assigned as company rep
  if (to.path.startsWith('/hodnotenie') && auth.hasRole(['organization']) && !auth.isCommissionMember) {
    try { await auth.getCurrentUser() } catch {}
  }

  const isCommissionMemberOnHodnotenie =
    auth.isCommissionMember && to.path.startsWith('/hodnotenie')

  // Role-based access check
  if (requiredRoles?.length && !auth.hasRole(requiredRoles) && !isCommissionMemberOnHodnotenie) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  // Permission-based access check
  if (
    requiredPermissionSet?.length &&
    !requiredPermissionSet.some(permission => auth.hasPermission(permission)) &&
    !isCommissionMemberOnHodnotenie
  ) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
})