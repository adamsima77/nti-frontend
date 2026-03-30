import { ref, computed } from 'vue'

export const useApi = () => {
  const config = useRuntimeConfig()
  const apiBaseUrl = config.public.apiBase || 'http://localhost:8000/api'

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getAuthHeader = (): Record<string, string> => {
    try {
      const authStore = useAuthStore()
      return authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}
    } catch {
      return {}
    }
  }

  const request = async (method: string, endpoint: string, data: any = null, options: RequestInit = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const url = `${apiBaseUrl}${endpoint}`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      }

      const fetchOptions: RequestInit = {
        method,
        headers,
        credentials: 'include', // Pre cookies (Sanctum)
        ...options,
      }

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        fetchOptions.body = JSON.stringify(data) as BodyInit
      }

      const response = await fetch(url, fetchOptions)

      // Ak je unauthorized (401), logout
      if (response.status === 401) {
        try {
          const authStore = useAuthStore()
          await authStore.logout()
        } catch (e) {
          console.error('Logout failed:', e)
        }
        throw new Error('Unauthorized')
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : 'Unknown error'
      error.value = errMessage
      console.error(`API Error [${method} ${endpoint}]:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // HTTP Methods
    get: (endpoint: string, options?: RequestInit) => request('GET', endpoint, null, options),
    post: (endpoint: string, data: any, options?: RequestInit) => request('POST', endpoint, data, options),
    put: (endpoint: string, data: any, options?: RequestInit) => request('PUT', endpoint, data, options),
    patch: (endpoint: string, data: any, options?: RequestInit) => request('PATCH', endpoint, data, options),
    delete: (endpoint: string, options?: RequestInit) => request('DELETE', endpoint, null, options),
  }
}
