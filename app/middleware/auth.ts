export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  const token = useCookie('auth_token')
 
  const requiredRoles = to.meta.roles as string[] | undefined
 

  const isLoggedIn = !!auth.user || !!token.value
 
  if (!isLoggedIn) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  }
 
 
  if (!auth.user) {
    try {
      await auth.getCurrentUser()
    } catch {
      token.value = null
      return navigateTo('/auth/login')
    }
  }
 

  if (requiredRoles?.length && !auth.hasRole(requiredRoles)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  }
})