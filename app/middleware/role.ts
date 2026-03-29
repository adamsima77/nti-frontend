export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Skontroluj či sa vyžaduje rola (meta.roles)
  const requiredRoles = to.meta.roles

  if (!requiredRoles) {
    // Ak nie je požadovaná rola, nech pokračuje
    return
  }

  // Ak nie je autentifikovaný, nech auth middleware to riešit
  if (!authStore.isAuthenticated) {
    return
  }

  // Skontroluj či má użívates jednu z požadovaných rolí
  const hasRequiredRole = authStore.hasRole(requiredRoles)

  if (!hasRequiredRole) {
    // Presmeruj na 403 Forbidden
    return abortNavigation()
  }
})
