export const useApi = () => {
  const config = useRuntimeConfig()
  const base = () => import.meta.server ? config.apiBase : config.public.apiBase
 
  const isLoading = ref(false)
  const error = ref<string | null>(null)
 
  const getAuthHeader = (): Record<string, string> => {
    try {
      const { token } = useAuthStore()
      return token ? { Authorization: `Bearer ${token}` } : {}
    } catch { return {} }
  }
 
  const handleError = (err: unknown, method: string, endpoint: string) => {
    const message = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Neznáma chyba'
    error.value = message
    console.error(`API Error [${method} ${endpoint}]:`, err)
    try {
      if (!message.includes('Unauthorized')) {
        useToast().addToast({ message: `${method} ${endpoint}: ${message}`, type: 'error', duration: 5000 })
      }
    } catch {}
  }
 
  const request = async (method: string, endpoint: string, data?: any, options: RequestInit = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch(`${base()}${endpoint}`, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: data && ['POST', 'PUT', 'PATCH'].includes(method) ? JSON.stringify(data) : undefined,
        ...options,
      })
      if (response.status === 401) {
        try { await useAuthStore().logout() } catch (e) { console.error('Logout failed:', e) }
        throw new Error('Unauthorized')
      }
      if (!response.ok) {
        const { message } = await response.json().catch(() => ({}))
        throw new Error(message || `HTTP ${response.status}`)
      }
      return response.json()
    } catch (err) {
      handleError(err, method, endpoint)
      throw err
    } finally {
      isLoading.value = false
    }
  }
 
  return {
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    get:    (endpoint: string, options?: RequestInit) => request('GET',    endpoint, null, options),
    post:   (endpoint: string, data: any, options?: RequestInit) => request('POST',   endpoint, data, options),
    put:    (endpoint: string, data: any, options?: RequestInit) => request('PUT',    endpoint, data, options),
    patch:  (endpoint: string, data: any, options?: RequestInit) => request('PATCH',  endpoint, data, options),
    delete: (endpoint: string, options?: RequestInit) => request('DELETE', endpoint, null, options),
  }
}