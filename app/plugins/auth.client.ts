export default defineNuxtPlugin(async () => {
  if (import.meta.server) return

  const auth = useAuthStore()
  const token = localStorage.getItem('_t')

  if (!token) return

  if (!auth.user) {
    try {
      await auth.getCurrentUser()
    } catch {
      auth.$reset()
    }
  }

  auth.hydrated = true
})