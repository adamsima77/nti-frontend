export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  const token = useCookie('auth_token')
 
  
  if (!token.value && !auth.user) return
 
 
  if (!auth.user && token.value) {
    try {
      await auth.getCurrentUser()
    } catch {
      
      token.value = null
      return
    }
  }
 
  
  const redirectQuery = to.query.redirect
  const redirectUrl = Array.isArray(redirectQuery)
    ? redirectQuery[0]
    : redirectQuery
 
  return navigateTo(
    (redirectUrl && redirectUrl.startsWith('/') ? redirectUrl : null)
    ?? auth.redirectUser(auth.user!)
  )
})