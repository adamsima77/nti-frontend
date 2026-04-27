export const useApi = () => {
  const config = useRuntimeConfig()
  const base = import.meta.server ? config.apiBase : config.public.apiBase

  const getAuthHeader = (): Record<string, string> => {
    try {
      const { token } = useAuthStore()
      return token ? { Authorization: `Bearer ${token}` } : {}
    } catch { return {} }
  }

  const apiFetch = $fetch.create({
    baseURL: base,
    credentials: 'include',
    onRequest({ options }) {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      }
    },
    async onResponseError({ response }) {
      if (response.status === 401) {
        try { await useAuthStore().logout() } catch (e) { console.error('Logout failed:', e) }
        throw new Error('Unauthorized')
      }
    },
  })

  return {
    get:    (endpoint: string, options?: any) => apiFetch(endpoint, { method: 'GET', ...options }),
    post:   (endpoint: string, data: any, options?: any) => apiFetch(endpoint, { method: 'POST', body: data, ...options }),
    put:    (endpoint: string, data: any, options?: any) => apiFetch(endpoint, { method: 'PUT', body: data, ...options }),
    patch:  (endpoint: string, data: any, options?: any) => apiFetch(endpoint, { method: 'PATCH', body: data, ...options }),
    delete: (endpoint: string, options?: any) => apiFetch(endpoint, { method: 'DELETE', ...options }),
  }
}