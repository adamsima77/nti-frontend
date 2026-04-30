export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  const token = useCookie('auth_token')
 
  if (token.value) {
    try {
      await auth.getCurrentUser()
    } catch {
      token.value = null
    }
  }
})